"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import {
  ImageUpload,
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
import { desc, eq } from "drizzle-orm";

import { AttachmentDetail, MessageDetail } from "../../types";

export type CreateImageUploadData = Omit<
  ImageUpload,
  "id" | "createdAt" | "updatedAt"
>;

export interface CreateAttachmentData
  extends Omit<
    AttachmentDetail,
    | "id"
    | "messageId"
    | "figUploadId"
    | "imageUploadId"
    | "figUploadId"
    | "imageUploadId"
    | "thumbnailUploadId"
    | "figUpload"
    | "imageUpload"
    | "thumbnailUpload"
    | "createdAt"
    | "updatedAt"
  > {
  figUpload?: CreateImageUploadData;
  imageUpload?: CreateImageUploadData;
  thumbnailUpload?: CreateImageUploadData;
}

export interface CreateMessageData
  extends Omit<
    MessageDetail,
    "id" | "attachments" | "createdAt" | "updatedAt"
  > {
  attachments: CreateAttachmentData[];
}

export interface CreateMessageRequest {
  chatId: string;
  message: CreateMessageData;
}

export const createMessage = withErrorHandler(
  withAuthHandler<CreateMessageRequest, MessageDetail>(
    async ({ userId, chatId, message }) => {
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
          requestMessage: true,
          responseMessage: true,
        },
      });

      if (lastChatCycle && !lastChatCycle.responseMessage) {
        return { message: "Last message is not a response", code: 400 };
      }

      const requestMessage = await drizzleClient
        .insert(messages)
        .values([{ text: message.text }])
        .returning()
        .then((rows) => rows[0]);

      const attachmentRecords = await Promise.all(
        message.attachments.map(async (attachment) => {
          if (!attachment.figUpload) {
            throw new Error("figUpload is required for fig attachments");
          }

          const figUploadData = attachment.figUpload;
          const figUpload = await drizzleClient
            .insert(imageUploads)
            .values([figUploadData])
            .returning()
            .then((rows) => rows[0]);

          const imageUpload = attachment.imageUpload
            ? await drizzleClient
                .insert(imageUploads)
                .values([attachment.imageUpload])
                .returning()
                .then((rows) => rows[0])
            : null;

          const thumbnailUpload = attachment.thumbnailUpload
            ? await drizzleClient
                .insert(imageUploads)
                .values([attachment.thumbnailUpload])
                .returning()
                .then((rows) => rows[0])
            : null;

          return {
            messageId: requestMessage.id,
            type: attachment.type,
            figUploadId: figUpload.id,
            imageUploadId: imageUpload?.id,
            thumbnailUploadId: thumbnailUpload?.id,
          };
        }),
      );

      if (attachmentRecords.length > 0) {
        await drizzleClient.insert(attachments).values(attachmentRecords);
      }

      await drizzleClient.insert(chatCycles).values([{
        chatId,
        requestMessageId: requestMessage.id,
      }]);

      const messageDetail = await drizzleClient.query.messages.findFirst({
        where: eq(messages.id, requestMessage.id),
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
        message: "Message created successfully",
        code: 200,
        data: messageDetail,
      };
    },
  ),
);
