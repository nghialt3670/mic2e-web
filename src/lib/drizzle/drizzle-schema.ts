import { relations } from "drizzle-orm";
import {
  PgColumn,
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const primaryKey = (name: string) =>
  text(name)
    .primaryKey()
    .$defaultFn(() => uuidv4());

const foreignKey = (
  name: string,
  references: PgColumn<any>,
  options?: { onDelete?: "cascade" | "set null" | "restrict" | "no action" },
) => text(name).references(() => references, options);

const createdAt = (name: string) => timestamp(name).defaultNow().notNull();

const updatedAt = (name: string) =>
  timestamp(name)
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull();

// ─────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────
export const users = pgTable("users", {
  id: primaryKey("id"),
  name: text("name"),
  email: text("email").unique(),
  imageUrl: text("imageUrl"),
  createdAt: createdAt("createdAt"),
  updatedAt: updatedAt("updatedAt"),
});

// ─────────────────────────────────────────────
// Settings
// ─────────────────────────────────────────────
export const settings = pgTable("settings", {
  id: primaryKey("id"),
  userId: foreignKey("user_id", users.id, { onDelete: "cascade" }).notNull(),
  llmModel: text("llm_model").notNull().default("gemini-2.5-flash"),
  maxImageWidth: integer("max_image_width").notNull().default(480),
  maxImageHeight: integer("max_image_height").notNull().default(360),
  createdAt: createdAt("createdAt"),
  updatedAt: updatedAt("updatedAt"),
});

// ─────────────────────────────────────────────
// Chats
// ─────────────────────────────────────────────
export const chats = pgTable("chats", {
  id: primaryKey("id"),
  userId: foreignKey("user_id", users.id).notNull(),
  settingsId: foreignKey("settings_id", settings.id),
  title: text("title"),
  failed: boolean("failed").default(false),
  createdAt: createdAt("createdAt"),
  updatedAt: updatedAt("updatedAt"),
});

// ─────────────────────────────────────────────
// Contexts
// ─────────────────────────────────────────────
export const contexts = pgTable("contexts", {
  id: primaryKey("id"),
  fileId: text("file_id").notNull(),
  createdAt: createdAt("createdAt"),
  updatedAt: updatedAt("updatedAt"),
});

// ─────────────────────────────────────────────
// Messages
// ─────────────────────────────────────────────
export const messages = pgTable("messages", {
  id: primaryKey("id"),
  text: text("text").notNull(),
  createdAt: createdAt("createdAt"),
  updatedAt: updatedAt("updatedAt"),
});

// ─────────────────────────────────────────────
// Cycles
// ─────────────────────────────────────────────
export const cycles = pgTable("cycles", {
  id: primaryKey("id"),
  chatId: foreignKey("chat_id", chats.id, { onDelete: "cascade" }).notNull(),
  requestId: foreignKey("request_id", messages.id).notNull(),
  responseId: foreignKey("response_id", messages.id),
  contextId: foreignKey("context_id", contexts.id),
  jsonData: jsonb("json_data"),
  createdAt: createdAt("createdAt"),
  updatedAt: updatedAt("updatedAt"),
});

// ─────────────────────────────────────────────
// Thumbnails
// ─────────────────────────────────────────────
export const thumbnails = pgTable("thumbnails", {
  id: primaryKey("id"),
  fileId: text("file_id").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  createdAt: createdAt("createdAt"),
  updatedAt: updatedAt("updatedAt"),
});

// ─────────────────────────────────────────────
// Attachments
// ─────────────────────────────────────────────
export const attachments = pgTable("attachments", {
  id: primaryKey("id"),
  fileId: text("file_id").notNull(),
  filename: text("filename").notNull(),
  messageId: foreignKey("message_id", messages.id, {
    onDelete: "cascade",
  }).notNull(),
  thumbnailId: foreignKey("thumbnail_id", thumbnails.id),
  createdAt: createdAt("createdAt"),
  updatedAt: updatedAt("updatedAt"),
});

// ─────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  chats: many(chats),
  settings: many(settings),
}));

export const settingsRelations = relations(settings, ({ one, many }) => ({
  user: one(users, {
    fields: [settings.userId],
    references: [users.id],
  }),
  chats: many(chats),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id],
  }),
  settings: one(settings, {
    fields: [chats.settingsId],
    references: [settings.id],
  }),
  cycles: many(cycles),
}));

export const contextsRelations = relations(contexts, ({ many }) => ({
  cycles: many(cycles),
}));

export const cyclesRelations = relations(cycles, ({ one }) => ({
  chat: one(chats, {
    fields: [cycles.chatId],
    references: [chats.id],
  }),
  request: one(messages, {
    fields: [cycles.requestId],
    references: [messages.id],
    relationName: "request",
  }),
  response: one(messages, {
    fields: [cycles.responseId],
    references: [messages.id],
    relationName: "response",
  }),
  context: one(contexts, {
    fields: [cycles.contextId],
    references: [contexts.id],
    relationName: "context",
  }),
}));

export const messagesRelations = relations(messages, ({ many }) => ({
  attachments: many(attachments),
  asRequestMessageInCycle: many(cycles, {
    relationName: "request",
  }),
  asResponseMessageInCycle: many(cycles, {
    relationName: "response",
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  message: one(messages, {
    fields: [attachments.messageId],
    references: [messages.id],
  }),
  thumbnail: one(thumbnails, {
    fields: [attachments.thumbnailId],
    references: [thumbnails.id],
  }),
}));

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type Context = typeof contexts.$inferSelect;
export type Cycle = typeof cycles.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Thumbnail = typeof thumbnails.$inferSelect;
export type Attachment = typeof attachments.$inferSelect;
