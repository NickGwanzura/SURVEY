# FUNCTIONAL REQUIREMENTS SPECIFICATION
## National RAC Technician Registry — ZW RAC Survey Platform

**Document Reference:** NOU-HEVACRAZ-FRS-2025-001
**Version:** 1.0
**Date:** 2025-06-01
**Status:** Finalised
**Source:** Reverse-engineered from production codebase — verified against `lib/validation.ts`, `lib/schema.ts`, survey wizard components, and API routes.

---

## 1. INTRODUCTION

### 1.1 Purpose

This Functional Requirements Specification (FRS) defines the complete set of functional requirements for the National RAC Technician Registry platform. It describes what the system does: the features, data inputs, data processing, data outputs, and user interactions.

### 1.2 Scope

The system consists of:
- A **public-facing survey portal** for technician and retailer self-registration
- An **administrator portal** for NOU and HEVACRAZ staff
- A **REST API** serving both portals
- An **email notification system**
- An **AI analysis engine**
- A **Progressive Web App (PWA)** for offline operation

### 1.3 Document Conventions

| Symbol | Meaning |
|---|---|
| **FR-xxx** | Functional Requirement identifier |
| **MUST** | Mandatory requirement |
| **SHOULD** | Recommended requirement |
| **MAY** | Optional requirement |

---

## 2. USER ROLES AND ACTORS

| Actor | Description | Authentication |
|---|---|---|
| **Technician** | RAC technician completing self-registration | None (anonymous) |
| **Retailer** | RAC equipment retailer/distributor | None (anonymous) |
| **Admin** | NOU/HEVACRAZ staff member | Email + password |
| **Super Admin** | Senior NOU/HEVACRAZ administrator | Email + password |
| **Sysadmin** | System administrator (developer) | Email + password + email whitelist |

---

## 3. MODULE 1 — TECHNICIAN SURVEY (SELF-REGISTRATION)

### 3.1 Landing Page

| ID | Requirement |
|---|---|
| FR-001 | The system MUST display a landing page explaining the survey purpose, NOU and HEVACRAZ branding, and call-to-action buttons. |
| FR-002 | The landing page MUST display the estimated completion time (10–15 minutes). |
| FR-003 | The landing page MUST indicate that the survey works offline. |
| FR-004 | The landing page MUST display a link to start a new survey and a link to edit an existing application. |
| FR-005 | The landing page MUST display a privacy notice explaining data use. |
| FR-006 | The landing page MUST NOT require login or account creation. |

### 3.2 Survey Wizard — General

| ID | Requirement |
|---|---|
| FR-010 | The survey MUST be presented as a step-by-step wizard with 6 distinct steps. |
| FR-011 | The survey MUST display a progress bar showing the current step and total steps. |
| FR-012 | The survey MUST allow navigation to previous steps without losing entered data. |
| FR-013 | The survey MUST validate each step before allowing progression to the next. |
| FR-014 | The system MUST display field-level validation error messages in plain English. |
| FR-015 | The survey MUST save progress to browser local storage so users can resume after closing the browser. |
| FR-016 | The survey MUST detect duplicate phone number submissions and warn the user. |
| FR-017 | The system MUST support submission from web browsers and PWA on mobile devices. |

### 3.3 Survey Step 1 — Background Information

All fields in this step are required unless marked optional.

