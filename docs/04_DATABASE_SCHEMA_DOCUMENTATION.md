# DATABASE SCHEMA DOCUMENTATION
## National RAC Technician Registry — ZW RAC Survey Platform

**Document Reference:** NOU-HEVACRAZ-DB-2025-001
**Version:** 1.0
**Date:** 2025-06-01
**Status:** Finalised
**Database Engine:** PostgreSQL (Neon Serverless)
**ORM:** Drizzle ORM 0.36
**Migrations Applied:** 7 (0000 → 0006)
**Schema File:** `lib/schema.ts`

---

## 1. OVERVIEW

The database consists of **10 tables** and **20+ PostgreSQL enum types** serving the National RAC Technician Registry platform. All tables use UUID primary keys for security and global uniqueness. The schema is managed via Drizzle ORM with versioned SQL migrations.

### 1.1 Table Summary

| # | Table Name | Purpose | Rows (estimate) |
|---|---|---|---|
| 1 | `admin_users` | Administrator accounts | Low (< 50) |
| 2 | `admin_sessions` | Active JWT sessions | Medium (< 500) |
| 3 | `technicians_survey` | Technician registrations | High (thousands) |
| 4 | `retailers_survey` | Retailer registrations | Medium |
| 5 | `audit_log` | Immutable admin/applicant action log | High |
| 6 | `export_log` | Data export events | Low |
| 7 | `survey_events` | Survey funnel tracking events | Very High |
| 8 | `password_reset_tokens` | Time-limited password reset tokens | Low |
| 9 | `system_events` | System-level event log | High |
| 10 | `technician_survey_reports` | Generated report records | Low |

---

## 2. ENUM TYPE DEFINITIONS

All enums are defined at the PostgreSQL database level, enforcing valid values at the storage layer.

### 2.1 User and Identity Enums

| Enum Name | Values |
|---|---|
| `gender` | `male`, `female`, `prefer_not_to_say` |
| `age_group` | `under_25`, `25_34`, `35_44`, `45_54`, `55_64`, `65_plus` |
| `education_level` | `none`, `primary`, `o_level`, `a_level`, `vocational`, `diploma`, `national_certificate`, `degree`, `postgraduate` |
| `years_experience` | `less_than_1`, `1_3`, `4_6`, `7_10`, `11_15`, `16_20`, `more_than_20` |

### 2.2 Geographic Enums

| Enum Name | Values |
|---|---|
| `province` | `bulawayo`, `harare`, `manicaland`, `mashonaland_central`, `mashonaland_east`, `mashonaland_west`, `masvingo`, `matabeleland_north`, `matabeleland_south`, `midlands` |

### 2.3 Certification and Skill Enums

| Enum Name | Values |
|---|---|
| `has_certification` | `yes`, `no`, `studying` |
| `preferred_language` | `english`, `shona`, `ndebele` |

### 2.4 Operational / Challenge Enums

| Enum Name | Values |
|---|---|
| `biggest_daily_challenge` | `power_outages`, `forex_shortages`, `spare_parts`, `counterfeit`, `unsafe_conditions`, `customer_payment`, `training_opportunities`, `certification_access`, `transport_mobility`, `unqualified_competition`, `other` |
| `load_shedding_frequency` | `never`, `rarely`, `occasionally`, `frequently`, `daily` |
| `recovery_equipment_use` | `always`, `sometimes`, `rarely`, `never`, `no_access` |
| `ppe_access` | `full_provided`, `partial_provided`, `self_provided`, `none` |
| `energy_efficient_install` | `always`, `on_request`, `sometimes`, `rarely`, `never` |

### 2.5 System / Metadata Enums

| Enum Name | Values |
|---|---|
| `submission_status` | `pending`, `verified`, `flagged`, `duplicate` |
| `submission_source` | `web`, `pwa_offline_sync`, `admin_entry` |
| `admin_role` | `admin`, `super_admin` |
| `audit_actor_type` | `admin`, `applicant` |

### 2.6 Retailer-Specific Enums

