ALTER TABLE "image_uploads" ADD COLUMN "file_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "image_uploads" DROP COLUMN "path";--> statement-breakpoint
ALTER TABLE "image_uploads" DROP COLUMN "url";