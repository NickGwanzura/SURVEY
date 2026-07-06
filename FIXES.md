# zw-rac-survey — Findings & Recommended Fixes

**Date:** 2026-07-06

This document captures issues found during a targeted code review of the public survey PWA and admin dashboard. Every item below was verified directly against the current code (not copied from `NATIONAL_REGISTRY_AUDIT_REPORT.md` / `PRODUCTION_READINESS_AUDIT.md` — those were used only to check whether previously-flagged issues are already fixed; where they are not, that is noted).

## Summary

| ID | Severity | Area | One-line description |
|----|----------|------|------------------------|
| F1 | Critical | Data integrity | No unique DB constraint on `phone` — the app-level duplicate check is a TOCTOU race, allowing duplicate technician/retailer records |
| F2 | High | Offline sync | Two independent submission queues (IndexedDB + Serwist `BackgroundSyncQueue`) are both populated on the same network failure, risking duplicate submits and permanently-stuck queue entries |
| F3 | High | Security | R2 photo upload presigned URL does not constrain object size — client-declared `byteLength` is never enforced server-side, allowing unbounded uploads to storage |
| F4 | Medium | Security | Login rate limiter is in-memory per-instance; ineffective on serverless/multi-instance deployment (already flagged in `PRODUCTION_READINESS_AUDIT.md`, still unfixed) |
| F5 | Medium | Security | CSP allows `'unsafe-inline'` and `'unsafe-eval'` in `script-src`, materially weakening XSS protection (already flagged, still unfixed) |
| F6 | Medium | Security | No rate limiting on public, unauthenticated APIs: `/api/survey/submit`, `/api/survey/check-phone`, `/api/survey/upload-photo`, `/api/retailer-survey/submit` (already flagged, still unfixed) |
| F7 | Medium | Offline sync | `flushQueuedSubmissions` never removes an entry from the IndexedDB queue on a non-network-error failure (e.g. 409/422), so a duplicate/invalid submission is retried and re-toasts forever |
| F8 | Low | Reliability | `forgot-password` and `admin/setup` endpoints have no rate limiting, unlike login |
| F9 | Low | Code quality | Lint run surfaces 18 real errors (unescaped apostrophes, `prefer-const`, `no-explicit-any`, one React-hooks rule false-positive from a misleadingly-named helper) |

---

## Critical

### F1 — No unique constraint on `phone`; duplicate-check is a TOCTOU race

**Files:**
- `app/api/survey/submit/route.ts:53-68`
- `app/api/retailer-survey/submit/route.ts:53-6x` (same pattern)
- `lib/schema.ts:176,270` (`techniciansSurvey.phone` — `text().notNull()`, only `index("technicians_survey_phone_idx")`, no `.unique()`)
- `lib/schema.ts:299,358` (`retailersSurvey.phone` — same: index only, no unique constraint)

**Problem:** Both submit routes do a `SELECT ... WHERE phone = ?` check, and only `INSERT` if no row is found. This is a classic check-then-act race: if two requests for the same phone number arrive close together (e.g. the offline sync queue and the Serwist background-sync queue both replaying the same failed submission — see F2 — or simply a user double-tapping submit while briefly online), both `SELECT`s can complete before either `INSERT` commits, and both will pass the "not found" check and insert. The database has only a non-unique index on `phone` (`phoneIdx`), not a unique constraint, so nothing at the storage layer prevents this. The 409 "already submitted" response the UI relies on is purely a best-effort courtesy check, not a guarantee — the admin `techniciansSurvey`/`retailersSurvey` tables can and will accumulate duplicate rows under concurrent submission, which corrupts survey statistics and is exactly the scenario this system's `/admin/duplicates` view exists to clean up after the fact.

**Fix:** Add a unique constraint on `phone` (e.g. `unique("technicians_survey_phone_unique").on(table.phone)` in `lib/schema.ts`, generate a migration), and catch the resulting unique-violation error in the submit route to return the existing 409 response instead of a generic 500. This turns the race into a safe, atomic guarantee instead of relying on an app-level read-then-write check.