| Enum Name | Values |
|---|---|
| `business_type` | `retailer`, `wholesaler`, `distributor`, `importer` |
| `business_size` | `solo`, `2_5`, `6_15`, `16_50`, `50_plus` |
| `product_category` | `air_conditioners`, `refrigerators`, `freezers`, `compressors`, `refrigerants`, `spare_parts`, `tools_equipment`, `ppe`, `thermostats_controls`, `ducting_insulation`, `other` |
| `sourcing_option` | `local`, `regional`, `abroad`, `mix` |
| `customer_type` | `residential`, `commercial`, `industrial`, `government`, `all` |
| `supply_challenge` | `import_costs`, `forex_shortages`, `unreliable_suppliers`, `counterfeit_products`, `customs_delays`, `stockouts`, `quality_inconsistency`, `logistics`, `other` |
| `refrigerant_awareness` | `very_aware`, `somewhat_aware`, `heard_of`, `not_aware` |

---

## 3. TABLE DEFINITIONS

---

### Table: `admin_users`

**Purpose:** Stores administrator accounts for the NOU/HEVACRAZ admin portal.

| Column | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | No | `gen_random_uuid()` | PRIMARY KEY | Unique administrator ID |
| `email` | TEXT | No | — | UNIQUE INDEX | Login email address |
| `password_hash` | TEXT | No | — | — | bcrypt hash (12 rounds) |
| `name` | TEXT | No | — | — | Display name |
| `role` | `admin_role` | No | `admin` | — | Access level: admin or super_admin |
| `is_active` | BOOLEAN | No | `true` | — | Whether account is enabled |
| `last_login_at` | TIMESTAMPTZ | Yes | — | — | Timestamp of last successful login |
| `created_at` | TIMESTAMPTZ | No | `now()` | — | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `now()` | — | Last modification timestamp |

**Indexes:**
- `admin_users_email_unique_idx` — UNIQUE BTREE on `email`

**Relationships:**
- Referenced by: `admin_sessions.admin_user_id`, `audit_log.actor_admin_user_id`, `export_log.actor_admin_user_id`, `password_reset_tokens.admin_user_id`, `system_events.actor_admin_user_id`, `technician_survey_reports.generated_by`

---

### Table: `admin_sessions`

**Purpose:** Database-backed session store for admin JWT sessions. Enables session revocation and audit.

| Column | Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | No | `gen_random_uuid()` | PRIMARY KEY | Session identifier (embedded in JWT as `sid`) |
| `admin_user_id` | UUID | No | — | FK → admin_users.id (CASCADE DELETE) | Session owner |
| `expires_at` | TIMESTAMPTZ | No | — | — | Session expiry time |
| `ip_address` | TEXT | Yes | — | — | Client IP at session creation |
| `user_agent` | TEXT | Yes | — | — | Client user agent at session creation |
| `revoked_at` | TIMESTAMPTZ | Yes | — | — | Null = active; set on logout or password reset |
| `created_at` | TIMESTAMPTZ | No | `now()` | — | Session creation time |

**Indexes:**
- `admin_sessions_admin_user_idx` — BTREE on `admin_user_id`
- `admin_sessions_expires_at_idx` — BTREE on `expires_at`

**Notes:** A session is considered valid only when `revoked_at IS NULL` AND `expires_at > NOW()` AND the referenced `admin_user.is_active = true`.

---

### Table: `technicians_survey`

**Purpose:** Core registry table. Stores all RAC technician self-registration submissions. The central entity in the system.

**Note:** This is the largest table with 60+ columns across 6 survey sections plus metadata. SQL CHECK constraints enforce Likert score range (1–5).

#### Identity and Status

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID PK | No | Auto-generated unique ID (used as reference number) |
| `submitted_at` | TIMESTAMPTZ | No | When the submission was created |
| `status` | `submission_status` | No | Lifecycle state: pending/verified/flagged/duplicate |

#### Section 1 — Background

