# SYSTEM ARCHITECTURE DOCUMENTATION
## National RAC Technician Registry — ZW RAC Survey Platform

**Document Reference:** NOU-HEVACRAZ-ARCH-2025-001
**Version:** 1.0
**Date:** 2025-06-01
**Status:** Finalised

---

## 1. OVERVIEW

The National RAC Technician Registry is a **cloud-native, serverless web application** built on the Next.js full-stack framework. It follows a modern **server-rendered + client-enhanced** architecture with a single unified codebase serving both the public survey interface and the administrator portal.

### 1.1 Architecture Principles

1. **Serverless-first** — No persistent server processes; compute scales to zero when idle
2. **Security-by-default** — Security headers, HTTP-only cookies, parameterised queries enforced globally
3. **Offline-resilient** — PWA service worker enables survey completion without connectivity
4. **Separation of concerns** — Public survey and admin portal are architecturally isolated
5. **Audit-everything** — All mutations are logged to immutable audit tables

---

## 2. SYSTEM CONTEXT DIAGRAM (C4 Level 1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SYSTEM BOUNDARY                                       │
│                                                                               │
│   ┌────────────┐          ┌─────────────────────────────┐                    │
│   │  RAC       │  HTTPS   │                             │                    │
│   │ Technician │◄────────►│  ZW RAC Survey Platform     │                    │
│   │ (Public)   │          │  (racregistryzw.org)        │                    │
│   └────────────┘          │                             │                    │
│                           │  National RAC Technician    │                    │
│   ┌────────────┐  HTTPS   │  Registry System            │                    │
│   │  Retailer  │◄────────►│                             │                    │
│   │ (Public)   │          └──────────────┬──────────────┘                    │
│                                          │                                    │
│   ┌────────────┐  HTTPS                  │ calls external services            │
│   │   NOU /    │◄────────►               │                                    │
│   │ HEVACRAZ   │  Admin                  │                                    │
│   │   Admin    │  Portal                 │                                    │
│   └────────────┘                         │                                    │
│                                          │                                    │
└──────────────────────────────────────────┼────────────────────────────────────┘
                                           │
                    ┌──────────────────────┼───────────────────────┐
                    │                      │                        │
               ┌────▼─────┐         ┌─────▼────┐            ┌─────▼────┐
               │  Neon    │         │Cloudflare│            │  Resend  │
               │PostgreSQL│         │   R2     │            │  Email   │
               │(Database)│         │(Photos)  │            │  (SMTP)  │
               └──────────┘         └──────────┘            └──────────┘
                                                             ┌──────────┐
                                                             │  Groq    │
                                                             │  AI API  │
                                                             └──────────┘
