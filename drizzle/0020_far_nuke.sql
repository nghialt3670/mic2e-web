ALTER TABLE "chats" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "status" SET DEFAULT 'CREATED'::text;--> statement-breakpoint
DROP TYPE "public"."chat_status";--> statement-breakpoint
CREATE TYPE "public"."chat_status" AS ENUM('CREATED', 'REQUESTED', 'RESPONDED', 'FAILED');--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "status" SET DEFAULT 'CREATED'::"public"."chat_status";--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "status" SET DATA TYPE "public"."chat_status" USING "status"::"public"."chat_status";