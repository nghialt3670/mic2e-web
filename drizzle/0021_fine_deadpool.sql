ALTER TABLE "attachments" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "status";--> statement-breakpoint
DROP TYPE "public"."attachment_type";--> statement-breakpoint
DROP TYPE "public"."chat_status";