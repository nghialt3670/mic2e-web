"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import {
  Attachment,
  Thumbnail,
  attachments,
  chats,
  messages,
  thumbnails,
} from "@/lib/drizzle/drizzle-schema";
import { type Message } from "@/lib/drizzle/drizzle-schema";
import { withErrorHandler } from "@/utils/server/server-action-handlers";
import { getSessionUserId } from "@/utils/server/session";
import { and, desc, eq } from "drizzle-orm";

interface CreateThumbnailData
  extends Omit<Thumbnail, "id" | "attachmentId" | "createdAt"> {}

interface CreateAttachmentData
  extends Omit<Attachment, "id" | "messageId" | "createdAt"> {
  thumbnail?: CreateThumbnailData;
}

interface CreateMessageData
  extends Omit<Message, "id" | "chatId" | "sender" | "createdAt"> {
  attachments?: CreateAttachmentData[];
}

interface CreateMessageRequest {
  chatId: string;
  message: CreateMessageData;
}

export const createMessage = withErrorHandler<CreateMessageRequest, Message>(
  async ({ chatId, message }) => {
    const userId = await getSessionUserId();
    if (!userId) {
      return { message: "Unauthorized", code: 401 };
    }

    const chat = await drizzleClient.query.chats.findFirst({
      where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
    });
    if (!chat) {
      return { message: "Chat not found", code: 404 };
    }

    const lastMessage = await drizzleClient.query.messages.findFirst({
      where: and(eq(messages.chatId, chatId)),
      orderBy: desc(messages.createdAt),
    });

    const createdMessage =
      lastMessage && lastMessage.sender === "user"
        ? await drizzleClient
            .update(messages)
            .set({
              text: message.text,
            })
            .where(eq(messages.id, lastMessage.id))
            .returning()
            .then((rows) => rows[0])
        : await drizzleClient
            .insert(messages)
            .values({
              chatId,
              sender: "user",
              text: message.text,
            })
            .returning()
            .then((rows) => rows[0]);

    if (message.attachments) {
      const createdAttachments = await drizzleClient
        .insert(attachments)
        .values(
          message.attachments.map((attachment) => ({
            messageId: createdMessage.id,
            url: attachment.url,
          })),
        )
        .returning();

      await drizzleClient.insert(thumbnails).values(
        message.attachments
          .map((attachment) => attachment.thumbnail)
          .filter((thumbnail) => thumbnail !== undefined)
          .map((thumbnail, i) => ({
            attachmentId: createdAttachments[i].id,
            url: thumbnail.url,
            width: thumbnail.width,
            height: thumbnail.height,
          })),
      );
    }

    await drizzleClient
      .update(chats)
      .set({
        title: message.text,
        updatedAt: new Date(),
      })
      .where(eq(chats.id, chatId));

    return {
      message: "Message created successfully",
      code: 200,
      data: createdMessage,
    };
  },
);