| ID | Field | Type | Validation Rule |
|---|---|---|---|
| FR-020 | First Name | Text | 2–50 characters; letters, spaces, hyphens, apostrophes only (Unicode) |
| FR-021 | Surname | Text | 2–50 characters; letters, spaces, hyphens, apostrophes only (Unicode) |
| FR-022 | Gender | Enum | One of: male, female, prefer_not_to_say |
| FR-023 | Age Group | Enum | One of: under_25, 25_34, 35_44, 45_54, 55_64, 65_plus |
| FR-024 | Education Level | Enum | One of: none, primary, o_level, a_level, vocational, diploma, national_certificate, degree, postgraduate |
| FR-025 | Years of Experience | Enum | One of: less_than_1, 1_3, 4_6, 7_10, 11_15, 16_20, more_than_20 |
| FR-026 | Main Work Focus | Multi-select (JSONB array) | At least 1 selection required; if "other" selected, text field required |
| FR-027 | Province | Enum | One of Zimbabwe's 10 provinces |
| FR-028 | City/Town | Text | 2–100 characters, required |
| FR-029 | Suburb/Area | Text | 2–100 characters, required |
| FR-030 | GPS Latitude | Numeric | Optional; −90 to 90, max 7 decimal places |
| FR-031 | GPS Longitude | Numeric | Optional; −180 to 180, max 7 decimal places |
| FR-032 | GPS Accuracy (m) | Numeric | Optional; 0 or greater |
| FR-033 | Phone Number | Text | Zimbabwe format: `+263` followed by 9 digits (e.g. +263771234567); REQUIRED |
| FR-034 | Email Address | Text | Optional; if provided must be RFC-compliant email format |

**Additional requirements:**

| ID | Requirement |
|---|---|
| FR-035 | The system MUST provide a GPS capture button that requests the device's geolocation. |
| FR-036 | If GPS is not available, the system MUST provide a Leaflet map pin picker as a fallback. |
| FR-037 | The phone number field MUST be checked against existing submissions to detect duplicates before final submission. |

### 3.4 Survey Step 2 — Skills and Training

| ID | Field | Type | Validation Rule |
|---|---|---|---|
| FR-040 | Has Formal Training | Boolean | Yes/No required |
| FR-041 | Training Institution | Text | Required if hasFormalTraining=true; max 200 characters |
| FR-042 | Training Year | Integer | Required if hasFormalTraining=true; 1950 to current year |
| FR-043 | Has Certification | Enum | One of: yes, no, studying; required |
| FR-044 | Certifications Held | Multi-select | Required if hasCertification=yes; at least 1 selection |
| FR-045 | Certification Number | Text | Optional; max 200 characters |
| FR-046 | HEVACRAZ Member Number | Text | Required if certificationsHeld includes hevacraz_membership; max 200 characters |
| FR-047 | Confidence: Traditional Refrigerants | Integer (Likert) | 1–5; required |
| FR-048 | Confidence: Low-GWP Refrigerants | Integer (Likert) | 1–5; required |
| FR-049 | Access to Tools and Equipment | Integer (Likert) | 1–5; required |
| FR-050 | Access to Spare Parts | Integer (Likert) | 1–5; required |
| FR-051 | Access to Low-GWP Refrigerants | Integer (Likert) | 1–5; required |

### 3.5 Survey Step 3 — Tools and Resources (Obstacle Ratings)

| ID | Field | Type | Validation Rule |
|---|---|---|---|
| FR-060 | Obstacle: High Import Costs | Integer (Likert) | 1–5; required |
| FR-061 | Obstacle: Forex Shortages | Integer (Likert) | 1–5; required |
| FR-062 | Obstacle: Unreliable Suppliers | Integer (Likert) | 1–5; required |
| FR-063 | Obstacle: Counterfeit Products | Integer (Likert) | 1–5; required |
| FR-064 | Other Obstacles | Text | Optional; max 2000 characters |

### 3.6 Survey Step 4 — Work Challenges

| ID | Field | Type | Validation Rule |
|---|---|---|---|
| FR-070 | Biggest Daily Challenge | Enum | One of 11 defined challenge types; required. If "other", text field required |
| FR-071 | Load Shedding Frequency | Enum | One of: never, rarely, occasionally, frequently, daily; required |
| FR-072 | Refrigerant Recovery Equipment Use | Enum | One of: always, sometimes, rarely, never, no_access; required |
| FR-073 | PPE Access | Enum | One of: full_provided, partial_provided, self_provided, none; required |
| FR-074 | EHS Compliance Barriers | Multi-select | Minimum 1 selection required. If "other", text field required |

### 3.7 Survey Step 5 — Energy Efficiency

