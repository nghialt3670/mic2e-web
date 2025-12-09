CREATE TABLE "contexts" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cycles" (
	"id" text PRIMARY KEY NOT NULL,
	"chat_id" text NOT NULL,
	"request_id" text NOT NULL,
	"response_id" text,
	"context_id" text,
	"json_data" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thumbnails" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_cycles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "image_uploads" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "chat_cycles" CASCADE;--> statement-breakpoint
DROP TABLE "image_uploads" CASCADE;--> statement-breakpoint
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_fig_id_image_uploads_id_fk";
--> statement-breakpoint
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_thumbnail_id_image_uploads_id_fk";
--> statement-breakpoint
ALTER TABLE "attachments" ALTER COLUMN "thumbnail_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "file_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cycles" ADD CONSTRAINT "cycles_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycles" ADD CONSTRAINT "cycles_request_id_messages_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycles" ADD CONSTRAINT "cycles_response_id_messages_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycles" ADD CONSTRAINT "cycles_context_id_contexts_id_fk" FOREIGN KEY ("context_id") REFERENCES "public"."contexts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_thumbnail_id_thumbnails_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."thumbnails"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" DROP COLUMN "fig_id";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "context_url";