CREATE TABLE "chat2editCycles" (
	"id" text PRIMARY KEY NOT NULL,
	"chatId" text NOT NULL,
	"data" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "previewUrl" text;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "width" integer;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "height" integer;--> statement-breakpoint
ALTER TABLE "chat2editCycles" ADD CONSTRAINT "chat2editCycles_chatId_chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "attachments" DROP COLUMN "size";--> statement-breakpoint
ALTER TABLE "attachments" DROP COLUMN "type";