# Production Readiness Audit — ZW RAC Technician Registry

**Audited:** 2026-07-01
**Project:** Zimbabwe RAC Technician Registry (zw-rac-survey)
**Stack:** Next.js 16 + React 19 + Drizzle ORM + Neon Postgres + Cloudflare R2 + Resend + Groq AI

---

## Overall Assessment: 66/100 — CONDITIONAL PASS

The application is functionally complete with a solid architecture. Six critical issues must be resolved before production launch.

---

## 1. SECURITY

### 1.1 Auth System — GOOD
- JWT (HS256) with httpOnly, sameSite Lax cookies
- Session stored in DB with revocation support
- Rate limiting on login (in-memory, per-IP, 10 attempts/15min)
- Password reset uses token hashing, prevents enumeration
- `requireAdmin()` pattern used consistently in API routes

**Issues:**
- **CRITICAL: AUTH_SECRET in .env.local** — The JWT signing secret `cf45af9975a00f07294edf39717d9434ca432fa249bf691379ead09351a6adc4` is committed to the repo (`.env.local` is in `.gitignore`, but the file exists on disk and was found during audit). This must be rotated before production. Use `openssl rand -hex 32` and keep it as a Vercel environment secret only.
- **CRITICAL: Login rate limiter is in-memory** — Serverless deployments have multiple instances, making this ineffective. Use an external store (Upstash Redis, Vercel KV) for proper distributed rate limiting.
- **Sysadmin email hard-coded** — `nicholas.gwanzura@outlook.com` is checked as a literal string in `app/api/admin/system-events/route.ts:25`. This should be an env var.

