ALTER TABLE "attachments" DROP CONSTRAINT "attachments_image_id_image_uploads_id_fk";
--> statement-breakpoint
ALTER TABLE "attachments" DROP COLUMN "image_id";