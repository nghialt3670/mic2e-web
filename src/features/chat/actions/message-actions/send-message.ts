"use server"

import { auth } from "@/auth";
import { db } from "@/lib/drizzle/db";
import { chats, messages } from "@/lib/drizzle/schema";
import { type Message } from "@/lib/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { withErrorHandler } from "@/utils/server/server-action-handlers";

interface SendMessageRequest {
    chatId: string;
    message: Omit<Message, "id" | "chatId" | "sender" | "createdAt">;
}

export const sendMessage = withErrorHandler<SendMessageRequest, Message>(async ({ chatId, message }) => {
    const session = await auth();
    if (!session?.user?.id) {
        return { message: "Unauthorized", code: 401 }
    }

    const sessionUserId = session.user.id;

    const chat = await db.query.chats.findFirst({
        where: and(eq(chats.id, chatId), eq(chats.userId, sessionUserId as string)),
    });
    
    console.log(chat);

    if (!chat) {
        return { message: "Chat not found", code: 404 }
    }

    const userMessage = await db.insert(messages).values({
        chatId,
        sender: "user",
        text: message.text,
    }).returning().then(rows => rows[0]);

    const mockResponseMessage = {
        ...message,
    }

    const createdMessage = await db.insert(messages).values({
        chatId,
        sender: "assistant",
        text: mockResponseMessage.text,
    }).returning().then(rows => rows[0]);

    console.log(createdMessage);

    return { message: "Message sent successfully", code: 200, data: createdMessage }
})