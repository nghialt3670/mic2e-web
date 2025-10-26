import { relations } from "drizzle-orm";
import { integer, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text("name"),
  email: text("email").unique(),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const chatStatus = pgEnum("chat_status", ["idle", "requesting", "responding", "failed"]);

export const chats = pgTable("chats", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  title: text("title"),
  status: chatStatus("status").notNull().default("idle"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const chat2editCycles = pgTable("chat2editCycles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  chatId: text("chatId")
    .notNull()
    .references(() => chats.id),
  data: jsonb("data").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const messages = pgTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  chatId: text("chatId")
    .notNull()
    .references(() => chats.id),
  sender: text("sender").notNull(),
  text: text("text"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const attachments = pgTable("attachments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  url: text("url").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  messageId: text("messageId")
    .notNull()
    .references(() => messages.id),
});

export const thumbnails = pgTable("thumbnails", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  url: text("url").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  attachmentId: text("attachmentId")
    .notNull()
    .references(() => attachments.id),
});

export const usersRelations = relations(users, ({ many }) => ({
  chats: many(chats),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id],
  }),
  messages: many(messages),
  chat2editCycles: many(chat2editCycles),
}));

export const chat2editCyclesRelations = relations(
  chat2editCycles,
  ({ one }) => ({
    chat: one(chats, {
      fields: [chat2editCycles.chatId],
      references: [chats.id],
    }),
  }),
);

export const messagesRelations = relations(messages, ({ one, many }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  attachments: many(attachments),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  message: one(messages, {
    fields: [attachments.messageId],
    references: [messages.id],
  }),
  thumbnail: one(thumbnails, {
    fields: [attachments.id],
    references: [thumbnails.attachmentId],
  }),
}));

export const thumbnailsRelations = relations(thumbnails, ({ one }) => ({
  attachment: one(attachments, {
    fields: [thumbnails.attachmentId],
    references: [attachments.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Attachment = typeof attachments.$inferSelect;
export type Thumbnail = typeof thumbnails.$inferSelect;
export type Chat2editCycle = typeof chat2editCycles.$inferSelect;