---

## High

### F2 — Double submission-queue risk between IndexedDB and Serwist BackgroundSyncQueue

**Files:**
- `app/sw.ts:34-65` (Serwist `BackgroundSyncQueue("survey-submit-queue", ...)`, pushed via `fetchDidFail`)
- `lib/offline-sync.ts:49-123` (`queueSubmission` / `flushQueuedSubmissions`, IndexedDB-backed)
- `components/survey/SurveyWizard.tsx:224-279` (the `fetch("/api/survey/submit", ...)` call and its `catch` block)
- `components/survey/SyncWatcher.tsx:11-70`

**Problem:** When the browser is online but the request to `/api/survey/submit` fails at the network layer (flaky connection, DNS blip, etc.), **two independent mechanisms react to the exact same failure**:
1. The service worker's `NetworkOnly` route for `POST /api/survey/submit` has a `fetchDidFail` plugin (`app/sw.ts:58-60`) that pushes the failed request into the Serwist `BackgroundSyncQueue`, which will replay it automatically once connectivity returns (`replayRequests()`), independent of the page being open.
2. `SurveyWizard.submit()`'s `catch` block (`SurveyWizard.tsx:260-263`) calls `queueSubmission(merged)`, writing the *same* survey payload into a second, separate IndexedDB queue that `SyncWatcher` (`SyncWatcher.tsx:18-43`) flushes via `flushQueuedSubmissions()` on `online` events and on mount.

Both queues store the same submission and both are wired to auto-retry to the same endpoint, with no shared identifier or dedup between them (the SW's background-sync queue serializes the raw `Request`, the IndexedDB queue serializes the JSON payload — they can't check each other). Whichever queue flushes first will succeed; the other queue's retry then depends entirely on F1's app-level phone check to avoid actually inserting a second row — so this compounds directly with F1. Even with F1 fixed, the user experience is confusing: on reconnect the user may see two "sync" attempts for one response, one succeeding and one erroring.