| Column | Type | Nullable | Description |
|---|---|---|---|
| `first_name` | TEXT | No | Given name |
| `surname` | TEXT | No | Family name |
| `gender` | `gender` | No | Gender identity |
| `age_group` | `age_group` | No | Age bracket |
| `education_level` | `education_level` | No | Highest qualification |
| `years_experience` | `years_experience` | No | Years in the trade |
| `main_work_focus` | JSONB (TEXT[]) | No | Array of work focus codes (GIN indexed) |
| `main_work_focus_other` | TEXT | Yes | Free-text if "other" selected |
| `province` | `province` | No | Zimbabwe province |
| `city` | TEXT | No | City or town |
| `suburb` | TEXT | No | Suburb or area |
| `gps_latitude` | NUMERIC(10,7) | Yes | GPS coordinate |
| `gps_longitude` | NUMERIC(10,7) | Yes | GPS coordinate |
| `gps_accuracy_meters` | NUMERIC(10,2) | Yes | GPS fix accuracy |
| `phone` | TEXT | No | Zimbabwe phone (+263XXXXXXXXX) |
| `email` | TEXT | Yes | Email address (optional) |

#### Section 2 — Skills and Training

| Column | Type | Nullable | Description |
|---|---|---|---|
| `has_formal_training` | BOOLEAN | No | Whether formally trained |
| `training_institution` | TEXT | Yes | Where trained (required if has_formal_training=true) |
| `training_year` | INTEGER | Yes | Year qualified (required if has_formal_training=true) |
| `has_certification` | `has_certification` | No | yes/no/studying |
| `certifications_held` | JSONB (TEXT[]) | Yes | Array of held certification codes |
| `certification_number` | TEXT | Yes | Certificate reference number |
| `hevacraz_member_number` | TEXT | Yes | HEVACRAZ membership ID |
| `confidence_traditional_refrigerants` | INTEGER (1–5) | No | Likert: confidence with R22, R134a, etc. |
| `confidence_low_gwp_refrigerants` | INTEGER (1–5) | No | Likert: confidence with R32, R290, R600a |
| `access_to_tools` | INTEGER (1–5) | No | Likert: tool access rating |
| `access_to_spare_parts` | INTEGER (1–5) | No | Likert: spare parts access |
| `access_to_low_gwp_refrigerants` | INTEGER (1–5) | No | Likert: low-GWP refrigerant access |

#### Section 3 — Obstacles (Likert Ratings)

| Column | Type | Nullable | Description |
|---|---|---|---|
| `obstacle_high_import_costs` | INTEGER (1–5) | No | Likert: impact of import costs |
| `obstacle_forex_shortages` | INTEGER (1–5) | No | Likert: impact of forex shortages |
| `obstacle_unreliable_suppliers` | INTEGER (1–5) | No | Likert: impact of unreliable suppliers |
| `obstacle_counterfeit_products` | INTEGER (1–5) | No | Likert: impact of counterfeit products |
| `obstacles_other` | TEXT | Yes | Additional obstacle description |

#### Section 4 — Work Challenges

| Column | Type | Nullable | Description |
|---|---|---|---|
| `biggest_daily_challenge` | `biggest_daily_challenge` | No | Primary daily challenge |
| `biggest_daily_challenge_other` | TEXT | Yes | Description if "other" |
| `load_shedding_frequency` | `load_shedding_frequency` | No | How often load shedding affects work |
| `refrigerant_recovery_equipment_use` | `recovery_equipment_use` | No | How often recovery equipment is used |
| `ppe_access` | `ppe_access` | No | PPE provision level |
| `ehs_compliance_barriers` | JSONB (TEXT[]) | No | Array of EHS barrier codes |
| `ehs_compliance_barriers_other` | TEXT | Yes | Description if "other" |

#### Section 5 — Energy Efficiency

| Column | Type | Nullable | Description |
|---|---|---|---|
| `installs_energy_efficient` | `energy_efficient_install` | No | How often energy-efficient equipment is installed |
| `energy_efficient_barriers` | JSONB (TEXT[]) | Yes | Array of barrier codes |
| `energy_efficient_barriers_other` | TEXT | Yes | Description if "other" |

#### Section 6 — Consent

| Column | Type | Nullable | Description |
|---|---|---|---|
| `consent_to_contact` | BOOLEAN | No | Consent for NOU/HEVACRAZ to contact |
| `consent_to_public_registry` | BOOLEAN | No | Consent to appear in public directory |
| `preferred_language` | `preferred_language` | No | Communication language preference |
| `profile_photo_url` | TEXT | Yes | Cloudflare R2 CDN URL for profile photo |