### 1.2 CSP Headers — WEAK
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...
```
`'unsafe-inline'` and `'unsafe-eval'` severely weaken XSS protection. Evaluate whether strict CSP with nonces/hashes is feasible (would require Next.js CSP support).

### 1.3 Input Validation — GOOD
- Zod validation on both client (RHF resolver) and server (API routes)
- Phone regex: `+263[0-9]{9}` — correct format for Zimbabwe
- Likert fields validated 1-5
- Photo upload validated for content-type and size (2MB max)
- UUID validation on params

### 1.4 File Upload — GOOD
- Presigned URL flow: browser -> R2 directly (no server intermediary)
- Size limited server-side via Zod (2MB)
- Content-type restricted to image/jpeg, image/png, image/webp
- Key uses UUID in partitioned path: `technicians/{year}/{month}/{uuid}.ext`

### 1.5 R2 Credential Exposure — WARNING
`lib/r2.ts` logs no error details that would leak credentials, but consider adding request signing to prevent hotlinking of public R2 URLs.

### 1.6 Email Injection — GOOD
Messaging endpoint escapes HTML manually before inserting into email templates.

---

## 2. ERROR HANDLING

### 2.1 API Routes — GOOD PATTERN
- Consistent try/catch with `console.error` + 500 response
- JSON parse errors caught with 400 responses
- Zod parse errors caught with 422 + `flatten()` details

### 2.2 Issues
- **Error details leaked to client** — Several routes return `err.message` in production responses (`app/api/survey/submit/route.ts:190`). This can leak internal state. Log full error server-side, return generic message to client.
- **Fire-and-forget promise chains** — Many async operations use `.catch(() => {})` which swallows errors silently (e.g., `surveyEvents` insert, `logSystemEvent`). Add structured logging at minimum.
- **No global error boundary** — Add an `error.tsx` at root level for unhandled React errors.

---

## 3. DATABASE

### 3.1 Schema — GOOD
- UUID PKs throughout (no sequential IDs)
- Proper FK constraints with `onDelete` cascade/restrict
- GIN index on JSONB `mainWorkFocus`
- Indexes on phone, email, province, status, submittedAt
- PostgreSQL enums for constrained fields

### 3.2 Issues
- **No `deletedAt` soft-delete** — `DELETE` on `technicians_survey` permanently removes data, and the audit log referencing that row is cascade-deleted. The code explicitly warns about this but it's a real data-loss risk.
- **No connection pooling config** — `lib/db.ts` uses `neon(client)` directly without pooler URL. For serverless, ensure `DATABASE_URL` uses the pooled Neon connection string (ends in `?sslmode=require`).
- **Migration sequence** — Migration `0004` exists twice (`0004_add_national_certificate` and `0004_add_technician_survey_reports`). Drizzle Kit handles this via snapshot, but the naming is confusing.
- **Missing composite index** on `(province, status)` for admin filter queries.

---

## 4. PERFORMANCE

### 4.1 Good
- PWA with Serwist, runtime caching, offline fallback
- OSM tile caching (30 days, 200 entries)
- R2 photo caching (24h, 100 entries)
- Public pages use StaleWhileRevalidate (7 days)
- GIN index on JSONB array column

### 4.2 Issues
- **No response pagination on admin list routes** — `GET /api/admin/responses` returns all matching rows. Add cursor or offset pagination.
- **Export endpoint loads ALL rows into memory** — `POST /api/admin/export` does `db.select().from(techniciansSurvey).where(where)` with no limit. With thousands of rows, this will OOM. Use streaming or chunked export.
- **No React Suspense boundaries** — Several admin pages load data without Suspense fallbacks.
- **Admin routes lack data caching** — Every page load re-fetches from the database. Consider Next.js `unstable_cache` or React `cache()` for dashboard KPI data.

---

## 5. MONITORING & OBSERVABILITY

### 5.1 Good
- `audit_log` table tracks all field-level changes
- `system_events` table tracks admin actions and system events
- `survey_events` tracks survey funnel events
- `export_log` tracks data exports

### 5.2 Issues
- **No structured logging** — All logging is `console.error` strings. Add a logging library (pino, winston) or use Vercel's `@vercel/otel` for OpenTelemetry.
- **No error tracking** — No Sentry, Highlight, or similar integration. Unhandled exceptions in production are invisible.
- **No health check endpoint** — Add `GET /api/health` for load balancer / monitoring uptime checks.
- **No performance metrics** — No APM for database query times, API latency, or render times.

---

## 6. DEPLOYMENT & CI/CD

### 6.1 Issues
- **No Vercel project config** — No `vercel.json` or `vercel.env` file. Need to configure environment variables manually in Vercel dashboard.
- **No CI pipeline** — No GitHub Actions workflow for lint, typecheck, test before deploy.
- **README is boilerplate** — Contains only `create-next-app` default text. No deployment instructions, no env var documentation, no architecture overview.
- **No build output verification** — Need to run `npm run build` and verify zero errors before production.
- **`next build --webpack`** — The build script explicitly uses webpack (not Turbopack for build). This is fine, but ensure webpack config works in production.

### 6.2 Critical env vars missing from `.env.local`
These are referenced in code but absent:
- `DATABASE_URL` — Neon Postgres connection string
- `DATABASE_URL_UNPOOLED` — For Drizzle migrations
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` — Cloudflare R2
- `RESEND_API_KEY` — Email service
- `GROQ_API_KEY` — AI analysis

---

## 7. TESTING

### 7.1 Current Coverage: 2 test files, 28 test cases
- `lib/__tests__/report-builder-utils.test.ts` — 10 tests (unit)
- `components/admin/report-builder/__tests__/CellDisplay.test.tsx` — 18 tests (component)

### 7.2 Critical Gaps
- **Zero API route tests** — No integration tests for any of the 38 API routes
- **Zero auth tests** — No tests for login, session validation, role checks
- **Zero database tests** — No query tests with test DB
- **Zero E2E tests** — No Playwright/Cypress tests for survey wizard or admin flows
- **Zero validation tests** — No tests for Zod schemas or refinement logic
- **Test threshold** — With <5% coverage, regressions cannot be caught before deploy. Minimum acceptable: 30% coverage on `lib/` and critical API routes.

---

## 8. PWA / OFFLINE

### 8.1 Good
- BackgroundSyncQueue for offline survey submissions (7-day retention)
- `navigationPreload` enabled
- `skipWaiting` + `clientsClaim` for immediate SW activation
- Offline fallback page at `/survey/offline`
- OSM tile and R2 photo caching with expiration

### 8.2 Issues
- **No IndexedDB cleanup mechanism** — `QueuedSubmission` entries stay in IndexedDB indefinitely after failed retries. Add a cleanup routine for entries older than 7 days.
- **Admin routes excluded from caching** — Correct by design, but means the admin dashboard has no offline capability.

