-- Migration: support applicant edits and richer audit trail
-- Generated manually

-- 1. Make actor_admin_user_id nullable so applicants (who have no admin account) can be logged.
ALTER TABLE audit_log ALTER COLUMN actor_admin_user_id DROP NOT NULL;

-- 2. Add actor type enum + column
CREATE TYPE audit_actor_type AS ENUM ('admin', 'applicant');
ALTER TABLE audit_log ADD COLUMN actor_type audit_actor_type NOT NULL DEFAULT 'admin';

-- 3. Add free-text display name for non-admin actors (e.g. applicant phone number)
ALTER TABLE audit_log ADD COLUMN actor_display text;

-- 4. Back-fill existing rows so they remain admin entries
-- (actor_type already defaults to 'admin', so nothing extra needed)