| ID | Field | Type | Validation Rule |
|---|---|---|---|
| FR-080 | Installs Energy-Efficient Equipment | Enum | One of: always, on_request, sometimes, rarely, never; required |
| FR-081 | Energy-Efficient Barriers | Multi-select | Required unless installsEnergyEfficient=always; min 1 selection. If "other", text field required |

### 3.8 Survey Step 6 — Consent

| ID | Field | Type | Validation Rule |
|---|---|---|---|
| FR-090 | Consent to Contact | Boolean | Yes/No required |
| FR-091 | Consent to Public Registry | Boolean | Yes/No required |
| FR-092 | Preferred Language | Enum | One of: english, shona, ndebele; required |
| FR-093 | Profile Photo | Image | Optional; JPG/PNG/WebP only; max 2MB after compression. Uploaded to Cloudflare R2. |
| FR-094 | Data Protection Consent | Boolean | MUST be true (accepted) to submit. Cannot submit without consent. |

### 3.9 Survey Submission

| ID | Requirement |
|---|---|
| FR-100 | On successful submission, the system MUST save all data to the database with status=pending. |
| FR-101 | The system MUST record the submission source: web, pwa_offline_sync, or admin_entry. |
| FR-102 | The system MUST record the submitter's IP address and user agent. |
| FR-103 | The system MUST record the data consent IP address, user agent, and timestamp separately. |
| FR-104 | On successful submission, the system MUST redirect the user to a confirmation page displaying a reference number. |
| FR-105 | If the user provided an email address, the system MUST send a confirmation email with the reference number. |
| FR-106 | On successful submission, the system MUST send alert emails to all active admin users. |
| FR-107 | The system MUST reject duplicate phone number submissions with an appropriate error message. |
| FR-108 | The system MUST validate all fields server-side regardless of client-side validation. |

### 3.10 Survey Edit (Applicant)

| ID | Requirement |
|---|---|
| FR-110 | The system MUST allow applicants to look up their existing submission using their phone number. |
| FR-111 | On successful lookup, the system MUST pre-fill the survey wizard with the existing data. |
| FR-112 | On re-submission, the system MUST update the existing record and log an audit entry with actor_type=applicant. |

---

## 4. MODULE 2 — RETAILER SURVEY

### 4.1 Overview

| ID | Requirement |
|---|---|
| FR-120 | The system MUST provide a separate 4-step registration survey for RAC equipment retailers. |
| FR-121 | The retailer survey MUST be accessible at a distinct URL from the technician survey. |
| FR-122 | The retailer survey MUST NOT require login. |

### 4.2 Step 1 — Business Information

| ID | Field | Validation |
|---|---|---|
| FR-130 | Business Name | Text, required |
| FR-131 | Contact Person Name | Text, required |
| FR-132 | Business Type | Enum: retailer/wholesaler/distributor/importer |
| FR-133 | Province | Zimbabwe province enum |
| FR-134 | City, Suburb | Text, required |
| FR-135 | Phone | Zimbabwe +263 format |
| FR-136 | Email | Optional, email format |
| FR-137 | Business Size | Enum: solo/2_5/6_15/16_50/50_plus |
| FR-138 | Years in Operation | Integer ≥ 0 |
| FR-139 | Business Registration Number | Optional text |

### 4.3 Step 2 — Products and Sourcing

| ID | Field | Validation |
|---|---|---|
| FR-140 | Product Categories | Multi-select, min 1; 11 product types |
| FR-141 | Sourcing Channel | Enum: local/regional/abroad/mix |
| FR-142 | Local Sourcing Percent | Optional integer 0–100 |
| FR-143 | Brands Carried | Optional text |
| FR-144 | Customer Types | Multi-select, min 1 |
| FR-145 | Refrigerant Awareness | Enum: very_aware/somewhat_aware/heard_of/not_aware |
| FR-146 | Stocks Low-GWP | Boolean, required |

### 4.4 Step 3 — Challenges

| ID | Field | Validation |
|---|---|---|
| FR-150 | Supply Challenges | Multi-select; 9 challenge types |
| FR-151 | Biggest Daily Challenge | Text, required |
| FR-152 | Load Shedding Impact | Integer Likert 1–5 |
| FR-153 | Regulatory Barriers | Optional text |
| FR-154 | Competition Level | Integer Likert 1–5 |
| FR-155 | Price Pressure | Integer Likert 1–5 |
| FR-156 | Interested in Training | Boolean, required |
| FR-157 | Training Topics | Optional text |