#### Data Consent (GDPR-like)

| Column | Type | Nullable | Description |
|---|---|---|---|
| `data_consent_accepted` | BOOLEAN | No | Whether data protection notice was accepted |
| `data_consent_accepted_at` | TIMESTAMPTZ | Yes | When consent was given |
| `data_consent_ip_address` | TEXT | Yes | IP address at consent |
| `data_consent_user_agent` | TEXT | Yes | Browser UA at consent |

#### Metadata

| Column | Type | Nullable | Description |
|---|---|---|---|
| `ip_address` | TEXT | Yes | Submitter's IP at submission |
| `user_agent` | TEXT | Yes | Submitter's browser UA |
| `submission_source` | `submission_source` | No | web/pwa_offline_sync/admin_entry |
| `notes` | TEXT | Yes | Internal admin notes |
| `created_at` | TIMESTAMPTZ | No | Record creation (same as submitted_at usually) |
| `updated_at` | TIMESTAMPTZ | No | Last record update |

**Indexes:**
- `technicians_survey_phone_idx` — BTREE on `phone`
- `technicians_survey_email_idx` — BTREE on `email`
- `technicians_survey_province_idx` — BTREE on `province`
- `technicians_survey_main_work_focus_idx` — **GIN** on `main_work_focus` (supports array @> containment queries)
- `technicians_survey_submitted_at_idx` — BTREE on `submitted_at`
- `technicians_survey_status_idx` — BTREE on `status`

---

### Table: `retailers_survey`

**Purpose:** Stores RAC equipment retailer/wholesaler/distributor/importer registrations. Parallel to the technician survey but for the supply chain side of the RAC sector.

**Key Columns (abbreviated):**

| Column Group | Columns |
|---|---|
| Identity/Status | `id` (UUID PK), `submitted_at`, `status` |
| Business Info | `business_name`, `contact_person_name`, `business_type`, `province`, `city`, `suburb`, `phone`, `email`, `business_size`, `years_in_operation`, `business_registration_number` |
| Products & Sourcing | `product_categories` (JSONB), `product_categories_other`, `sourcing_channel`, `local_sourcing_percent`, `brands_carried`, `customer_types` (JSONB), `refrigerant_awareness`, `stocks_low_gwp` |
| Challenges | `supply_challenges` (JSONB), `supply_challenges_other`, `biggest_daily_challenge`, `load_shedding_impact` (Likert), `regulatory_barriers`, `competition_level` (Likert), `price_pressure` (Likert), `interested_in_training`, `training_topics` |
| Consent | `consent_to_contact`, `preferred_language`, `data_consent_accepted`, `data_consent_accepted_at`, `data_consent_ip_address`, `data_consent_user_agent` |
| Metadata | `ip_address`, `user_agent`, `submission_source`, `notes`, `created_at`, `updated_at` |

**Indexes:** `phone`, `email`, `province`, `business_type`, `submitted_at`, `status`

**Relationships:** None (independent table; no FK to technicians_survey)

---

### Table: `audit_log`

**Purpose:** Immutable chronological record of every action taken on technician survey records, by either an admin or an applicant. Used for compliance, dispute resolution, and regulatory audit.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID PK | No | Unique log entry |
| `survey_id` | UUID | No | FK → technicians_survey.id (CASCADE DELETE) |
| `actor_admin_user_id` | UUID | Yes | FK → admin_users.id (RESTRICT, nullable for applicant actions) |
| `actor_type` | `audit_actor_type` | No | admin or applicant |
| `actor_display` | TEXT | Yes | Display name (phone number for applicants, email for admins) |
| `action` | TEXT | No | Action description (e.g., "status_change", "field_update") |
| `payload` | JSONB | Yes | Before/after values or action details |
| `created_at` | TIMESTAMPTZ | No | Immutable timestamp |

**Indexes:** `survey_id`, `actor_admin_user_id`, `created_at`

**Design Note:** `actor_admin_user_id` was made nullable in migration 0003 to support applicant self-edits. The `actor_type` enum distinguishes the two actor types.

---

### Table: `export_log`

