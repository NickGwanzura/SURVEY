# SYSTEM REQUIREMENTS SPECIFICATION
## National RAC Technician Registry — ZW RAC Survey Platform

**Document Reference:** NOU-HEVACRAZ-SRS-2025-001
**Version:** 1.0
**Date:** 2025-06-01
**Status:** Finalised

---

## 1. INTRODUCTION

### 1.1 Purpose

This System Requirements Specification (SRS) defines the non-functional requirements for the National RAC Technician Registry platform — those requirements that govern how the system performs, scales, operates, and is maintained. This document complements the Functional Requirements Specification (FRS) which defines what the system does.

### 1.2 Definitions

| Term | Definition |
|---|---|
| NFR | Non-Functional Requirement |
| PII | Personally Identifiable Information |
| PWA | Progressive Web App |
| CAT | Central Africa Time (UTC+2, Africa/Harare) |
| SLA | Service Level Agreement |
| RTO | Recovery Time Objective |
| RPO | Recovery Point Objective |

---

## 2. PERFORMANCE REQUIREMENTS

### 2.1 Response Time

| ID | Requirement | Target |
|---|---|---|
| NFR-P001 | Public survey page load time (initial) | ≤ 3 seconds on 3G connection |
| NFR-P002 | Admin dashboard load time | ≤ 5 seconds on broadband |
| NFR-P003 | Survey step navigation (client-side) | ≤ 200ms |
| NFR-P004 | Survey submission API response | ≤ 10 seconds |
| NFR-P005 | Data export (CSV, up to 10,000 records) | ≤ 30 seconds |
| NFR-P006 | AI analysis response | ≤ 60 seconds (dependent on Groq API) |
| NFR-P007 | Map render (up to 5,000 markers) | ≤ 5 seconds |
| NFR-P008 | Admin responses list (paginated, 50 rows) | ≤ 3 seconds |

### 2.2 Throughput

| ID | Requirement | Target |
|---|---|---|
| NFR-P010 | Concurrent survey submissions | ≥ 50 simultaneous users without degradation |
| NFR-P011 | Peak daily survey submissions | System MUST handle ≥ 500 submissions per day |
| NFR-P012 | Total registry capacity | Database MUST support ≥ 50,000 technician records |
| NFR-P013 | Email delivery throughput | ≥ 1,000 emails per hour (via Resend batching) |

---

## 3. AVAILABILITY AND RELIABILITY

| ID | Requirement |
|---|---|
| NFR-A001 | The system MUST achieve ≥ 99% uptime during business hours (08:00–18:00 CAT, Monday–Friday). |
| NFR-A002 | The system MUST achieve ≥ 95% uptime outside business hours. |
| NFR-A003 | Planned maintenance windows MUST be announced 24 hours in advance. |
| NFR-A004 | The system MUST support a maintenance mode that redirects public traffic without data loss. |
| NFR-A005 | RTO (Recovery Time Objective) in case of infrastructure failure: ≤ 4 hours. |
| NFR-A006 | RPO (Recovery Point Objective): ≤ 24 hours (no more than 1 day of data loss). |
| NFR-A007 | The survey MUST remain usable offline (PWA) regardless of server availability. |
| NFR-A008 | The system MUST queue offline submissions in IndexedDB and sync them automatically when connectivity is restored. |

---

## 4. SECURITY REQUIREMENTS

### 4.1 Authentication and Session Management

| ID | Requirement |
|---|---|
| NFR-S001 | All administrator accounts MUST require email and password authentication. |
| NFR-S002 | Passwords MUST be hashed using bcrypt with a minimum cost factor of 12. |
| NFR-S003 | Session tokens MUST be JSON Web Tokens (JWT) signed with HMAC-SHA256. |
| NFR-S004 | JWTs MUST be stored in HTTP-only, Secure, SameSite=Lax cookies. |
| NFR-S005 | Session TTL MUST NOT exceed 8 hours. Default: 4 hours. |
| NFR-S006 | The system MUST support session revocation (database-backed sessions, not purely stateless). |
| NFR-S007 | All active sessions MUST be revoked on password reset. |
| NFR-S008 | The system MUST implement a setup-once mechanism for the first admin account. |

### 4.2 Data Protection

| ID | Requirement |
|---|---|
| NFR-S020 | All data transmission MUST use TLS 1.2 or higher (enforced via HSTS). |
| NFR-S021 | The HSTS header MUST be set with `max-age=31536000; includeSubDomains; preload`. |
| NFR-S022 | PII fields (name, phone, email) MUST be omitted from anonymised exports. |
| NFR-S023 | Anonymised exports MUST replace record IDs with SHA-256-derived pseudonymous hashes. |
| NFR-S024 | All data consent events MUST be logged with timestamp, IP address, and user agent. |
| NFR-S025 | Profile photos MUST be stored in private object storage (Cloudflare R2) with presigned URL access. |
| NFR-S026 | Database connections MUST use SSL in production. |

