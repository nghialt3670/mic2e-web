ALTER TABLE "attachments" ALTER COLUMN "fig_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_cycles" ALTER COLUMN "data_json" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "text" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "updated_at" timestamp DEFAULT now();