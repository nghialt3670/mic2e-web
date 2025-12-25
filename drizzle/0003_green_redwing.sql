CREATE TABLE "question_template_options" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "survey_samples" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "survey_questions" ADD COLUMN "template_id" text;--> statement-breakpoint
ALTER TABLE "question_template_options" ADD CONSTRAINT "question_template_options_template_id_question_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."question_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_questions" ADD CONSTRAINT "survey_questions_template_id_question_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."question_templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_questions" DROP COLUMN "text";