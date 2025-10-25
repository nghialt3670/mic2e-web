CREATE TABLE "thumbnails" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"attachmentId" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "thumbnails" ADD CONSTRAINT "thumbnails_attachmentId_attachments_id_fk" FOREIGN KEY ("attachmentId") REFERENCES "public"."attachments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" DROP COLUMN "previewUrl";--> statement-breakpoint
ALTER TABLE "attachments" DROP COLUMN "width";--> statement-breakpoint
ALTER TABLE "attachments" DROP COLUMN "height";