**Purpose:** Audit trail of all data export events. Required for GDPR-like compliance to track who exported what data and when.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID PK | No | |
| `actor_admin_user_id` | UUID | No | FK → admin_users.id (RESTRICT) |
| `format` | TEXT | No | csv, excel, pdf, geojson, or spss |
| `filters` | JSONB | Yes | Applied filter criteria at time of export |
| `row_count` | INTEGER | No | Number of records exported |
| `anonymised` | BOOLEAN | No | Whether PII fields were omitted |
| `created_at` | TIMESTAMPTZ | No | Export timestamp |

---

### Table: `survey_events`

**Purpose:** Fine-grained funnel analytics. Records every step enter, exit, and save event in the survey wizard, enabling drop-off analysis without storing incomplete submissions.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID PK | No | |
| `phone` | TEXT | No | Respondent's phone (survey identifier before submission) |
| `step` | INTEGER | No | Step number (1–6) |
| `step_name` | TEXT | No | Step label |
| `event` | TEXT | No | Event type (enter, exit, save, etc.) |
| `ip_address` | TEXT | Yes | |
| `user_agent` | TEXT | Yes | |
| `created_at` | TIMESTAMPTZ | No | |

**Indexes:** `phone`, `step`, `created_at`

**Note:** This table is linked to submissions by phone number text match only (no FK), allowing event tracking before a submission is finalised.

---

### Table: `password_reset_tokens`

**Purpose:** Manages secure, time-limited password reset tokens for admin users.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID PK | No | |
| `admin_user_id` | UUID | No | FK → admin_users.id (CASCADE DELETE) |
| `token_hash` | TEXT | No | SHA-256 hash of the reset token (original never stored) |
| `expires_at` | TIMESTAMPTZ | No | 2-hour expiry |
| `used_at` | TIMESTAMPTZ | Yes | Null = unused; set when token is consumed (single-use) |
| `created_at` | TIMESTAMPTZ | No | |

**Indexes:** `admin_user_id`, `token_hash`

---

### Table: `system_events`

**Purpose:** System-level audit log recording significant admin portal events (logins, logouts, invitations, exports, report generation, etc.). Used by the sysadmin dashboard for oversight.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID PK | No | |
| `actor_admin_user_id` | UUID | Yes | FK → admin_users.id (SET NULL on delete), nullable for system-generated events |
| `event_type` | TEXT | No | Event category (e.g., `admin.login`, `export.csv`, `report.generated`) |
| `description` | TEXT | No | Human-readable event description |
| `metadata` | JSONB | Yes | Additional event context |
| `ip_address` | TEXT | Yes | Actor's IP address |
| `created_at` | TIMESTAMPTZ | No | |

**Indexes:** `event_type`, `actor_admin_user_id`, `created_at`

---

### Table: `technician_survey_reports`

**Purpose:** Persists generated formal reports including AI-generated summaries, PDF URLs, and reporting metadata.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID PK | No | |
| `report_title` | TEXT | No | Human-readable title |
| `report_type` | TEXT | No | Default: `technician-survey` |
| `survey_name` | TEXT | No | Survey identifier |
| `reporting_period_start` | TIMESTAMPTZ | No | Start of reporting window |
| `reporting_period_end` | TIMESTAMPTZ | No | End of reporting window |
| `total_responses` | INTEGER | No | Number of responses included |
| `generated_by` | UUID | No | FK → admin_users.id (RESTRICT) |
| `generated_at` | TIMESTAMPTZ | No | Report generation timestamp |
| `status` | TEXT | No | Default: `completed` |
| `pdf_url` | TEXT | Yes | Cloudflare R2 URL of the generated PDF |
| `ai_summary` | JSONB | Yes | AI-generated summary: `{overview, keyFindings, riskAreas, opportunities, recommendedInterventions, priorityActions}` |
| `metadata` | JSONB | Yes | Additional report metadata |
| `created_at` | TIMESTAMPTZ | No | |
| `updated_at` | TIMESTAMPTZ | No | |

**Indexes:** `generated_at`, `generated_by`

---

## 4. ENTITY RELATIONSHIP DIAGRAM (Textual ERD)

