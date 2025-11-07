ALTER TABLE "messages" DROP CONSTRAINT "messages_chat_id_chats_id_fk";
--> statement-breakpoint
ALTER TABLE "attachments" ALTER COLUMN "image_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ALTER COLUMN "thumbnail_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_cycles" ADD COLUMN "request_message_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_cycles" ADD COLUMN "response_message_id" text;--> statement-breakpoint
ALTER TABLE "chat_cycles" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "chat_cycles" ADD CONSTRAINT "chat_cycles_request_message_id_messages_id_fk" FOREIGN KEY ("request_message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_cycles" ADD CONSTRAINT "chat_cycles_response_message_id_messages_id_fk" FOREIGN KEY ("response_message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "chat_id";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "sender";