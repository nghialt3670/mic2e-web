"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import { Message, messages } from "@/lib/drizzle/drizzle-schema";
import { withAuthHandler, withErrorHandler } from "@/utils/server/action-utils";

interface MessageCreateRequest {
  message: Omit<Message, "id" | "createdAt" | "updatedAt">;
}

export const createMessage = withErrorHandler(
  withAuthHandler<MessageCreateRequest, Message>(async ({ message }) => {
    const [createdMessage] = await drizzleClient
      .insert(messages)
      .values(message)
      .returning();

    return {
      message: "Message created successfully.",
      code: 200,
      data: createdMessage,
    };
  }),
);