### 4.5 Step 4 — Consent

| ID | Field | Validation |
|---|---|---|
| FR-160 | Consent to Contact | Boolean, required |
| FR-161 | Preferred Language | Enum: english/shona/ndebele |
| FR-162 | Data Protection Consent | Must be accepted to submit |

---

## 5. MODULE 3 — ADMIN AUTHENTICATION

| ID | Requirement |
|---|---|
| FR-200 | The system MUST provide a secure login page at `/admin/login`. |
| FR-201 | Login MUST require a valid email address and password combination. |
| FR-202 | Passwords MUST be hashed with bcrypt (minimum 12 salt rounds) before storage. |
| FR-203 | On successful login, the system MUST create a session record in the database. |
| FR-204 | Session tokens MUST be JSON Web Tokens (JWT) signed with HS256. |
| FR-205 | JWTs MUST be stored in HTTP-only cookies to prevent JavaScript access. |
| FR-206 | Sessions MUST expire after a configurable period (default: 4 hours). |
| FR-207 | The system MUST redirect authenticated users from the login page to the dashboard. |
| FR-208 | The system MUST apply security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options) to all responses. |
| FR-209 | The first admin account MUST be created via a one-time setup endpoint (`/admin/setup`). |
| FR-210 | The system MUST support password reset via a secure email link (2-hour expiry). |
| FR-211 | Password reset tokens MUST be SHA-256 hashed before storage. |
| FR-212 | On successful password reset, all existing sessions for that user MUST be revoked. |
| FR-213 | Super Admins MUST be able to invite new admin users via email. |
| FR-214 | Admin invitation links MUST expire after 72 hours. |
| FR-215 | The system MUST support a maintenance mode that redirects all public traffic to a maintenance page. |

---

## 6. MODULE 4 — ADMIN DASHBOARD

| ID | Requirement |
|---|---|
| FR-300 | The dashboard MUST display real-time statistics: total submissions, today, last 7 days, verified, pending, flagged, duplicate counts. |
| FR-301 | The dashboard MUST display a bar chart of submissions by province. |
| FR-302 | The dashboard MUST display a bar chart of submissions by main work focus. |
| FR-303 | The dashboard MUST display a pie chart of submissions by certification status. |
| FR-304 | The dashboard MUST display a line chart of daily submissions over the past 30 days. |
| FR-305 | The dashboard MUST display the 10 most recent submissions in a table. |
| FR-306 | The dashboard MUST display a notification bell with unread alert count. |
| FR-307 | All dashboard data MUST be recalculated on each page load (no stale cache). |
| FR-308 | All date calculations MUST use the Africa/Harare (CAT UTC+2) timezone. |

---

## 7. MODULE 5 — RESPONSE MANAGEMENT

| ID | Requirement |
|---|---|
| FR-400 | The responses page MUST display a paginated list of all submissions. |
| FR-401 | The list MUST be filterable by: province, status (pending/verified/flagged/duplicate), main work focus, certification status, date range, and free-text search (name or phone). |
| FR-402 | The list MUST be sortable by submission date. |
| FR-403 | The system MUST support bulk status changes on selected records. |
| FR-404 | Each submission MUST have a detail view showing all 6 survey sections. |
| FR-405 | The detail view MUST display the technician's GPS location on an interactive map pin. |
| FR-406 | The detail view MUST display the profile photo if one was uploaded. |
| FR-407 | Admins MUST be able to change the status of a submission: pending → verified, pending → flagged, any → duplicate. |
| FR-408 | Admins MUST be able to add internal notes to any submission. |
| FR-409 | Admins MUST be able to fully edit any submission field. |
| FR-410 | All status changes and edits MUST be recorded in the audit log with actor identity, timestamp, and previous/new values. |
| FR-411 | When a submission is verified, the system MUST send a verification email to the technician (if email provided). |
| FR-412 | When a submission is flagged, the system MUST send a flag/action-required email with reason (if email provided). |
| FR-413 | Admins MUST be able to trigger an AI analysis of any submission. |
| FR-414 | The AI analysis MUST return: a profile summary, identified flags/concerns, and a recommendation (approve/request info/flag for manual review). |

