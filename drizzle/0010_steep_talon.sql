CREATE TYPE "public"."chat_status" AS ENUM('idle', 'requesting', 'responding', 'failed');--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "status" "chat_status" DEFAULT 'idle' NOT NULL;