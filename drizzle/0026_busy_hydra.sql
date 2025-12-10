ALTER TABLE "attachments" DROP CONSTRAINT "attachments_message_id_messages_id_fk";
--> statement-breakpoint
ALTER TABLE "cycles" DROP CONSTRAINT "cycles_chat_id_chats_id_fk";
--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycles" ADD CONSTRAINT "cycles_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;