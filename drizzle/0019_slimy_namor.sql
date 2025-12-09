ALTER TABLE "chats" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "status" SET DEFAULT 'idle'::text;--> statement-breakpoint
DROP TYPE "public"."chat_status";--> statement-breakpoint
CREATE TYPE "public"."chat_status" AS ENUM('created', 'requested', 'reponded', 'failed');--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "status" SET DEFAULT 'idle'::"public"."chat_status";--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "status" SET DATA TYPE "public"."chat_status" USING "status"::"public"."chat_status";