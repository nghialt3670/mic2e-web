ALTER TABLE "attachments" ALTER COLUMN "thumbnail_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "filename" text NOT NULL;