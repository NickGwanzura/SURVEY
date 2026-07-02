ALTER TABLE "technicians_survey" ADD COLUMN "data_consent_accepted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "technicians_survey" ADD COLUMN "data_consent_accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "technicians_survey" ADD COLUMN "data_consent_ip_address" text;--> statement-breakpoint
ALTER TABLE "technicians_survey" ADD COLUMN "data_consent_user_agent" text;
