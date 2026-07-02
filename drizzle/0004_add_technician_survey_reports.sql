CREATE TYPE "public"."audit_actor_type" AS ENUM('admin', 'applicant');--> statement-breakpoint
ALTER TYPE "public"."education_level" ADD VALUE 'national_certificate' BEFORE 'diploma';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_admin_user_id" uuid,
	"event_type" text NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "technician_survey_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_title" text NOT NULL,
	"report_type" text DEFAULT 'technician-survey' NOT NULL,
	"survey_name" text NOT NULL,
	"reporting_period_start" timestamp with time zone NOT NULL,
	"reporting_period_end" timestamp with time zone NOT NULL,
	"total_responses" integer NOT NULL,
	"generated_by" uuid NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"pdf_url" text,
	"ai_summary" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ALTER COLUMN "actor_admin_user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "actor_type" "audit_actor_type" DEFAULT 'admin' NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "actor_display" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "system_events" ADD CONSTRAINT "system_events_actor_admin_user_id_admin_users_id_fk" FOREIGN KEY ("actor_admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "technician_survey_reports" ADD CONSTRAINT "technician_survey_reports_generated_by_admin_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "password_reset_tokens_admin_user_idx" ON "password_reset_tokens" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "password_reset_tokens_token_hash_idx" ON "password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_events_event_type_idx" ON "system_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_events_actor_idx" ON "system_events" USING btree ("actor_admin_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_events_created_at_idx" ON "system_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tsr_generated_at_idx" ON "technician_survey_reports" USING btree ("generated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tsr_generated_by_idx" ON "technician_survey_reports" USING btree ("generated_by");