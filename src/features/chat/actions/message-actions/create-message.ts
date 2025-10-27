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

import { MessageDetail } from "../../types";

export interface CreateThumbnailData
  extends Omit<Thumbnail, "id" | "attachmentId" | "createdAt"> {}

export interface CreateAttachmentData
  extends Omit<Attachment, "id" | "messageId" | "createdAt"> {
  thumbnail?: CreateThumbnailData;
}

export interface CreateMessageData
  extends Omit<Message, "id" | "chatId" | "sender" | "createdAt"> {
  attachments?: CreateAttachmentData[];
}

export interface CreateMessageRequest {
  chatId: string;
  message: CreateMessageData;
}

export const createMessage = withErrorHandler<
  CreateMessageRequest,
  MessageDetail
>(async ({ chatId, message }) => {
  const userId = await getSessionUserId();
  if (!userId) {
    return { message: "Unauthorized", code: 401 };
  }
  console.log("userId", userId);

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

  console.log("createdMessage", message.attachments);

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
          width: Math.round(thumbnail.width),
          height: Math.round(thumbnail.height),
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
    message: "Message created successfully",
    code: 200,
    data: messageDetail,
  };
});
