"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import {
  attachments,
  chat2editCycles,
  chats,
  messages,
} from "@/lib/drizzle/drizzle-schema";
import { type Message } from "@/lib/drizzle/drizzle-schema";
import { withErrorHandler } from "@/utils/server/server-action-handlers";
import { serverEnv } from "@/utils/server/server-env";
import { getSessionUserId } from "@/utils/server/session";
import { and, desc, eq } from "drizzle-orm";

interface GetResponseRequest {
  chatId: string;
}

export const getResponse = withErrorHandler<GetResponseRequest, Message>(
  async ({ chatId }) => {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return { message: "Unauthorized", code: 401 };
    }

    const chat = await drizzleClient.query.chats.findFirst({
      where: and(eq(chats.id, chatId), eq(chats.userId, sessionUserId)),
    });
    if (!chat) {
      return { message: "Chat not found", code: 404 };
    }

    const lastMessage = await drizzleClient.query.messages.findFirst({
      where: and(eq(messages.chatId, chatId)),
      orderBy: desc(messages.createdAt),
      with: {
        attachments: true,
      },
    });
    if (!lastMessage) {
      return { message: "Last message not found", code: 404 };
    }
    if (lastMessage.sender === "assistant") {
      return { message: "Last message is from assistant", code: 400 };
    }

    const cycles = await drizzleClient.query.chat2editCycles.findMany({
      where: eq(chat2editCycles.chatId, chatId),
    });

    const response = await fetch(`${serverEnv.CHAT2EDIT_API_URL}/chat`, {
      method: "POST",
      body: JSON.stringify({
        message: {
          text: lastMessage.text,
          attachment_urls: lastMessage.attachments.map(
            (attachment) => attachment.url,
          ),
        },
        history: cycles,
      }),
    });

    const payload = await response.json();
    const newCycle = payload.data;
    if (!newCycle.response) {
      return {
        message: "There was an error processing the request.",
        code: 500,
      };
    }

    await drizzleClient
      .insert(chat2editCycles)
      .values({
        chatId,
        data: newCycle,
      })
      .returning()
      .then((rows) => rows[0]);

    const createdMessage = await drizzleClient
      .insert(messages)
      .values({
        chatId,
        sender: "assistant",
        text: newCycle.response.text,
      })
      .returning()
      .then((rows) => rows[0]);

    const createdAttachments = await drizzleClient.insert(attachments).values(
      newCycle.response.attachment_urls.map((url: string) => ({
        messageId: createdMessage.id,
        url: url,
      })),
    );

    return {
      message: "Response fetched successfully",
      code: 200,
      data: {
        ...createdMessage,
        attachments: createdAttachments,
      },
    };
  },
);