**Fix:** Pick one mechanism as the source of truth. Given the codebase already has richer UX around the IndexedDB queue (toasts, listing, manual retry potential), the cleanest fix is to remove the `fetchDidFail` push to `BackgroundSyncQueue` in `app/sw.ts` (or scope the SW's `NetworkOnly` handler for `/api/survey/submit` to not queue at all) and rely solely on the app-level IndexedDB queue + `SyncWatcher`, which already has full visibility into user-facing state. Alternatively, if the SW queue is kept for the case where the page isn't open, generate a client-side idempotency key per submission and send it as a header/body field, then have the server dedupe by that key (in addition to fixing F1).

### F3 — Presigned R2 upload URL does not enforce object size

**Files:**
- `lib/r2.ts:63-95` (`createSignedPhotoUpload`)
- `app/api/survey/upload-photo/route.ts:8-34`
- `lib/validation.ts:502-511` (`photoUploadRequestSchema` — validates `byteLength` client-declared value only)

**Problem:** `/api/survey/upload-photo` is a public, unauthenticated endpoint. It validates the *declared* `byteLength` in the JSON request body against a 2 MB max (`lib/validation.ts:509`), but this number is never actually used when constructing the presigned PUT — `createSignedPhotoUpload` only sets `Bucket`, `Key`, and `ContentType` on the `PutObjectCommand` (`lib/r2.ts:79-83`). Nothing constrains the actual bytes an attacker later PUTs to the returned `uploadUrl`. Anyone can call this endpoint repeatedly, declare `byteLength: 1000`, receive a valid signed URL, and then PUT an arbitrarily large file (limited only by R2/S3 API limits, effectively 5 GB per part) directly to storage, run up storage costs, or use the bucket as free anonymous file hosting.

**Fix:** Pass a `Content-Length` condition into the presigned URL (S3 presigned POST supports content-length-range conditions; presigned PUT can restrict via a policy on bucket, or switch to a presigned POST with `createPresignedPost` and a `content-length-range` condition matching the validated `byteLength`). At minimum, set an object lifecycle rule / bucket-level max size and monitor for abuse, but enforcing size in the presigned request itself is the correct fix.

---

## Medium

### F4 — Login rate limiter is in-memory and per-instance (still unfixed)

**File:** `app/api/admin/auth/login/route.ts:22-49`

**Problem:** `attemptStore` is a plain in-process `Map`. The code's own comment (lines 22-25) acknowledges this is "defense-in-depth rather than a hard guarantee" because serverless/multi-instance deployments each get their own map, and a restart clears it entirely. `PRODUCTION_READINESS_AUDIT.md` (line 26) already flagged this as Critical and it remains unfixed in the current code. Under horizontal scaling or frequent redeploys, brute-force login attempts are effectively unthrottled.

**Fix:** Move to a shared store (Upstash Redis, Vercel KV, or a Postgres-backed counter table) so the limit is enforced across all instances.

### F5 — CSP permits `unsafe-inline` and `unsafe-eval` (still unfixed)

**File:** `middleware.ts:32-34`

**Problem:** `script-src 'self' 'unsafe-inline' 'unsafe-eval'` allows inline `<script>` execution and `eval`-family calls, which defeats the primary purpose of CSP as an XSS mitigation — any successful HTML-injection bug elsewhere in the app (e.g. an unescaped field rendered in an admin view) would not be blocked by this policy. `PRODUCTION_READINESS_AUDIT.md:29-33` already flagged this; it is unchanged in the current `middleware.ts`.

**Fix:** Move to nonce- or hash-based CSP (Next.js supports per-request nonces via middleware) and drop `unsafe-eval` unless a specific dependency requires it (verify whether any current library needs `eval`, e.g. a chart or PDF library, before removing).

### F6 — No rate limiting on public survey APIs (still unfixed)

**Files:** `app/api/survey/submit/route.ts`, `app/api/survey/check-phone/route.ts`, `app/api/survey/upload-photo/route.ts`, `app/api/retailer-survey/submit/route.ts`

**Problem:** None of these public, unauthenticated endpoints apply any rate limiting (the pattern used in `app/api/admin/auth/login/route.ts:22-49` is not reused here). `check-phone` and `submit` both run a DB query per request with no throttling, and combined with F1 (no unique constraint), a scripted flood of submissions could both degrade the database and seed large numbers of duplicate/garbage rows. This matches `NATIONAL_REGISTRY_AUDIT_REPORT.md:1811-1812`'s recommendation, which has not been implemented.

**Fix:** Apply the same per-IP rate limiting used for login to these routes (ideally backed by a shared store per F4).

### F7 — Failed (non-network) IndexedDB submissions are queued forever with no eviction

**File:** `lib/offline-sync.ts:89-123` (`flushQueuedSubmissions`)

**Problem:** When a queued submission is retried and the server responds with a non-2xx status (e.g. `409` duplicate-phone, or `422` validation failure caused by stale data), the code only calls `markSubmissionAttempt(entry.id, text)` and continues — it never calls `removeQueuedSubmission`. Because `409`/`422` are permanent, not transient, failures (retrying the same payload will never succeed), that entry stays in IndexedDB indefinitely, and `SyncWatcher` (`SyncWatcher.tsx:33-39`) will keep showing "Will retry later" toasts every time the device comes online, without ever resolving. There is no UI in the provided components to inspect or manually clear this queue.

**Fix:** Distinguish permanent failures (4xx, e.g. `409`/`422`) from transient ones (network errors, 5xx) in `flushQueuedSubmissions`; remove the entry (or move it to a separate "needs attention" store the user can review) on permanent failure instead of leaving it to retry forever.

---

## Low

### F8 — No rate limiting on `forgot-password` / `admin/setup`

**Files:** `app/api/admin/auth/forgot-password/route.ts`, `app/api/admin/auth/setup/route.ts`

**Problem:** `login` has a rate limiter; `forgot-password` (which triggers an email send via `sendPasswordResetEmail`) and `setup` (invite-token redemption) do not. `forgot-password` in particular could be used to spam an admin's inbox with reset emails, or to burn email-sending quota, since it accepts arbitrary POSTs with only Zod validation on shape.

**Fix:** Apply the same lightweight per-IP limiter used in `login/route.ts` to these two routes.

### F9 — Lint errors present in current code

**Command run:** `npm run lint` → **18 errors, 130 warnings** (most warnings are in the generated `public/sw.js`, which can be ignored/excluded from lint). Real, actionable errors include:

- `app/admin/forgot-password/page.tsx:68,101` — unescaped `'` (`react/no-unescaped-entities`).
- `app/api/admin/messaging/route.ts:64` — `recipients` declared with `let` but never reassigned (`prefer-const`).
- `app/api/admin/reports/export/route.ts:14`, `lib/admin/report-pdf.ts:91,389`, `lib/admin/reports-data.ts:62`, `components/admin/reports/ReportTable.tsx:5` — `any` types (`@typescript-eslint/no-explicit-any`).
- Several components (`app/admin/reports/technician-survey/page.tsx:76`, `components/admin/AiInsightPanel.tsx:60`, `components/admin/sysadmin/AuditLogTable.tsx:100`, `components/admin/sysadmin/SysadminOverviewPanel.tsx:61`, `components/survey/OfflineBanner.tsx:9`, `components/survey/RetailerSurveyWizard.tsx:111`, `components/survey/SurveyWizard.tsx:113`) — "Calling setState synchronously within an effect can trigger cascading renders". This is a real lint rule failure but a benign, common React pattern (setting initial client-only state, e.g. `navigator.onLine`, inside a `useEffect`); it causes an extra render on mount, not a functional bug. Worth a follow-up cleanup pass but not urgent.
- `lib/admin/survey-report-pdf.ts:171` — `react-hooks/rules-of-hooks` false positive: a plain helper function is named `usePie` (`lib/admin/survey-report-pdf.ts:145`), which is not a React hook but is named like one, tripping the lint rule inside `rtc()` (line 163). Rename `usePie` to something like `shouldUsePie` to silence the false positive and avoid confusing future readers into thinking it's a real hook.

`npm run typecheck` passes clean (no errors). `npm run test` passes (26/26 tests, 2 files) — the test suite is small and does not currently cover `lib/offline-sync.ts`, `app/sw.ts`, or the submit routes' duplicate-check logic, which is exactly where F1/F2/F7 live.

---

## Verified working / not issues

- **Admin API auth coverage:** every route under `app/api/admin/*` was checked; all routes other than the intentionally-public `auth/login`, `auth/logout`, `auth/setup`, `auth/forgot-password`, `auth/reset-password` call `getCurrentAdmin()` and return `401` if there's no session. `middleware.ts`'s admin-auth branch only guards `/admin/*` page routes (not `/api/admin/*`, since those paths don't start with `/admin`), but this is not a gap in practice because each API route enforces its own session check inline.
- **Password reset flow:** `forgot-password` returns an identical 200 response regardless of whether the email exists, correctly avoiding user enumeration (`app/api/admin/auth/forgot-password/route.ts:19-46`). `reset-password` validates the token, revokes all existing sessions for the user on password change, and logs a system event — solid design.
- **`admin/setup`:** correctly requires a valid, unexpired invite token (`verifyInviteToken`) before creating an account; not open to arbitrary self-registration.
- **Maintenance mode / www-redirect / security headers in `middleware.ts`:** logic is straightforward and correctly ordered (www redirect → maintenance check → security headers applied to every branch including redirects).
- **Survey validation (`lib/validation.ts`, `lib/retailer-validation.ts`):** thorough use of Zod `superRefine` for conditional-required fields (e.g. "other" free-text fields, certification sub-fields); phone/name regexes are consistent between client-side step schemas and the server-side combined schema, so there's no client/server validation mismatch.
- **`npm run typecheck`:** clean, no errors.
- **`npm run test`:** all 26 existing tests pass.
- **Consent handling:** both submit routes explicitly re-check `dataConsentAccepted` server-side (`app/api/survey/submit/route.ts:42-51`) rather than trusting the client, even though the Zod schema also enforces it — good defense in depth.
