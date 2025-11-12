"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import {
  attachments,
  chatCycles,
  chats,
  imageUploads,
  messages,
} from "@/lib/drizzle/drizzle-schema";
import {
  withAuthHandler,
  withErrorHandler,
} from "@/utils/server/server-action-handlers";
import { serverEnv } from "@/utils/server/server-env";
import { desc, eq } from "drizzle-orm";

import { MessageDetail } from "../../types";

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

export const getResponse = withErrorHandler(
  withAuthHandler<GetResponseRequest, MessageDetail>(
    async ({ userId, chatId }) => {
      const chat = await drizzleClient.query.chats.findFirst({
        where: eq(chats.id, chatId),
      });
      if (!chat) {
        return { message: "Chat not found", code: 404 };
      }
      if (chat.userId !== userId) {
        return { message: "Unauthorized", code: 401 };
      }

      const lastChatCycle = await drizzleClient.query.chatCycles.findFirst({
        where: eq(chatCycles.chatId, chatId),
        orderBy: desc(chatCycles.createdAt),
        with: {
          requestMessage: {
            with: {
              attachments: {
                with: {
                  figUpload: true,
                  imageUpload: true,
                  thumbnailUpload: true,
                },
              },
            },
          },
          responseMessage: true,
        },
      });

      if (!lastChatCycle) {
        return { message: "No messages in chat", code: 404 };
      }
      if (lastChatCycle.responseMessage) {
        return { message: "Last message already has a response", code: 400 };
      }

      const allCycles = await drizzleClient.query.chatCycles.findMany({
        where: eq(chatCycles.chatId, chatId),
        orderBy: desc(chatCycles.createdAt),
      });

      const response = await fetch(`${serverEnv.CHAT2EDIT_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            text: lastChatCycle.requestMessage.text,
            attachments: lastChatCycle.requestMessage.attachments
              .filter((attachment) => attachment.figUpload)
              .map((attachment) => ({
                filename: attachment.figUpload!.filename,
                upload_path: attachment.figUpload!.path,
                upload_url: attachment.figUpload!.url,
              })),
          },
          history: allCycles
            .filter((cycle) => cycle.dataJson)
            .map((cycle) => cycle.dataJson),
          context_url: chat.contextUrl,
        }),
      });

      const payload = await response.json();
      const chatResponse = payload.data as ChatResponse;
      if (!chatResponse.message) {
        return {
          message: "There was an error processing the request.",
          code: 500,
        };
      }

      const responseMessage = await drizzleClient
        .insert(messages)
        .values({ text: chatResponse.message.text })
        .returning()
        .then((rows) => rows[0]);

      if (chatResponse.message.attachments?.length > 0) {
        const attachmentRecords = await Promise.all(
          chatResponse.message.attachments.map(async (attachment) => {
            const figUpload = await drizzleClient
              .insert(imageUploads)
              .values({
                filename: attachment.filename,
                path: attachment.upload_path,
                url: attachment.upload_url,
                width: 0,
                height: 0,
              })
              .returning()
              .then((rows) => rows[0]);

            return {
              messageId: responseMessage.id,
              type: "fig" as const,
              figUploadId: figUpload.id,
            };
          }),
        );

        await drizzleClient.insert(attachments).values(attachmentRecords);
      }

      await drizzleClient
        .update(chatCycles)
        .set({
          responseMessageId: responseMessage.id,
          contextUrl: chatResponse.context_url,
          dataJson: chatResponse.cycle,
        })
        .where(eq(chatCycles.id, lastChatCycle.id));

      const messageDetail = await drizzleClient.query.messages.findFirst({
        where: eq(messages.id, responseMessage.id),
        with: {
          attachments: {
            with: {
              figUpload: true,
              imageUpload: true,
              thumbnailUpload: true,
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
  ),
);