### 4.3 HTTP Security Headers

All HTTP responses MUST include:

| Header | Required Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self' https://*.tile.openstreetmap.org; font-src 'self' data:; object-src 'none'; frame-src 'none'` |

### 4.4 Input Validation and Injection Prevention

| ID | Requirement |
|---|---|
| NFR-S030 | All user inputs MUST be validated server-side using Zod schemas, regardless of client-side validation. |
| NFR-S031 | All database queries MUST use parameterised queries via Drizzle ORM (no string concatenation). |
| NFR-S032 | Uploaded files MUST be validated for content type and size before processing. |
| NFR-S033 | HTML content in broadcast emails MUST be sanitised before sending. |
| NFR-S034 | Admin routes MUST re-verify session validity on the server for every protected operation. |

### 4.5 Audit and Compliance

| ID | Requirement |
|---|---|
| NFR-S040 | All admin actions MUST be logged to an immutable audit trail (audit_log table). |
| NFR-S041 | All system-level events MUST be logged to the system_events table. |
| NFR-S042 | All data exports MUST be logged to the export_log table. |
| NFR-S043 | Audit log entries MUST NOT be deletable or updatable via the application. |
| NFR-S044 | The system MUST collect and store technician data consent in accordance with Zimbabwe's data protection legislation. |

---

## 5. USABILITY REQUIREMENTS

| ID | Requirement |
|---|---|
| NFR-U001 | The survey MUST be completable by a person with basic smartphone literacy in 10–15 minutes. |
| NFR-U002 | All form fields MUST display clear, plain-English labels and error messages. |
| NFR-U003 | Error messages MUST identify the specific field and explain what is required. |
| NFR-U004 | The survey MUST allow navigation backwards without losing data. |
| NFR-U005 | The survey MUST display a visual progress indicator (step n of 6). |
| NFR-U006 | The survey wizard MUST save draft data to local storage automatically. |
| NFR-U007 | All interactive elements MUST have a minimum touch target size of 44×44px (WCAG 2.5.5). |
| NFR-U008 | The admin portal MUST be navigable by keyboard. |
| NFR-U009 | All images MUST have descriptive alt text. |
| NFR-U010 | The survey MUST be usable on screens as small as 320px wide. |

---

## 6. COMPATIBILITY REQUIREMENTS

### 6.1 Browser Support

The following browsers MUST be supported (latest 2 major versions):

| Browser | Minimum Version | Priority |
|---|---|---|
| Chrome for Android | Latest 2 | Critical (primary target) |
| Chrome Desktop | Latest 2 | High |
| Firefox Desktop | Latest 2 | High |
| Safari Mobile (iOS) | Latest 2 | High |
| Microsoft Edge | Latest 2 | Medium |
| Samsung Internet | Latest 2 | Medium |
| Opera Mini (Extreme) | N/A | Low (PWA offline only) |

### 6.2 Device Requirements

| ID | Requirement |
|---|---|
| NFR-C001 | The survey MUST be usable on Android smartphones with 2GB RAM running Android 8+. |
| NFR-C002 | The PWA installation MUST work on Android Chrome and iOS Safari. |
| NFR-C003 | The survey MUST function on low-bandwidth connections (2G/EDGE with ≥ 50kbps). |
| NFR-C004 | GPS capture MUST work on any device with a GPS receiver. |
| NFR-C005 | Photo capture MUST work with device camera on mobile, and file upload on desktop. |

### 6.3 Data Format Compatibility

| ID | Requirement |
|---|---|
| NFR-C010 | CSV exports MUST be importable into Microsoft Excel 2016+. |
| NFR-C011 | Excel exports MUST use .xlsx format (ISO/IEC 29500). |
| NFR-C012 | GeoJSON exports MUST conform to RFC 7946 (GeoJSON standard). |
| NFR-C013 | SPSS exports MUST produce valid .sav files importable into SPSS v25+. |
| NFR-C014 | PDF exports MUST be valid PDF/A-1b format readable in Adobe Reader 11+. |

---

## 7. SCALABILITY REQUIREMENTS

| ID | Requirement |
|---|---|
| NFR-SC001 | The database schema MUST support growth to 100,000+ technician records without schema changes. |
| NFR-SC002 | Database indexes MUST be applied to all commonly queried columns (phone, email, province, status, submitted_at). |
| NFR-SC003 | The GIN index on main_work_focus JSONB MUST support efficient array containment queries. |
| NFR-SC004 | Export generation MUST use streaming or chunked queries for large datasets (>10,000 records). |
| NFR-SC005 | The system MUST be deployable on serverless infrastructure that scales horizontally on demand. |

