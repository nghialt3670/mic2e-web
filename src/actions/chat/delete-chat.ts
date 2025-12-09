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
import { and, eq, inArray } from "drizzle-orm";

interface DeleteChatRequest {
  chatId: string;
}

interface DeleteChatResult {
  success: boolean;
}

export const deleteChat = withErrorHandler(
  withAuthHandler<DeleteChatRequest, DeleteChatResult>(
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

      // Find all chat cycles for this chat to collect related messages
      const cycles = await drizzleClient.query.chatCycles.findMany({
        where: eq(chatCycles.chatId, chatId),
      });

      const messageIds = Array.from(
        new Set(
          cycles.flatMap((cycle) => [
            cycle.requestMessageId,
            cycle.responseMessageId,
          ]),
        ),
      ).filter((id): id is string => !!id);

      if (messageIds.length > 0) {
        // Find attachments and related image uploads for these messages
        const relatedAttachments = await drizzleClient
          .select()
          .from(attachments)
          .where(inArray(attachments.messageId, messageIds));

        const imageUploadIds = Array.from(
          new Set(
            relatedAttachments.flatMap((a) => [
              a.figUploadId,
              a.imageUploadId,
              a.thumbnailUploadId,
            ]),
          ),
        ).filter((id): id is string => !!id);

        if (relatedAttachments.length > 0) {
          await drizzleClient.delete(attachments).where(
            inArray(
              attachments.id,
              relatedAttachments.map((a) => a.id),
            ),
          );
        }

        if (imageUploadIds.length > 0) {
          await drizzleClient
            .delete(imageUploads)
            .where(inArray(imageUploads.id, imageUploadIds));
        }

        // Delete chat cycles and messages
        await drizzleClient
          .delete(chatCycles)
          .where(eq(chatCycles.chatId, chatId));

        await drizzleClient
          .delete(messages)
          .where(inArray(messages.id, messageIds));
      }

      // Finally, delete the chat itself
      await drizzleClient
        .delete(chats)
        .where(and(eq(chats.id, chatId), eq(chats.userId, userId)));

      return {
        message: "Chat deleted successfully",
        code: 200,
        data: { success: true },
      };
    },
  ),
);