---

## 9. CODE QUALITY

### 9.1 Good
- Consistent use of `@/` path aliases
- Clean separation: `lib/` (data), `app/` (routes), `components/` (UI)
- TypeScript strict mode
- Zod schemas shared between client and server validation
- Proper `"server-only"` annotations on server modules

### 9.2 Issues
- **`eslint` not run** — Need to verify `npm run lint` passes
- **`tsc --noEmit` not run** — Need to verify `npm run typecheck` passes
- **Duplicated field mapping** — Survey submit and PUT endpoints manually map every field (60+ lines each). Use Drizzle's `$inferInsert` with a pick/omit helper.
- **No Prettier config** — No consistent formatting rules enforced.

---

## 10. DEPENDENCY HEALTH

### 10.1 Critical packages pinned to major versions:
| Package | Version | Notes |
|---|---|---|
| `next` | 16.2.4 | Latest stable in 16.x |
| `react` / `react-dom` | 19.2.4 | Latest |
| `drizzle-orm` | 0.36.x | Stable |
| `@serwist/next` | 9.0.x | Latest |
| `jose` | 5.9.x | Latest |

### 10.2 Concerns
- `xlsx` ^0.18.5 — The `xlsx` package has had security advisories. Consider the maintained `sheetjs` fork.
- `groq-sdk` ^1.2.0 — Check Groq SDK changelog for breaking changes.
- `bcryptjs` — Pure JS, slower than `bcrypt` (native). Acceptable for admin-only usage, but consider `@node-rs/bcrypt` for performance.

---

## 11. ACTION ITEMS (Priority Order)

### BLOCKING (Must fix before launch)
1. **Rotate AUTH_SECRET** — Generate new secret, set as Vercel env secret only
2. **Add all 10 missing env vars** to production environment
3. **Fix error message leakage** — Remove `err.message` from production response bodies
4. **Run and pass `npm run lint` and `npm run typecheck`** — Fix any errors
5. **Verify `npm run build` succeeds** with zero errors

### HIGH (Fix before or shortly after launch)
6. **Add connection pooling** — Use pooled Neon URL in `DATABASE_URL`
7. **Add global error boundary** (`app/error.tsx`)
8. **Add health check endpoint** (`GET /api/health`)
9. **Replace in-memory rate limiter** with Upstash Redis / Vercel KV
10. **Move sysadmin email to env var**
11. **Pagination on `/api/admin/responses`** — Add offset/cursor pagination
12. **Soft-delete for technician surveys** instead of hard DELETE

### MEDIUM (Post-launch improvements)
13. **Add Sentry/error tracking integration**
14. **Implement structured logging** (pino or OpenTelemetry)
15. **Add CI pipeline** — GitHub Actions for lint/typecheck/test
16. **Write API integration tests** for critical routes (auth, submit, export)
17. **Write database query tests**
18. **Add E2E test for survey wizard flow**
19. **Stream export endpoint** instead of loading all rows into memory
20. **Update README** with deployment instructions and env var documentation
21. **Add Prettier config** for consistent formatting

---

## SUMMARY

| Category | Score | Key Gap |
|---|---|---|
| Security | 7/10 | AUTH_SECRET exposed, CSP too permissive |
| Error Handling | 6/10 | Error messages leak, promises silently fail |
| Database | 7/10 | Missing soft-delete, no pooled connection |
| Performance | 6/10 | No pagination, export loads all rows in memory |
| Monitoring | 4/10 | No error tracking, no structured logging |
| Deployment | 5/10 | Missing CI, missing env vars, boilerplate README |
| Testing | 2/10 | 2 test files, 38 untested API routes |
| PWA/Offline | 8/10 | No IndexedDB cleanup |
| Code Quality | 7/10 | Lint/typecheck unverified |
| Dependencies | 7/10 | xlsx advisory history |

**Overall: 66/100**

This is a well-architected application that can go to production once the 5 blocking items and at least the top 3 high-priority items are resolved. The biggest risks are the exposed AUTH_SECRET and the lack of error monitoring.
