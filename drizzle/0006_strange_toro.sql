DO $$ BEGIN
  CREATE TYPE "public"."business_size" AS ENUM('solo', '2_5', '6_15', '16_50', '50_plus');
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."business_type" AS ENUM('retailer', 'wholesaler', 'distributor', 'importer');
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."customer_type" AS ENUM('residential', 'commercial', 'industrial', 'government', 'all');
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."product_category" AS ENUM('air_conditioners', 'refrigerators', 'freezers', 'compressors', 'refrigerants', 'spare_parts', 'tools_equipment', 'ppe', 'thermostats_controls', 'ducting_insulation', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."refrigerant_awareness" AS ENUM('very_aware', 'somewhat_aware', 'heard_of', 'not_aware');
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."sourcing_option" AS ENUM('local', 'regional', 'abroad', 'mix');
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."supply_challenge" AS ENUM('import_costs', 'forex_shortages', 'unreliable_suppliers', 'counterfeit_products', 'customs_delays', 'stockouts', 'quality_inconsistency', 'logistics', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "retailers_survey" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "submission_status" DEFAULT 'pending' NOT NULL,
	"business_name" text NOT NULL,
	"contact_person_name" text NOT NULL,
	"business_type" "business_type" NOT NULL,
	"province" "province" NOT NULL,
	"city" text NOT NULL,
	"suburb" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"business_size" "business_size" NOT NULL,
	"years_in_operation" integer NOT NULL,
	"business_registration_number" text,
	"product_categories" jsonb NOT NULL,
	"product_categories_other" text,
	"sourcing_channel" "sourcing_option" NOT NULL,
	"local_sourcing_percent" integer,
	"brands_carried" text,
	"customer_types" jsonb NOT NULL,
	"refrigerant_awareness" "refrigerant_awareness" NOT NULL,
	"stocks_low_gwp" boolean NOT NULL,
	"supply_challenges" jsonb NOT NULL,
	"supply_challenges_other" text,
	"biggest_daily_challenge" text NOT NULL,
	"load_shedding_impact" integer NOT NULL,
	"regulatory_barriers" text,
	"competition_level" integer NOT NULL,
	"price_pressure" integer NOT NULL,
	"interested_in_training" boolean NOT NULL,
	"training_topics" text,
	"consent_to_contact" boolean NOT NULL,
	"preferred_language" "preferred_language" NOT NULL,
	"data_consent_accepted" boolean DEFAULT false NOT NULL,
	"data_consent_accepted_at" timestamp with time zone,
	"data_consent_ip_address" text,
	"data_consent_user_agent" text,
	"ip_address" text,
	"user_agent" text,
	"submission_source" "submission_source" DEFAULT 'web' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "retailers_survey_phone_idx" ON "retailers_survey" USING btree ("phone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "retailers_survey_email_idx" ON "retailers_survey" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "retailers_survey_province_idx" ON "retailers_survey" USING btree ("province");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "retailers_survey_business_type_idx" ON "retailers_survey" USING btree ("business_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "retailers_survey_submitted_at_idx" ON "retailers_survey" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "retailers_survey_status_idx" ON "retailers_survey" USING btree ("status");
