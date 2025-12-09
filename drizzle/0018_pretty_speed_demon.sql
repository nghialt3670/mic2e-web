ALTER TABLE "users" ALTER COLUMN "createdAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updatedAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_cycles" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_cycles" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "image_uploads" ADD COLUMN "path" text NOT NULL;--> statement-breakpoint
ALTER TABLE "image_uploads" ADD COLUMN "url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "image_uploads" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "image_uploads" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "attachments" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "chat_cycles" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "chat_cycles" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "image_uploads" DROP COLUMN "file_id";--> statement-breakpoint
ALTER TABLE "image_uploads" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "image_uploads" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "updated_at";