"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import {
  attachments,
  chat2editCycles,
  chats,
  messages,
  thumbnails,
} from "@/lib/drizzle/drizzle-schema";
import { Thumbnail } from "@/lib/drizzle/drizzle-schema";
import { withErrorHandler } from "@/utils/server/server-action-handlers";
import { serverEnv } from "@/utils/server/server-env";
import { getSessionUserId } from "@/utils/server/session";
import { and, desc, eq } from "drizzle-orm";

import { MessageDetail } from "../../types";
import { CreateAttachmentData } from "../message-actions/create-message";

interface GetResponseRequest {
  chatId: string;
}

interface ChatResponse {
  message: {
    text: string;
    attachments: {
      filename: string;
      upload_path: string;
      upload_url: string;
    }[];
  };
  cycle: Record<string, any>;
  context_url: string;
}

export const getResponse = withErrorHandler<GetResponseRequest, MessageDetail>(
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          text: lastMessage.text,
          attachments: lastMessage.attachments.map((attachment) => ({
            filename: attachment.originalFilename || attachment.url?.split("/").pop() || "",
            upload_path: attachment.path || "",
            upload_url: attachment.url || "",
          })),
        },
        history: cycles.map((cycle) => cycle.data),
        context_url: chat.contextUrl,
      }),
    });

    console.log(JSON.stringify({
      message: {
        text: lastMessage.text,
        attachments: lastMessage.attachments.map((attachment) => ({
          filename: attachment.originalFilename || attachment.url?.split("/").pop() || "",
          upload_path: attachment.path || "",
          upload_url: attachment.url || "",
        })),
      },
      history: cycles.map((cycle) => cycle.data),
    }))

    const payload = await response.json();
    const chatResponse = payload.data as ChatResponse;
    if (!chatResponse.message) {
      return {
        message: "There was an error processing the request.",
        code: 500,
      };
    }

    await drizzleClient
      .insert(chat2editCycles)
      .values({
        chatId,
        data: chatResponse.cycle,
      })
      .returning()
      .then((rows) => rows[0]);

    const createdMessage = await drizzleClient
      .insert(messages)
      .values({
        chatId,
        sender: "assistant",
        text: chatResponse.message.text,
      })
      .returning()
      .then((rows) => rows[0]);

    if (chatResponse.message.attachments) {
       await drizzleClient
        .insert(attachments)
        .values(
          chatResponse.message.attachments.map(
            (attachment) => ({
              messageId: createdMessage.id,
              originalFilename: attachment.filename,
              path: attachment.upload_path,
              url: attachment.upload_url,
            }),
          ),
        )
    }

    const messageDetail = await drizzleClient.query.messages.findFirst({
      where: eq(messages.id, createdMessage.id),
      with: {
        attachments: {
          with: {
            thumbnail: true,
          },
        },
      },
    });

    return {
      message: "Response fetched successfully",
      code: 200,
      data: messageDetail,
    };
  },
);
