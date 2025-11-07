CREATE TYPE "public"."attachment_type" AS ENUM('fig');--> statement-breakpoint
CREATE TABLE "chat_cycles" (
	"id" text PRIMARY KEY NOT NULL,
	"chat_id" text NOT NULL,
	"context_url" text,
	"data_json" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "image_uploads" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"path" text NOT NULL,
	"url" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "chat2editCycles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "thumbnails" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "chat2editCycles" CASCADE;--> statement-breakpoint
DROP TABLE "thumbnails" CASCADE;--> statement-breakpoint
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_messageId_messages_id_fk";
--> statement-breakpoint
ALTER TABLE "chats" DROP CONSTRAINT "chats_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_chatId_chats_id_fk";
--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "message_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "type" "attachment_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "fig_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "image_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "thumbnail_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "context_url" text;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "chat_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "imageUrl" text;--> statement-breakpoint
ALTER TABLE "chat_cycles" ADD CONSTRAINT "chat_cycles_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_fig_id_image_uploads_id_fk" FOREIGN KEY ("fig_id") REFERENCES "public"."image_uploads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_image_id_image_uploads_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."image_uploads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_thumbnail_id_image_uploads_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."image_uploads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" DROP COLUMN "originalFilename";--> statement-breakpoint
ALTER TABLE "attachments" DROP COLUMN "path";--> statement-breakpoint
ALTER TABLE "attachments" DROP COLUMN "url";--> statement-breakpoint
ALTER TABLE "attachments" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "attachments" DROP COLUMN "messageId";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "contextUrl";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "chatId";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "image";