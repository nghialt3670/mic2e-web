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
import { uniqueIndex } from "drizzle-orm/pg-core";

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
// Surveys
// ─────────────────────────────────────────────
export const surveySamples = pgTable("survey_samples", {
  id: primaryKey("id"),
  userId: foreignKey("user_id", users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: createdAt("createdAt"),
  updatedAt: updatedAt("updatedAt"),
});

export const surveyChats = pgTable("survey_chats", {
  id: primaryKey("id"),
  sampleId: foreignKey("sample_id", surveySamples.id, { onDelete: "cascade" }).notNull(),
  sourceChatId: foreignKey("source_chat_id", chats.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: createdAt("createdAt"),
  updatedAt: updatedAt("updatedAt"),
});

export const questionTemplates = pgTable("question_templates", {
  id: primaryKey("id"),
  text: text("text").notNull(),
  createdAt: createdAt("createdAt"),
  updatedAt: updatedAt("updatedAt"),
});

export const questionTemplateOptions = pgTable("question_template_options", {
  id: primaryKey("id"),
  templateId: foreignKey("template_id", questionTemplates.id, {
    onDelete: "cascade",
  }).notNull(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: createdAt("createdAt"),
  updatedAt: updatedAt("updatedAt"),
});

export const surveyQuestions = pgTable("survey_questions", {
  id: primaryKey("id"),
  chatId: foreignKey("chat_id", surveyChats.id, { onDelete: "cascade" }).notNull(),
  templateId: foreignKey("template_id", questionTemplates.id, {
    onDelete: "restrict",
  }),
  text: text("text"), // Keep for backward compatibility during migration
  sortOrder: integer("sort_order").default(0),
  createdAt: createdAt("createdAt"),
  updatedAt: updatedAt("updatedAt"),
});

export const surveyOptions = pgTable("survey_options", {
  id: primaryKey("id"),
  questionId: foreignKey("question_id", surveyQuestions.id, {
    onDelete: "cascade",
  }).notNull(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: createdAt("createdAt"),
  updatedAt: updatedAt("updatedAt"),
});

export const surveyAnswers = pgTable(
  "survey_answers",
  {
    id: primaryKey("id"),
    userId: foreignKey("user_id", users.id, { onDelete: "cascade" }).notNull(),
    sampleId: foreignKey("sample_id", surveySamples.id, {
      onDelete: "cascade",
    }).notNull(),
    chatId: foreignKey("chat_id", surveyChats.id, { onDelete: "cascade" }).notNull(),
    questionId: foreignKey("question_id", surveyQuestions.id, {
      onDelete: "cascade",
    }).notNull(),
    optionId: foreignKey("option_id", surveyOptions.id, { onDelete: "cascade" }).notNull(),
    createdAt: createdAt("createdAt"),
    updatedAt: updatedAt("updatedAt"),
  },
  (table) => ({
    uq_user_question: uniqueIndex("uq_survey_answers_user_question").on(
      table.userId,
      table.questionId,
    ),
  }),
);

export const surveySamplePreferences = pgTable(
  "survey_sample_preferences",
  {
    id: primaryKey("id"),
    userId: foreignKey("user_id", users.id, { onDelete: "cascade" }).notNull(),
    sampleId: foreignKey("sample_id", surveySamples.id, {
      onDelete: "cascade",
    }).notNull(),
    preferredChatId: foreignKey("preferred_chat_id", surveyChats.id, {
      onDelete: "cascade",
    }).notNull(),
    createdAt: createdAt("createdAt"),
    updatedAt: updatedAt("updatedAt"),
  },
  (table) => ({
    uq_user_sample: uniqueIndex("uq_survey_sample_preferences_user_sample").on(
      table.userId,
      table.sampleId,
    ),
  }),
);

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

export const surveySamplesRelations = relations(surveySamples, ({ one, many }) => ({
  user: one(users, {
    fields: [surveySamples.userId],
    references: [users.id],
  }),
  chats: many(surveyChats),
  answers: many(surveyAnswers),
}));

export const surveyChatsRelations = relations(surveyChats, ({ one, many }) => ({
  sample: one(surveySamples, {
    fields: [surveyChats.sampleId],
    references: [surveySamples.id],
  }),
  questions: many(surveyQuestions),
  answers: many(surveyAnswers),
}));

export const questionTemplatesRelations = relations(questionTemplates, ({ many }) => ({
  options: many(questionTemplateOptions),
  surveyQuestions: many(surveyQuestions),
}));

export const questionTemplateOptionsRelations = relations(questionTemplateOptions, ({ one }) => ({
  template: one(questionTemplates, {
    fields: [questionTemplateOptions.templateId],
    references: [questionTemplates.id],
  }),
}));

export const surveyQuestionsRelations = relations(surveyQuestions, ({ one, many }) => ({
  chat: one(surveyChats, {
    fields: [surveyQuestions.chatId],
    references: [surveyChats.id],
  }),
  template: one(questionTemplates, {
    fields: [surveyQuestions.templateId],
    references: [questionTemplates.id],
  }),
  options: many(surveyOptions),
  answers: many(surveyAnswers),
}));

export const surveyOptionsRelations = relations(surveyOptions, ({ one, many }) => ({
  question: one(surveyQuestions, {
    fields: [surveyOptions.questionId],
    references: [surveyQuestions.id],
  }),
  answers: many(surveyAnswers),
}));

export const surveyAnswersRelations = relations(surveyAnswers, ({ one }) => ({
  user: one(users, {
    fields: [surveyAnswers.userId],
    references: [users.id],
  }),
  sample: one(surveySamples, {
    fields: [surveyAnswers.sampleId],
    references: [surveySamples.id],
  }),
  chat: one(surveyChats, {
    fields: [surveyAnswers.chatId],
    references: [surveyChats.id],
  }),
  question: one(surveyQuestions, {
    fields: [surveyAnswers.questionId],
    references: [surveyQuestions.id],
  }),
  option: one(surveyOptions, {
    fields: [surveyAnswers.optionId],
    references: [surveyOptions.id],
  }),
}));

export const surveySamplePreferencesRelations = relations(
  surveySamplePreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [surveySamplePreferences.userId],
      references: [users.id],
    }),
    sample: one(surveySamples, {
      fields: [surveySamplePreferences.sampleId],
      references: [surveySamples.id],
    }),
    preferredChat: one(surveyChats, {
      fields: [surveySamplePreferences.preferredChatId],
      references: [surveyChats.id],
    }),
  }),
);

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
export type SurveySample = typeof surveySamples.$inferSelect;
export type SurveyChat = typeof surveyChats.$inferSelect;
export type QuestionTemplate = typeof questionTemplates.$inferSelect;
export type QuestionTemplateOption = typeof questionTemplateOptions.$inferSelect;
export type SurveyQuestion = typeof surveyQuestions.$inferSelect;
export type SurveyOption = typeof surveyOptions.$inferSelect;
export type SurveyAnswer = typeof surveyAnswers.$inferSelect;
export type SurveySamplePreference = typeof surveySamplePreferences.$inferSelect;