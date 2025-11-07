import { relations } from "drizzle-orm";
import {
  PgColumn,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";

const uuidPrimaryKey = (name: string) =>
  text(name)
    .primaryKey()
    .$defaultFn(() => uuidv4());

const foreignKey = (name: string, references: PgColumn<any>) =>
  text(name).references(() => references);

export const users = pgTable("users", {
  id: uuidPrimaryKey("id"),
  name: text("name"),
  email: text("email").unique(),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const chatStatus = pgEnum("chat_status", [
  "idle",
  "requesting",
  "responding",
  "failed",
]);

export const chats = pgTable("chats", {
  id: uuidPrimaryKey("id"),
  userId: foreignKey("user_id", users.id).notNull(),
  title: text("title"),
  status: chatStatus("status").notNull().default("idle"),
  contextUrl: text("context_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuidPrimaryKey("id"),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatCycles = pgTable("chat_cycles", {
  id: uuidPrimaryKey("id"),
  chatId: foreignKey("chat_id", chats.id).notNull(),
  requestMessageId: foreignKey("request_message_id", messages.id).notNull(),
  responseMessageId: foreignKey("response_message_id", messages.id),
  contextUrl: text("context_url"),
  dataJson: jsonb("data_json"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const imageUploads = pgTable("image_uploads", {
  id: uuidPrimaryKey("id"),
  filename: text("filename").notNull(),
  path: text("path").notNull(),
  url: text("url").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const attachmentType = pgEnum("attachment_type", ["fig"]);

export const attachments = pgTable("attachments", {
  id: uuidPrimaryKey("id"),
  messageId: foreignKey("message_id", messages.id).notNull(),
  type: attachmentType("type").notNull(),
  figUploadId: foreignKey("fig_id", imageUploads.id),
  imageUploadId: foreignKey("image_id", imageUploads.id),
  thumbnailUploadId: foreignKey("thumbnail_id", imageUploads.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  chatCycles: many(chatCycles),
}));

export const chatCyclesRelations = relations(chatCycles, ({ one }) => ({
  chat: one(chats, {
    fields: [chatCycles.chatId],
    references: [chats.id],
  }),
  requestMessage: one(messages, {
    fields: [chatCycles.requestMessageId],
    references: [messages.id],
    relationName: "requestMessage",
  }),
  responseMessage: one(messages, {
    fields: [chatCycles.responseMessageId],
    references: [messages.id],
    relationName: "responseMessage",
  }),
}));

export const messagesRelations = relations(messages, ({ many }) => ({
  attachments: many(attachments),
  asRequestMessageInCycle: many(chatCycles, {
    relationName: "requestMessage",
  }),
  asResponseMessageInCycle: many(chatCycles, {
    relationName: "responseMessage",
  }),
}));

export const imageUploadsRelations = relations(imageUploads, ({ one }) => ({
  asFigUploadInAttachment: one(attachments, {
    fields: [imageUploads.id],
    references: [attachments.figUploadId],
    relationName: "figUpload",
  }),
  asImageUploadInAttachment: one(attachments, {
    fields: [imageUploads.id],
    references: [attachments.imageUploadId],
    relationName: "imageUpload",
  }),
  asThumbnailUploadInAttachment: one(attachments, {
    fields: [imageUploads.id],
    references: [attachments.thumbnailUploadId],
    relationName: "thumbnailUpload",
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  message: one(messages, {
    fields: [attachments.messageId],
    references: [messages.id],
  }),
  figUpload: one(imageUploads, {
    fields: [attachments.figUploadId],
    references: [imageUploads.id],
    relationName: "figUpload",
  }),
  imageUpload: one(imageUploads, {
    fields: [attachments.imageUploadId],
    references: [imageUploads.id],
    relationName: "imageUpload",
  }),
  thumbnailUpload: one(imageUploads, {
    fields: [attachments.thumbnailUploadId],
    references: [imageUploads.id],
    relationName: "thumbnailUpload",
  }),
}));

export type User = typeof users.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type ChatCycle = typeof chatCycles.$inferSelect;
export type ChatStatus = (typeof chatStatus.enumValues)[number];
export type Message = typeof messages.$inferSelect;
export type ImageUpload = typeof imageUploads.$inferSelect;
export type AttachmentType = (typeof attachmentType.enumValues)[number];
export type Attachment = typeof attachments.$inferSelect;
