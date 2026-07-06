-- Migration 0008: Add unique phone constraint + DB-backed rate limiter table
--
-- F1: Replace non-unique phone indexes with unique constraints to prevent
--      duplicate submissions at the database level.
-- F4: Add a rate_limit_entries table so rate limiting is shared across all
--      serverless instances, replacing the per-instance in-memory map.

-- ── F1: Unique phone constraints ──────────────────────────────────────────

DROP INDEX IF EXISTS "technicians_survey_phone_idx";
DROP INDEX IF EXISTS "retailers_survey_phone_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "technicians_survey_phone_unique" ON "technicians_survey" ("phone");
CREATE UNIQUE INDEX IF NOT EXISTS "retailers_survey_phone_unique" ON "retailers_survey" ("phone");

-- ── F4: DB-backed rate limiter table ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS "rate_limit_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "key" text NOT NULL,
  "count" integer DEFAULT 1 NOT NULL,
  "reset_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "rate_limit_entries_key_idx" ON "rate_limit_entries" ("key");