---

## 8. MODULE 6 — GEOSPATIAL MAP

| ID | Requirement |
|---|---|
| FR-500 | The map MUST display all technician submissions with GPS coordinates as markers on a Leaflet map. |
| FR-501 | The map MUST support a heat map overlay showing technician density. |
| FR-502 | Markers MUST cluster at low zoom levels using marker clustering. |
| FR-503 | Clicking a marker MUST show the technician's name, province, and submission status. |
| FR-504 | The map MUST provide filters for: province and submission status. |

---

## 9. MODULE 7 — TECHNICIANS DIRECTORY

| ID | Requirement |
|---|---|
| FR-600 | The technicians directory MUST display a searchable, filterable table of all registered technicians. |
| FR-601 | The directory MUST support filters for: province, certification status, submission status, and name search. |
| FR-602 | The directory MUST display: name, province, certification status, work focus, phone, email, submission date, and status. |
| FR-603 | The directory MUST support export to CSV. |

---

## 10. MODULE 8 — ANALYTICS AND INSIGHTS

| ID | Requirement |
|---|---|
| FR-700 | The insights module MUST display aggregated analytics across 4 dimensions: Skills, Energy Efficiency, Challenges, and Resources. |
| FR-701 | Each dimension MUST display mean Likert scores, frequency distributions, and percentage breakdowns. |
| FR-702 | Admins MUST be able to trigger AI-generated narrative summaries for any insights view. |
| FR-703 | The province comparison module MUST allow side-by-side comparison of metrics across provinces. |
| FR-704 | The period comparison module MUST allow comparison of metrics between two date ranges. |
| FR-705 | The survey funnel module MUST show drop-off rates at each survey step based on survey_events data. |
| FR-706 | The coverage gap module MUST show which provinces and districts have low technician representation. |
| FR-707 | The duplicates module MUST identify and surface potential duplicate submissions based on phone, name, and location similarity. |

---

## 11. MODULE 9 — REPORTING

| ID | Requirement |
|---|---|
| FR-800 | The system MUST provide 7 pre-configured report types: Technician Survey Report, Methodology & Readiness, Skills Gap Analysis, Tools & Equipment, Barrier Analysis, Geo Mapping, Achievement & Gaps. |
| FR-801 | Each report MUST be auto-populated from live database data. |
| FR-802 | Reports MUST support AI-generated narrative summaries. |
| FR-803 | The Technician Survey Report MUST support a configurable reporting period (start and end date). |
| FR-804 | Generated reports MUST be saveable as records (with PDF URL, AI summary, and metadata) in the database. |
| FR-805 | Generated PDFs MUST be storable in Cloudflare R2 and downloadable by admins. |
| FR-806 | The Report Builder MUST allow custom cross-tabulations with configurable columns and filters. |

---

## 12. MODULE 10 — DATA EXPORT

| ID | Requirement |
|---|---|
| FR-900 | The export module MUST support 5 output formats: CSV, Excel (.xlsx), PDF, GeoJSON, SPSS (.sav). |
| FR-901 | Exports MUST be filterable by all the same criteria as the responses list. |
| FR-902 | Admins MUST be able to select which data sections to include in exports. |
| FR-903 | Exports MUST support an anonymisation option that removes: first name, surname, phone, and email, replacing the record ID with a SHA-256 hash. |
| FR-904 | Admins MUST be able to toggle whether profile photo URLs are included. |
| FR-905 | All export events MUST be logged to the export_log table with: actor, format, filters, row count, and anonymisation status. |

---

## 13. MODULE 11 — MESSAGING