```
┌──────────────────────────────────────────────────────────────────────┐
│                         admin_users                                   │
│  PK: id                                                               │
│  UQ: email                                                           │
└───────────┬──────────────────────────────────────────────────────────┘
            │ 1
            │
      ┌─────┼──────────────────────────────────────────────────────┐
      │     │                                                       │
      ▼ N   ▼ N                          ▼ N          ▼ N          ▼ N
┌──────────┐ ┌──────────────────┐ ┌──────────────┐ ┌───────────┐ ┌──────────────────────┐
│admin_    │ │password_reset_   │ │system_events │ │export_log │ │technician_survey_    │
│sessions  │ │tokens            │ │              │ │           │ │reports               │
│FK:admin  │ │FK:admin_user_id  │ │FK:actor_admin│ │FK:actor   │ │FK:generated_by       │
│_user_id  │ │CASCADE DELETE    │ │_user_id      │ │_admin_    │ │RESTRICT              │
└──────────┘ └──────────────────┘ │SET NULL      │ │user_id    │ └──────────────────────┘
                                  └──────────────┘ │RESTRICT   │
                                                   └───────────┘

┌────────────────────────────────────────────────────┐
│                  technicians_survey                 │
│  PK: id                                            │
│  IDX: phone, email, province, main_work_focus(GIN) │
│       submitted_at, status                         │
└────────────────┬───────────────────────────────────┘
                 │ 1
                 │
                 ▼ N
          ┌──────────────┐
          │  audit_log   │
          │FK: survey_id │
          │CASCADE DELETE│
          └──────────────┘

┌──────────────────┐    ┌────────────────┐
│  retailers_survey│    │ survey_events  │
│  (independent)   │    │ (phone match)  │
└──────────────────┘    └────────────────┘
```

---

## 5. MIGRATION HISTORY

| Migration | Tag | Applied | Key Changes |
|---|---|---|---|
| 0000 | `0000_loud_callisto` | 2025-05 | Initial schema: admin_users, admin_sessions, technicians_survey, audit_log, export_log, survey_events + all enums |
| 0001 | `0001_complete_landau` | 2025-05 | Added `certification_number` column to technicians_survey |
| 0002 | `0002_create_password_reset_and_system_events` | 2025-05 | Added password_reset_tokens and system_events tables |
| 0003 | `0003_applicant_edits` | 2025-05 | Made `actor_admin_user_id` nullable in audit_log; added `actor_type` enum + column; added `actor_display` column |
| 0004a | `0004_add_national_certificate` | 2025-05 | Added `national_certificate` value to `education_level` enum |
| 0004b | `0004_add_technician_survey_reports` | 2025-05 | Added `technician_survey_reports` table |
| 0005 | `0005_add_data_consent` | 2025-05 | Added data_consent_accepted, data_consent_accepted_at, data_consent_ip_address, data_consent_user_agent to technicians_survey |
| 0006 | `0006_strange_toro` | 2025-05 | Added retailers_survey table and all retailer-specific enum types |

---

## 6. INDEXING STRATEGY

| Index Type | Tables | Rationale |
|---|---|---|
| BTREE on `phone` | technicians_survey, retailers_survey | Duplicate detection; applicant lookups by phone |
| BTREE on `email` | technicians_survey, retailers_survey | Email lookups for notification sending |
| BTREE on `province` | technicians_survey, retailers_survey | Geographic filtering (most common admin filter) |
| BTREE on `status` | technicians_survey, retailers_survey | Status-based filtering (pending review queue) |
| BTREE on `submitted_at` | technicians_survey, retailers_survey | Time-range queries for reports and exports |
| **GIN on `main_work_focus`** | technicians_survey | Array containment query (`@>`) for work focus filtering |
| UNIQUE on `email` | admin_users | Enforce unique admin accounts |
| BTREE on `admin_user_id` | admin_sessions, password_reset_tokens | Session and token lookups by user |
| BTREE on `expires_at` | admin_sessions | Efficient expired session cleanup |
| BTREE on `token_hash` | password_reset_tokens | Fast token validation |
| BTREE on `survey_id` | audit_log | Load audit trail for a specific submission |
| BTREE on `created_at` | audit_log, survey_events, system_events | Time-range queries and pagination |
| BTREE on `event_type` | system_events | Filter by event category in sysadmin dashboard |

---

*Document End*
