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
CREATE INDEX IF NOT EXISTS "password_reset_tokens_admin_user_idx" ON "password_reset_tokens" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "password_reset_tokens_token_hash_idx" ON "password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_events_event_type_idx" ON "system_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_events_actor_idx" ON "system_events" USING btree ("actor_admin_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_events_created_at_idx" ON "system_events" USING btree ("created_at");--> statement-breakpoint