---

## 8. INTERNATIONALISATION REQUIREMENTS

| ID | Requirement |
|---|---|
| NFR-I001 | The system MUST support **English** as the primary interface language. |
| NFR-I002 | The system MUST support **Shona** and **Ndebele** as additional interface languages (planned). |
| NFR-I003 | All date and time displays MUST use the **Africa/Harare (CAT UTC+2)** timezone. |
| NFR-I004 | All date exports MUST include timezone offset (ISO 8601 format with `+02:00`). |
| NFR-I005 | Phone number validation MUST enforce Zimbabwe international format (`+263XXXXXXXXX`). |
| NFR-I006 | Geographic data MUST use Zimbabwe's 10-province administrative structure. |
| NFR-I007 | Currency references, if any, MUST use Zimbabwe Gold (ZiG) or USD as appropriate. |

---

## 9. MAINTAINABILITY REQUIREMENTS

| ID | Requirement |
|---|---|
| NFR-M001 | All source code MUST be written in TypeScript with strict type checking enabled. |
| NFR-M002 | The codebase MUST pass ESLint with the next.js recommended configuration. |
| NFR-M003 | Database schema changes MUST be managed through versioned Drizzle ORM migrations. |
| NFR-M004 | Each migration MUST be idempotent (use IF NOT EXISTS, IF EXISTS guards). |
| NFR-M005 | The system MUST support environment-variable-based configuration (no hard-coded secrets). |
| NFR-M006 | All environment variables MUST be documented with their purpose and example values. |
| NFR-M007 | The codebase MUST achieve ≥ 60% automated test coverage before production deployment. |
| NFR-M008 | A CI/CD pipeline MUST run lint, type check, and tests on every pull request. |

---

## 10. INFRASTRUCTURE REQUIREMENTS

### 10.1 Hosting

| ID | Requirement |
|---|---|
| NFR-INF001 | The application MUST be hosted on a PaaS platform with global CDN (Vercel, AWS Amplify, or equivalent). |
| NFR-INF002 | The hosting platform MUST support Next.js 16+ App Router deployment. |
| NFR-INF003 | The hosting platform MUST support Edge Runtime for middleware execution. |
| NFR-INF004 | The system MUST use a managed PostgreSQL service (Neon, AWS RDS, or equivalent) with automatic daily backups. |
| NFR-INF005 | The system MUST use a cloud object store for profile photos with at least 11 nines (99.999999999%) durability. |
| NFR-INF006 | The production domain MUST be `racregistryzw.org` with valid TLS certificate. |

### 10.2 Environment Separation

| ID | Requirement |
|---|---|
| NFR-INF010 | The system MUST maintain separate production and development/staging environments. |
| NFR-INF011 | Database credentials MUST differ between environments. |
| NFR-INF012 | PWA service worker MUST only be active in production (disabled in development). |

### 10.3 Backup and Recovery

| ID | Requirement |
|---|---|
| NFR-INF020 | Database MUST be backed up automatically at least once every 24 hours. |
| NFR-INF021 | Backups MUST be retained for at least 30 days. |
| NFR-INF022 | A documented restore procedure MUST exist and be tested annually. |
| NFR-INF023 | Object storage (photos) MUST replicate data across at least 2 geographic zones. |

---

## 11. MONITORING AND OBSERVABILITY REQUIREMENTS

| ID | Requirement |
|---|---|
| NFR-OBS001 | The system MUST provide server-side error logging (Sentry or equivalent). |
| NFR-OBS002 | Unhandled exceptions MUST trigger alerts to the system administrator. |
| NFR-OBS003 | Uptime monitoring MUST check the public survey endpoint at minimum every 5 minutes. |
| NFR-OBS004 | Failed email deliveries MUST be logged and surfaced to administrators. |
| NFR-OBS005 | Database query errors MUST be logged with the query context (excluding PII). |
| NFR-OBS006 | An in-application sysadmin dashboard MUST display system event logs and health metrics. |

---

## 12. LEGAL AND COMPLIANCE REQUIREMENTS

| ID | Requirement |
|---|---|
| NFR-L001 | The system MUST comply with the **Zimbabwe Data Protection Act** (Chapter 11:21). |
| NFR-L002 | The system MUST obtain explicit, informed consent before processing personal data. |
| NFR-L003 | Data consent events MUST be recorded with timestamp, IP address, and user agent as evidence. |
| NFR-L004 | Technicians MUST be able to request deletion of their data. |
| NFR-L005 | The system MUST display a Privacy Notice explaining data collection, use, storage, and rights. |
| NFR-L006 | Exported data used for UNEP reporting MUST be capable of being anonymised. |
| NFR-L007 | The system MUST support the **Montreal Protocol Kigali Amendment** reporting requirements for HFC technician data. |

---

*Document End*
