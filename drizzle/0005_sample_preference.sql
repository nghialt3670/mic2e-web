CREATE TABLE "survey_sample_preferences" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL,
  "sample_id" text NOT NULL,
  "preferred_chat_id" text NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "survey_sample_preferences"
  ADD CONSTRAINT "survey_sample_preferences_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "survey_sample_preferences"
  ADD CONSTRAINT "survey_sample_preferences_sample_id_fkey"
  FOREIGN KEY ("sample_id") REFERENCES "survey_samples"("id") ON DELETE CASCADE;

ALTER TABLE "survey_sample_preferences"
  ADD CONSTRAINT "survey_sample_preferences_preferred_chat_id_fkey"
  FOREIGN KEY ("preferred_chat_id") REFERENCES "survey_chats"("id") ON DELETE CASCADE;

CREATE UNIQUE INDEX "uq_survey_sample_preferences_user_sample"
  ON "survey_sample_preferences" ("user_id", "sample_id");

