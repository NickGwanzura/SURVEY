ALTER TABLE "technicians_survey" ADD COLUMN "registration_number" text UNIQUE;
ALTER TABLE "retailers_survey" ADD COLUMN "registration_number" text UNIQUE;

CREATE TABLE IF NOT EXISTS "registration_number_sequence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"counter" integer DEFAULT 0 NOT NULL,
	"entity_type" text NOT NULL,
	CONSTRAINT "registration_number_sequence_entity_type_unique" UNIQUE("entity_type")
);
