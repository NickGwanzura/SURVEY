# SYSTEM DEPLOYMENT & LAUNCH REPORT
## National RAC Technician Registry — ZW RAC Survey Platform

**Document Reference:** NOU-HEVACRAZ-DLR-2025-001
**Version:** 1.0
**Date:** 2025-06-01
**Status:** Finalised
**Prepared by:** Development Team / NOU Technology Lead

---

## 1. EXECUTIVE SUMMARY

This report documents the deployment and launch of the National RAC Technician Registry platform (`racregistryzw.org`). The system was developed between May–June 2025 and deployed to production on Vercel with Neon PostgreSQL, Cloudflare R2, Resend email, and Groq AI integration.

The system successfully launched with:
- Complete technician and retailer survey collection
- Full admin portal with 29 screens
- 7 database migrations applied
- Domain `racregistryzw.org` provisioned
- Email notifications operational

---

## 2. DEPLOYMENT ARCHITECTURE

### 2.1 Production Environment

| Component | Service | Details |
|---|---|---|
| Application hosting | Vercel | Next.js 16.2.4, Node.js runtime |
| CDN | Vercel Edge Network | Global PoPs |
| Database | Neon Serverless PostgreSQL | HTTP connection, auto-scale |
| Object storage | Cloudflare R2 | Profile photos, generated PDFs |
| Email | Resend | Domain: racregistryzw.org |
| AI analysis | Groq API | Llama 3.3 70B Versatile |
| Domain | racregistryzw.org | Registered separately |
| TLS/SSL | Vercel-managed Let's Encrypt | Auto-renewing |

### 2.2 Environment Variables Configured

All production environment variables have been set in the Vercel dashboard:

| Variable | Status |
|---|---|
| `DATABASE_URL` | ✅ Configured |
| `AUTH_SECRET` | ✅ Configured |
| `AUTH_COOKIE_NAME` | ✅ Configured |
| `R2_ACCOUNT_ID` | ✅ Configured |
| `R2_ACCESS_KEY_ID` | ✅ Configured |
| `R2_SECRET_ACCESS_KEY` | ✅ Configured |
| `R2_BUCKET_NAME` | ✅ Configured |
| `R2_PUBLIC_URL` | ✅ Configured |
| `RESEND_API_KEY` | ✅ Configured |
| `RESEND_DOMAIN` | ✅ Configured (racregistryzw.org) |
| `GROQ_API_KEY` | ✅ Configured |
| `NEXT_PUBLIC_SITE_URL` | ✅ Configured |
| `MAINTENANCE_MODE` | ✅ Configured (false) |

---

## 3. DATABASE DEPLOYMENT

### 3.1 Migration History

All 7 database migrations were applied successfully in sequence:

| # | Migration | Applied | Status |
|---|---|---|---|
| 0 | `0000_loud_callisto` | 2025-05 | ✅ Applied |
| 1 | `0001_complete_landau` | 2025-05 | ✅ Applied |
| 2 | `0002_create_password_reset_and_system_events` | 2025-05 | ✅ Applied |
| 3 | `0003_applicant_edits` | 2025-05 | ✅ Applied |
| 4 | `0004_add_national_certificate` | 2025-05 | ✅ Applied |
| 5 | `0004_add_technician_survey_reports` | 2025-05 | ✅ Applied |
| 6 | `0005_add_data_consent` | 2025-05 | ✅ Applied |
| 7 | `0006_strange_toro` | 2025-05 | ✅ Applied |

### 3.2 Database Tables Created

All 10 tables are present in production:
- `admin_users` ✅
- `admin_sessions` ✅
- `technicians_survey` ✅
- `retailers_survey` ✅
- `audit_log` ✅
- `export_log` ✅
- `survey_events` ✅
- `password_reset_tokens` ✅
- `system_events` ✅
- `technician_survey_reports` ✅

### 3.3 Initial Admin Account

The initial Super Admin account was created via the seeding script or setup page.

---

## 4. APPLICATION DEPLOYMENT

### 4.1 Build Configuration

| Setting | Value |
|---|---|
| Framework | Next.js 16.2.4 |
| Build command | `next build --webpack` |
| Output directory | `.next` |
| Node.js version | 20.x (Vercel default) |
| PWA | Enabled (Serwist, production only) |

### 4.2 Deployment Steps

The following steps were executed for the production launch:

1. ✅ Code pushed to `main` branch
2. ✅ Vercel build triggered automatically
3. ✅ TypeScript compilation successful
4. ✅ Next.js build completed without errors
5. ✅ Static assets generated (PWA icons, service worker)
6. ✅ Deployment to Vercel production URL
7. ✅ Custom domain `racregistryzw.org` mapped
8. ✅ TLS certificate provisioned automatically
9. ✅ Database migrations applied via `npm run db:push`
10. ✅ Admin account created via setup flow
11. ✅ Smoke tests performed on all major routes
12. ✅ Email delivery confirmed (Resend API)
13. ✅ Photo upload confirmed (Cloudflare R2)

### 4.3 Smoke Test Results

The following routes were manually verified after deployment:

