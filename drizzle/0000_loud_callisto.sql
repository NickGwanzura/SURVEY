CREATE TYPE "public"."admin_role" AS ENUM('admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."age_group" AS ENUM('under_25', '25_34', '35_44', '45_54', '55_64', '65_plus');--> statement-breakpoint
CREATE TYPE "public"."biggest_daily_challenge" AS ENUM('power_outages', 'forex_shortages', 'spare_parts', 'counterfeit', 'unsafe_conditions', 'customer_payment', 'training_opportunities', 'certification_access', 'transport_mobility', 'unqualified_competition', 'other');--> statement-breakpoint
CREATE TYPE "public"."education_level" AS ENUM('none', 'primary', 'o_level', 'a_level', 'vocational', 'diploma', 'degree', 'postgraduate');--> statement-breakpoint
CREATE TYPE "public"."energy_efficient_install" AS ENUM('always', 'on_request', 'sometimes', 'rarely', 'never');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."has_certification" AS ENUM('yes', 'no', 'studying');--> statement-breakpoint
CREATE TYPE "public"."load_shedding_frequency" AS ENUM('never', 'rarely', 'occasionally', 'frequently', 'daily');--> statement-breakpoint
CREATE TYPE "public"."ppe_access" AS ENUM('full_provided', 'partial_provided', 'self_provided', 'none');--> statement-breakpoint
CREATE TYPE "public"."preferred_language" AS ENUM('english', 'shona', 'ndebele');--> statement-breakpoint
CREATE TYPE "public"."province" AS ENUM('bulawayo', 'harare', 'manicaland', 'mashonaland_central', 'mashonaland_east', 'mashonaland_west', 'masvingo', 'matabeleland_north', 'matabeleland_south', 'midlands');--> statement-breakpoint
CREATE TYPE "public"."recovery_equipment_use" AS ENUM('always', 'sometimes', 'rarely', 'never', 'no_access');--> statement-breakpoint
CREATE TYPE "public"."submission_source" AS ENUM('web', 'pwa_offline_sync', 'admin_entry');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('pending', 'verified', 'flagged', 'duplicate');--> statement-breakpoint
CREATE TYPE "public"."years_experience" AS ENUM('less_than_1', '1_3', '4_6', '7_10', '11_15', '16_20', 'more_than_20');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" "admin_role" DEFAULT 'admin' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"actor_admin_user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "export_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_admin_user_id" uuid NOT NULL,
	"format" text NOT NULL,
	"filters" jsonb,
	"row_count" integer NOT NULL,
	"anonymised" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "survey_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" text NOT NULL,
	"step" integer NOT NULL,
	"step_name" text NOT NULL,
	"event" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "technicians_survey" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "submission_status" DEFAULT 'pending' NOT NULL,
	"first_name" text NOT NULL,
	"surname" text NOT NULL,
	"gender" "gender" NOT NULL,
	"age_group" "age_group" NOT NULL,
	"education_level" "education_level" NOT NULL,
	"years_experience" "years_experience" NOT NULL,
	"main_work_focus" jsonb NOT NULL,
	"main_work_focus_other" text,
	"province" "province" NOT NULL,
	"city" text NOT NULL,
	"suburb" text NOT NULL,
	"gps_latitude" numeric(10, 7),
	"gps_longitude" numeric(10, 7),
	"gps_accuracy_meters" numeric(10, 2),
	"phone" text NOT NULL,
	"email" text,
	"has_formal_training" boolean NOT NULL,
	"training_institution" text,
	"training_year" integer,
	"has_certification" "has_certification" NOT NULL,
	"certifications_held" jsonb,
	"hevacraz_member_number" text,
	"confidence_traditional_refrigerants" integer NOT NULL,
	"confidence_low_gwp_refrigerants" integer NOT NULL,
	"access_to_tools" integer NOT NULL,
	"access_to_spare_parts" integer NOT NULL,
	"access_to_low_gwp_refrigerants" integer NOT NULL,
	"obstacle_high_import_costs" integer NOT NULL,
	"obstacle_forex_shortages" integer NOT NULL,
	"obstacle_unreliable_suppliers" integer NOT NULL,
	"obstacle_counterfeit_products" integer NOT NULL,
	"obstacles_other" text,
	"biggest_daily_challenge" "biggest_daily_challenge" NOT NULL,
	"biggest_daily_challenge_other" text,
	"load_shedding_frequency" "load_shedding_frequency" NOT NULL,
	"refrigerant_recovery_equipment_use" "recovery_equipment_use" NOT NULL,
	"ppe_access" "ppe_access" NOT NULL,
	"ehs_compliance_barriers" jsonb NOT NULL,
	"ehs_compliance_barriers_other" text,
	"installs_energy_efficient" "energy_efficient_install" NOT NULL,
	"energy_efficient_barriers" jsonb,
	"energy_efficient_barriers_other" text,
	"consent_to_contact" boolean NOT NULL,
	"consent_to_public_registry" boolean NOT NULL,
	"preferred_language" "preferred_language" NOT NULL,
	"profile_photo_url" text,
	"ip_address" text,
	"user_agent" text,
	"submission_source" "submission_source" DEFAULT 'web' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_survey_id_technicians_survey_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."technicians_survey"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_admin_user_id_admin_users_id_fk" FOREIGN KEY ("actor_admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "export_log" ADD CONSTRAINT "export_log_actor_admin_user_id_admin_users_id_fk" FOREIGN KEY ("actor_admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_sessions_admin_user_idx" ON "admin_sessions" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_sessions_expires_at_idx" ON "admin_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_email_unique_idx" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_log_survey_idx" ON "audit_log" USING btree ("survey_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_log_actor_idx" ON "audit_log" USING btree ("actor_admin_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "survey_events_phone_idx" ON "survey_events" USING btree ("phone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "survey_events_step_idx" ON "survey_events" USING btree ("step");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "survey_events_created_at_idx" ON "survey_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "technicians_survey_phone_idx" ON "technicians_survey" USING btree ("phone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "technicians_survey_email_idx" ON "technicians_survey" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "technicians_survey_province_idx" ON "technicians_survey" USING btree ("province");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "technicians_survey_main_work_focus_idx" ON "technicians_survey" USING gin ("main_work_focus");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "technicians_survey_submitted_at_idx" ON "technicians_survey" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "technicians_survey_status_idx" ON "technicians_survey" USING btree ("status");