```

---

## 3. CONTAINER DIAGRAM (C4 Level 2)

```
┌──────────────────────── Vercel Edge Network ───────────────────────────────┐
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │                    Next.js Application                               │     │
│  │  ┌───────────────────────┐    ┌──────────────────────────────────┐  │     │
│  │  │   Edge Middleware      │    │         App Router               │  │     │
│  │  │  (middleware.ts)       │    │                                  │  │     │
│  │  │  • Auth verification   │    │  ┌─────────────┐ ┌────────────┐ │  │     │
│  │  │  • Security headers    │    │  │ Public Pages │ │Admin Pages │ │  │     │
│  │  │  • Maintenance mode    │    │  │ (React SSR/  │ │(React SSR/ │ │  │     │
│  │  │  • Route protection    │    │  │  Client)     │  Client)     │ │  │     │
│  │  └───────────────────────┘    │  └─────────────┘ └────────────┘ │  │     │
│  │                               │                                  │  │     │
│  │                               │  ┌─────────────────────────────┐ │  │     │
│  │                               │  │     API Route Handlers       │ │  │     │
│  │                               │  │  /api/survey/*               │ │  │     │
│  │                               │  │  /api/admin/*                │ │  │     │
│  │                               │  │  /api/retailer-survey/*      │ │  │     │
│  │                               │  └─────────────────────────────┘ │  │     │
│  │                               └──────────────────────────────────┘  │     │
│  │                                                                       │     │
│  │  ┌──────────────────────────────────────────────────────────────┐    │     │
│  │  │               Browser / PWA (Client Layer)                    │    │     │
│  │  │  • React 19 components       • Leaflet maps                   │    │     │
│  │  │  • Recharts analytics        • IndexedDB offline queue (idb)  │    │     │
│  │  │  • Serwist service worker    • React Hook Form + Zod          │    │     │
│  │  └──────────────────────────────────────────────────────────────┘    │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────────────────────┘
         │ Drizzle ORM          │ AWS SDK S3         │ Resend SDK    │ Groq SDK
         ▼                      ▼                    ▼               ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────┐    ┌──────────────┐
│ Neon         │    │ Cloudflare R2    │    │  Resend  │    │  Groq API    │
│ PostgreSQL   │    │ (Object Storage) │    │  Email   │    │ Llama 3.3 70B│
└──────────────┘    └──────────────────┘    └──────────┘    └──────────────┘
```

---

## 4. COMPONENT ARCHITECTURE

### 4.1 Frontend Layer

```
app/
├── (public)/              ← Public-facing survey routes (no auth)
│   ├── layout.tsx         ← Minimal public layout
│   ├── page.tsx           ← Landing page
│   ├── survey/            ← Technician survey wizard
│   ├── retailer-survey/   ← Retailer survey wizard
│   ├── edit/              ← Edit existing application
│   └── privacy-notice/    ← Data protection notice
│
├── admin/                 ← Admin portal (JWT protected)
│   ├── layout.tsx         ← Admin shell with sidebar
│   ├── AdminSidebar.tsx   ← Navigation sidebar
│   ├── dashboard/         ← KPI dashboard
│   ├── responses/         ← Submission management
│   ├── map/               ← Geospatial map
│   ├── technicians/       ← Directory listing
│   ├── insights/          ← Analytics dashboards
│   ├── provinces/         ← Province comparison
│   ├── comparison/        ← Period comparison
│   ├── funnel/            ← Survey funnel
│   ├── coverage/          ← Coverage gaps
│   ├── duplicates/        ← Duplicate detection
│   ├── export/            ← Data export
│   ├── report-builder/    ← Custom reports
│   ├── reports/           ← Pre-configured reports (7 types)
│   ├── registry-preview/  ← Public registry preview
│   ├── messaging/         ← Broadcast messaging
│   ├── users/             ← Admin user management
│   └── sysadmin/          ← System audit log
│
├── api/                   ← REST API routes
│   ├── survey/            ← Public survey APIs
│   ├── retailer-survey/   ← Public retailer APIs
│   └── admin/             ← Protected admin APIs
│
└── maintenance/           ← Maintenance mode page
```

### 4.2 Shared Component Library

```
components/
├── ui/                    ← Design system primitives
│   ├── Button.tsx         ← All button variants
│   ├── Field.tsx          ← Form field wrapper with label/error
│   ├── Input.tsx          ← Text input component
│   ├── Modal.tsx          ← Accessible modal dialog
│   ├── Select.tsx         ← Dropdown select
│   ├── Skeleton.tsx       ← Loading placeholders
│   └── Toast.tsx          ← Notification toasts
│
├── survey/                ← Survey wizard components
│   ├── SurveyWizard.tsx   ← 6-step technician wizard
│   ├── RetailerSurveyWizard.tsx ← 4-step retailer wizard
│   ├── steps/             ← Individual step components
│   ├── GpsCapture.tsx     ← Geolocation + map picker
│   ├── PhotoCapture.tsx   ← Camera/file upload + R2
│   ├── OfflineBanner.tsx  ← Connectivity indicator
│   ├── SyncWatcher.tsx    ← Background sync trigger
│   └── InstallPrompt.tsx  ← PWA install banner
│
└── admin/                 ← Admin portal components
    ├── charts/            ← Bar, Line, Pie charts (Recharts)
    ├── dashboard/         ← Dashboard widgets
    ├── insights/          ← Analytics sections
    ├── map/               ← Leaflet map + heat map
    ├── report-builder/    ← Custom report builder
    ├── reports/           ← Report components
    ├── responses/         ← Response management
    ├── sysadmin/          ← System monitoring
    ├── technicians/       ← Directory components
    └── users/             ← User management
```

### 4.3 Business Logic Layer

```
lib/
├── schema.ts             ← Drizzle ORM schema (single source of truth)
├── db.ts                 ← Neon DB connection
├── auth.ts               ← JWT session management (server)
├── auth-edge.ts          ← JWT verification (edge runtime)
├── auth-server.ts        ← getCurrentAdmin() helper
├── validation.ts         ← Zod schemas for all survey inputs
├── offline-sync.ts       ← IndexedDB offline queue
├── r2.ts                 ← Cloudflare R2 presigned uploads
├── audit.ts              ← Audit log helpers
├── cn.ts                 ← Tailwind class merging utility
├── constants/            ← All enumerated values
│   ├── provinces.ts      ← Zimbabwe 10 provinces + districts
│   ├── challenges.ts     ← Challenges, frequencies, barriers
│   ├── ageGroups.ts      ← Age/gender/experience enums
│   ├── educationLevels.ts
│   ├── refrigerants.ts   ← Certification types
│   ├── workFocus.ts      ← HVAC-R work focus types
│   └── retailers.ts      ← Retailer-specific constants
└── admin/                ← Admin data access layer
    ├── stats-data.ts     ← Dashboard statistics
    ├── responses-data.ts ← Responses list + detail
    ├── insights-data.ts  ← Analytics queries
    ├── email.ts          ← Email sending (Resend)
    ├── ai-analysis.ts    ← Groq AI integration
    ├── exporters/        ← CSV/Excel/PDF/GeoJSON/SPSS
    └── ...               ← Other data access modules
```

---

## 5. API ARCHITECTURE

### 5.1 Public Survey APIs

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/survey/submit` | POST | None | Submit technician survey |
| `/api/survey/[id]` | GET | None | Retrieve submission by ID |
| `/api/survey/lookup` | POST | None | Lookup submission by phone |
| `/api/survey/check-phone` | GET | None | Check if phone already registered |
| `/api/survey/event` | POST | None | Track survey funnel events |
| `/api/survey/upload-photo` | POST | None | Get presigned R2 upload URL |
| `/api/retailer-survey/submit` | POST | None | Submit retailer survey |

### 5.2 Admin Authentication APIs

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/admin/auth/login` | POST | None | Admin login → JWT cookie |
| `/api/admin/auth/logout` | POST | JWT | Revoke session |
| `/api/admin/auth/me` | GET | JWT | Get current admin profile |
| `/api/admin/auth/setup` | POST | None | Create first/invited admin |
| `/api/admin/auth/forgot-password` | POST | None | Request password reset email |
| `/api/admin/auth/reset-password` | POST | None | Consume reset token → new password |

### 5.3 Protected Admin APIs

| Route | Method | Purpose |
|---|---|---|
| `/api/admin/stats` | GET | Dashboard statistics |
| `/api/admin/responses` | GET | Paginated submissions list |
| `/api/admin/responses/[id]` | GET, PATCH | Response detail + update |
| `/api/admin/export` | POST | Multi-format data export |
| `/api/admin/insights` | GET | Aggregated analytics data |
| `/api/admin/messaging` | POST | Broadcast email to technicians |
| `/api/admin/notifications` | GET | Admin notification bell data |
| `/api/admin/ai-analyze` | POST | AI analysis of a submission |
| `/api/admin/ai-analyze/report` | POST | AI analysis of report data |
| `/api/admin/report-builder` | POST | Custom cross-tabulation |
| `/api/admin/reports/technician-survey` | GET | List generated reports |
| `/api/admin/reports/technician-survey/generate` | POST | Generate new report |
| `/api/admin/reports/technician-survey/[id]` | GET | Get report by ID |
| `/api/admin/reports/technician-survey/[id]/download` | GET | Download report PDF |
| `/api/admin/reports/export` | POST | Export any report |
| `/api/admin/technicians/export` | POST | Export technician directory |
| `/api/admin/users` | GET | List admin users |
| `/api/admin/users/invite` | POST | Invite new admin |
| `/api/admin/verify` | POST | Verify a submission |
| `/api/admin/system-events` | GET | System event log |

### 5.4 API Request Lifecycle

```
Client Request
    │
    ▼
Edge Middleware (middleware.ts)
    ├── Apply security headers (always)
    ├── Check maintenance mode → redirect if enabled
    ├── Admin routes: verify JWT cookie → redirect to login if invalid
    └── Pass through
    │
    ▼
API Route Handler
    ├── Parse request body/query
    ├── Zod validation → 400 if invalid
    ├── Admin: getCurrentAdmin() → DB session verification
    ├── Business logic
    ├── Drizzle ORM query → Neon PostgreSQL
    ├── Side effects: email, R2, AI, audit log
    └── Return JSON response
```

---

## 6. AUTHENTICATION ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────┐
│                  Authentication Flow                          │
│                                                               │
│  1. POST /api/admin/auth/login                               │
│     ├── Lookup admin_user by email                          │
│     ├── bcrypt.compare(password, hash)                       │
│     ├── INSERT admin_sessions (id, admin_user_id, expires)  │
│     ├── SignJWT({ sub: userId, sid: sessionId, role })       │
│     └── Set-Cookie: zw_rac_admin=<JWT>; HttpOnly; Secure    │
│                                                               │
│  2. Every subsequent request to /admin/*                     │
│     ├── [Edge] verifySessionTokenEdge(cookie.value)         │
│     │   → jwtVerify with AUTH_SECRET                        │
│     └── If invalid → redirect /admin/login                  │
│                                                               │
│  3. Server-side admin pages / API routes                     │
│     ├── getCurrentAdmin() / loadActiveSession()             │
│     ├── SELECT admin_sessions JOIN admin_users               │
│     ├── WHERE session.id = payload.sid                       │
│     │     AND admin_user.id = payload.sub                   │
│     │     AND is_active = true                               │
│     │     AND revoked_at IS NULL                             │
│     │     AND expires_at > NOW()                            │
│     └── Returns { user, sessionId } or null                 │
│                                                               │
│  4. Logout                                                    │
│     ├── UPDATE admin_sessions SET revoked_at = NOW()        │
│     └── Delete cookie                                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. OFFLINE / PWA ARCHITECTURE

```
┌────────────────────────────────────────────────────────────┐
│                  PWA Offline Architecture                   │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────────────────┐  │
│  │ Serwist Service  │    │      Browser Application      │  │
│  │ Worker (sw.ts)   │    │                               │  │
│  │                  │    │  ┌──────────────────────────┐ │  │
│  │ • Cache static   │    │  │   SurveyWizard.tsx        │ │  │
│  │   assets         │    │  │   • Local storage draft   │ │  │
│  │ • Cache on nav   │    │  │   • Step validation       │ │  │
│  │ • Reload online  │    │  └──────────────────────────┘ │  │
│  └──────────────────┘    │                               │  │
│           │              │  ┌──────────────────────────┐ │  │
│           │              │  │  offline-sync.ts          │ │  │
│           │              │  │  (IndexedDB via idb)      │ │  │
│  ┌────────▼───────┐      │  │  • queueSubmission()      │ │  │
│  │  Cached Assets │      │  │  • queuePhoto()           │ │  │
│  │  (HTML,CSS,JS) │      │  │  • flushQueuedSubmissions │ │  │
│  └────────────────┘      │  └──────────────┬────────────┘ │  │
│                          │                  │              │  │
│                          │  ┌───────────────▼────────────┐ │  │
│                          │  │   SyncWatcher.tsx           │ │  │
│                          │  │   • Listens for 'online'   │ │  │
│                          │  │   • Triggers flush()       │ │  │
│                          │  └───────────────┬────────────┘ │  │
│                          └──────────────────┼──────────────┘  │
└─────────────────────────────────────────────┼──────────────────┘
                                              │ When online
                                              ▼
                               POST /api/survey/submit
                               (submissionSource: pwa_offline_sync)
```

---

## 8. DATA FLOW DIAGRAMS

### 8.1 Survey Submission Data Flow

```
[Browser] → Form Data
    │
    │ Client-side Zod validation
    ▼
POST /api/survey/submit
    │
    │ Server-side Zod validation (surveySubmissionSchema)
    ├── 400 if validation fails
    │
    │ Check duplicate phone
    ├── 409 if duplicate found
    │
    │ INSERT technicians_survey (status: pending)
    │
    ├── [if email provided] sendSurveyCompletedEmail via Resend
    ├── notifyAdminsOfNewSubmission → sendNewSubmissionAlertEmail × N
    │
    │ [if profile_photo_url provided] already uploaded to R2 via presigned URL
    │
    └── 200 { id, referenceNumber }
```

### 8.2 Photo Upload Data Flow

```
[Browser] → PhotoCapture.tsx
    │
    │ 1. browser-image-compression (reduce to < 2MB)
    │
    │ 2. POST /api/survey/upload-photo { contentType, byteLength }
    │       → createSignedPhotoUpload() → R2 presigned PUT URL (5 min expiry)
    │       ← { uploadUrl, publicUrl, key }
    │
    │ 3. PUT <uploadUrl> (direct browser → R2, no server proxy)
    │
    └── 4. Store publicUrl in form state → submitted with survey
```

### 8.3 Admin Response Approval Data Flow

```
[Admin Browser]
    │
    │ PATCH /api/admin/responses/[id]
    │   body: { status: 'verified', notes: '...' }
    │
    │ Verify admin session (getCurrentAdmin)
    │
    │ UPDATE technicians_survey SET status = 'verified'
    │
    │ INSERT audit_log (action: 'status_change', payload: { from, to })
    │
    │ INSERT system_events (event_type: 'response.verified')
    │
    ├── [if email] sendVerifiedEmail via Resend
    │
    └── 200 { success: true }
```

---

## 9. SECURITY ARCHITECTURE

### 9.1 Defence in Depth

```
Layer 1: Network
    └── TLS 1.2+ enforced by Vercel (no plaintext HTTP)

Layer 2: HTTP Headers (middleware.ts — applied to EVERY response)
    └── HSTS, CSP, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy

Layer 3: Authentication
    ├── JWT in HTTP-only cookies (JavaScript cannot read)
    ├── Edge JWT verification (fast path, no DB)
    └── Server DB session verification (revocation check)

Layer 4: Authorisation
    ├── Route-level: middleware protects all /admin/* routes
    ├── Feature-level: Super Admin required for user management
    └── Sysadmin: email whitelist enforcement

Layer 5: Input Validation
    ├── Client-side: Zod schemas (UX aid)
    └── Server-side: Zod schemas (security control — always run)

Layer 6: Data Access
    ├── Drizzle ORM: parameterised queries (no SQL injection)
    └── No raw string concatenation in queries

Layer 7: Data Storage
    ├── Passwords: bcrypt hash (12 rounds, never plaintext)
    ├── Reset tokens: SHA-256 hash (original never stored)
    └── Photos: R2 object storage with presigned URL access

Layer 8: Audit
    ├── audit_log: immutable action trail
    ├── system_events: system audit log
    └── export_log: data access trail
```

---

## 10. INFRASTRUCTURE ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────────┐
│                    Vercel Platform                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   CDN Edge Network (global PoPs)                         │   │
│  │   • Static assets served from nearest PoP               │   │
│  │   • Edge middleware runs at network edge                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────┐    ┌─────────────────────┐             │
│  │  Next.js Serverless  │    │  Production Domain   │            │
│  │  Functions (Node.js) │    │  racregistryzw.org   │            │
│  │  • API Routes        │    │  (Vercel DNS + TLS)  │            │
│  │  • SSR Pages         │    └─────────────────────┘             │
│  └─────────────────────┘                                         │
└──────────────────────────────────────────────────────────────────┘

┌────────────────────────┐   ┌────────────────────────┐
│   Neon PostgreSQL      │   │   Cloudflare R2         │
│   (Serverless DB)      │   │   (Object Storage)      │
│   • HTTP-based queries │   │   • Profile photos      │
│   • Auto-scale         │   │   • Generated PDFs      │
│   • Daily backups      │   │   • 11-nines durability │
│   • Branch databases   │   │   • Global CDN          │
└────────────────────────┘   └────────────────────────┘

┌────────────────────────┐   ┌────────────────────────┐
│   Resend               │   │   Groq API             │
│   (Transactional Email)│   │   (AI Analysis)        │
│   • 6 email templates  │   │   • Llama 3.3 70B      │
│   • Batch sends        │   │   • Submission review  │
│   • Delivery tracking  │   │   • Report summaries   │
└────────────────────────┘   └────────────────────────┘
```

---

## 11. TECHNOLOGY DECISION RATIONALE

| Technology | Decision | Rationale |
|---|---|---|
| **Next.js** | Chosen | Unified full-stack framework; App Router enables server components for performance; excellent Vercel integration |
| **Neon Serverless** | Chosen | PostgreSQL-compatible; HTTP-based connection works in edge/serverless without connection pooling complexity |
| **Drizzle ORM** | Chosen | Type-safe queries with TypeScript; lightweight; direct SQL generation without abstraction penalties |
| **Cloudflare R2** | Chosen | S3-compatible; egress-free bandwidth; global CDN; lower cost than AWS S3 for media assets |
| **Resend** | Chosen | Modern email API with high deliverability; React email templates; simple developer experience |
| **Groq + Llama 3.3** | Chosen | Fast inference; open-weight model with no data training concerns; structured JSON output mode |
| **Serwist** | Chosen | First-class Next.js PWA support; service worker generation without complex config |
| **JWT + bcrypt** | Chosen | Industry standard for stateless session tokens + password hashing; jose library for edge-compatible JWT |
| **Zod** | Chosen | TypeScript-first schema validation; shared between client and server; excellent error messages |
| **Leaflet** | Chosen | Open-source mapping; OpenStreetMap tiles (no API key cost); heat map and cluster plugins |
| **Tailwind CSS v4** | Chosen | Utility-first CSS; consistent design token system; removes need for separate CSS files |

---

*Document End*