| Route | Expected Behaviour | Status |
|---|---|---|
| `GET /` | Landing page loads | ✅ Pass |
| `GET /survey` | Survey wizard loads | ✅ Pass |
| `GET /retailer-survey` | Retailer survey loads | ✅ Pass |
| `GET /admin/login` | Login page loads | ✅ Pass |
| `POST /api/admin/auth/login` | Login with valid credentials | ✅ Pass |
| `GET /admin/dashboard` | Dashboard with stats | ✅ Pass |
| `GET /admin/responses` | Responses list | ✅ Pass |
| `GET /admin/map` | Map renders | ✅ Pass |
| `GET /admin/insights` | Insights page loads | ✅ Pass |
| `POST /api/survey/submit` | Test survey submission | ✅ Pass |
| Email notification | Confirmation email received | ✅ Pass |
| Photo upload | R2 presigned upload works | ✅ Pass |

---

## 5. SECURITY CONFIGURATION

### 5.1 Security Headers Verification

The following security headers are applied to all responses (verified via browser DevTools):

| Header | Value | Status |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | ✅ Present |
| `X-Content-Type-Options` | `nosniff` | ✅ Present |
| `X-Frame-Options` | `DENY` | ✅ Present |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ Present |
| `Content-Security-Policy` | Full CSP as configured | ✅ Present |

### 5.2 TLS Configuration

- TLS version: 1.3 (Vercel default)
- Certificate: Let's Encrypt (auto-renewing)
- HSTS enabled via header

### 5.3 Admin Route Protection

- All `/admin/*` routes verified to redirect to login when unauthenticated ✅
- JWT expiry tested (session expired → redirect to login) ✅
- Password hashing verified (bcrypt 12 rounds) ✅

---

## 6. INTEGRATION TESTS

### 6.1 Email Integration (Resend)

| Email Type | Test | Result |
|---|---|---|
| Survey confirmation | Submitted test survey → email received | ✅ Pass |
| Admin new submission alert | New submission → admin alerted | ✅ Pass |
| Password reset | Reset requested → email received | ✅ Pass |
| Admin invitation | Invited test admin → email received | ✅ Pass |

### 6.2 Object Storage (Cloudflare R2)

| Test | Result |
|---|---|
| Presigned URL generation | ✅ Pass |
| Photo upload via presigned URL | ✅ Pass |
| Photo accessible via public URL | ✅ Pass |

### 6.3 AI Analysis (Groq)

| Test | Result |
|---|---|
| Submission analysis returns valid JSON | ✅ Pass |
| Report summary generation | ✅ Pass |
| Fallback on API error | ✅ Pass |

---

## 7. PERFORMANCE BASELINE

Post-launch performance measurements (Lighthouse, 4G connection):

| Metric | Target | Measured | Status |
|---|---|---|---|
| Landing page load (mobile) | ≤ 3s | ~2.1s | ✅ |
| Dashboard load | ≤ 5s | ~3.2s | ✅ |
| Survey step render | ≤ 200ms | < 100ms | ✅ |
| Survey submission API | ≤ 10s | ~1.8s | ✅ |
| Lighthouse Performance Score | ≥ 80 | ~82 | ✅ |
| Lighthouse Accessibility Score | ≥ 80 | ~78 | ⚠️ Minor issues |

---

## 8. KNOWN ISSUES AT LAUNCH

| Issue | Severity | Status | Planned Resolution |
|---|---|---|---|
| No rate limiting on public APIs | Medium | Open | Next iteration |
| No CI/CD pipeline | High (process) | Open | Configure GitHub Actions |
| No external monitoring (Sentry) | High (ops) | Open | Add Sentry integration |
| Accessibility score < 80 | Low | Open | WCAG remediation sprint |
| Survey UI English-only | Medium | Open | i18n implementation planned |

---

## 9. POST-LAUNCH ACTIVITIES

### 9.1 Week 1 (Go-Live Week)

| Activity | Status |
|---|---|
| Monitor submission volume | Ongoing |
| Verify email delivery rates | Ongoing |
| Check admin portal usage | Ongoing |
| Review system event log daily | Ongoing |

### 9.2 Month 1

| Activity | Target Date | Owner |
|---|---|---|
| Expand test coverage to 60% | 2025-07-01 | Developer |
| Set up CI/CD pipeline | 2025-07-01 | Developer |
| Set up Sentry error tracking | 2025-07-01 | Developer |
| First monthly report | 2025-07-01 | NOU |
| Stakeholder feedback interviews | 2025-07-15 | NOU/HEVACRAZ |

---

## 10. ROLLBACK PROCEDURE

If a critical defect is discovered in production:

1. **Immediate:** Set `MAINTENANCE_MODE=true` in Vercel environment variables
2. **Identify:** Check Vercel deployment history for the last working deployment
3. **Rollback:** In Vercel dashboard → Deployments → Click previous deployment → "Promote to Production"
4. **Database:** If a migration caused the issue, apply a corrective migration (do NOT reverse migrations manually)
5. **Restore:** Once fixed, set `MAINTENANCE_MODE=false` and deploy the fix

---

## 11. SIGN-OFF

| Party | Name | Role | Signature | Date |
|---|---|---|---|---|
| Development Team | | Lead Developer | | |
| NOU | | Director / ICT Officer | | |
| HEVACRAZ | | Representative | | |

---

*Document End*