| ID | Requirement |
|---|---|
| FR-1000 | Super Admins MUST be able to compose and send broadcast emails to all technicians who provided email addresses. |
| FR-1001 | The messaging system MUST use the Resend email API. |
| FR-1002 | Emails MUST be sent in batches of 50 recipients per API call to comply with Resend limits. |
| FR-1003 | The system MUST report the number of successful and failed deliveries after a broadcast send. |

---

## 14. MODULE 12 — EMAIL NOTIFICATIONS

The system MUST send the following emails automatically:

| ID | Trigger | Recipient | Subject |
|---|---|---|---|
| FR-1100 | Technician submits survey | Technician (if email provided) | "Registration Submitted — RAC Technician Registry" with reference number |
| FR-1101 | Admin verifies submission | Technician (if email provided) | "Registration Verified — RAC Technician Registry" |
| FR-1102 | Admin flags submission | Technician (if email provided) | "Action Required — RAC Technician Registry" with reason |
| FR-1103 | New submission created | All active admin users | "New Survey Submission — [Name], [Province]" |
| FR-1104 | Admin user invited | Invited user | "Admin Portal Invitation — RAC Technician Registry" |
| FR-1105 | Password reset requested | Admin user | "Password Reset — RAC Technician Registry Admin" |

All emails MUST use the NOU · HEVACRAZ branded HTML template with organisation logo, primary colour `#0d4f3c`, and footer.

---

## 15. MODULE 13 — AUDIT TRAIL

| ID | Requirement |
|---|---|
| FR-1200 | Every status change on a technician submission MUST be recorded in the audit_log table. |
| FR-1201 | Every field edit on a technician submission MUST be recorded in the audit_log table with the before and after values. |
| FR-1202 | Audit entries MUST record: actor identity (admin ID or applicant phone), actor type, action description, payload, and timestamp. |
| FR-1203 | Audit entries MUST be immutable — no delete or update operations allowed. |
| FR-1204 | The sysadmin dashboard MUST display the full system_events log. |
| FR-1205 | The sysadmin dashboard MUST be accessible only to a designated email address (whitelist-controlled). |

---

## 16. MODULE 14 — OFFLINE / PWA

| ID | Requirement |
|---|---|
| FR-1300 | The survey MUST function without an internet connection using a Progressive Web App (PWA) service worker. |
| FR-1301 | Incomplete submissions MUST be saveable to browser local storage (draft) and resumable. |
| FR-1302 | Completed offline submissions MUST be queued in IndexedDB for later synchronisation. |
| FR-1303 | When internet is restored, the system MUST automatically attempt to synchronise all queued submissions. |
| FR-1304 | The system MUST display an offline indicator banner when the device is not connected. |
| FR-1305 | The PWA MUST be installable on Android and iOS home screens. |
| FR-1306 | Offline-submitted records MUST be tagged with submission_source = 'pwa_offline_sync'. |

---

## 17. MODULE 15 — PUBLIC REGISTRY

| ID | Requirement |
|---|---|
| FR-1400 | Admins MUST be able to preview the public-facing registry of verified technicians. |
| FR-1401 | Only technicians with status=verified AND consent_to_public_registry=true MUST appear in the public registry. |
| FR-1402 | The public registry MUST display: first name, surname, province, and certification badge (if certified). |
| FR-1403 | The public registry MUST NOT display: phone number, email, GPS coordinates, or any Likert scale responses. |

---

## 18. NON-MODULAR REQUIREMENTS

| ID | Requirement |
|---|---|
| FR-1500 | The system MUST support a maintenance mode redirecting all public traffic to a maintenance page, controlled by an environment variable. |
| FR-1501 | Maintenance mode MUST exempt: admin login, admin setup, and the maintenance page itself. |
| FR-1502 | The system MUST track survey interaction events (step enter/exit, saves) in the survey_events table for funnel analysis. |
| FR-1503 | The system MUST support uploading profile photos with server-side validation (content type: JPG/PNG/WebP, max 2MB). |
| FR-1504 | Photo uploads MUST use presigned URLs — the browser uploads directly to Cloudflare R2 (no server proxying). |
| FR-1505 | The system MUST support admin entry of new submissions (submission_source = 'admin_entry') for paper-based data capture. |

---

*Document End*
