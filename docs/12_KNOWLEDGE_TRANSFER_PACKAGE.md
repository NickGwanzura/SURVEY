# KNOWLEDGE TRANSFER PACKAGE
## National RAC Technician Registry — Developer & Operations Handover

**Document Reference:** NOU-HEVACRAZ-KTP-2025-001
**Version:** 1.0
**Date:** 2025-06-01
**Audience:** Incoming developers, system administrators, NOU/HEVACRAZ ICT staff

---

## INTRODUCTION

This Knowledge Transfer Package provides everything needed to understand, maintain, extend, and operate the National RAC Technician Registry platform. It is the primary technical handover document from the development team to the operating organisation.

---

## CHAPTER 1 — SYSTEM OVERVIEW

### 1.1 What the System Is

A cloud-hosted, full-stack web application that:
- Collects technician and retailer registrations via a multi-step survey
- Manages submissions in an admin portal
- Generates analytics, reports, and data exports
- Notifies stakeholders by email
- Works offline via PWA

### 1.2 Who Built It

> [Insert contractor/developer name and contact details here]

### 1.3 Key Contacts

| Role | Name | Contact |
|---|---|---|
| NOU Project Lead | | |
| HEVACRAZ Coordinator | | |
| Primary Developer | | |
| Database Administrator | | |
| Hosting Account Owner | | |

---

## CHAPTER 2 — REPOSITORY AND CODE

### 2.1 Repository Location

> [Insert Git repository URL — GitHub/GitLab/Bitbucket]

### 2.2 Branch Structure

| Branch | Purpose |
|---|---|
| `main` | Production — deploys to racregistryzw.org |
| `develop` | Development — deploys to preview URL |
| `feature/*` | Feature branches — do not deploy |

### 2.3 Repository Structure Summary

```
zw-rac-survey/
├── app/                    # Next.js pages and API routes
│   ├── (public)/           # Survey pages (no auth)
│   ├── admin/              # Admin portal pages
│   └── api/                # REST API routes
├── components/             # React UI components
│   ├── admin/              # Admin-specific components
│   ├── survey/             # Survey wizard components
│   └── ui/                 # Design system primitives
├── lib/                    # Business logic and utilities
│   ├── admin/              # Admin data access layer
│   ├── constants/          # Enumerated values
│   └── schema.ts           # Database schema (single source of truth)
├── drizzle/                # SQL migrations
├── docs/                   # Project documentation (this package)
├── public/                 # Static assets (icons, favicon)
└── scripts/                # Operational scripts
```

### 2.4 Getting the Code

```bash
git clone [repository-url] zw-rac-survey
cd zw-rac-survey
npm install
```

---

## CHAPTER 3 — LOCAL DEVELOPMENT SETUP

### 3.1 Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20.x LTS | https://nodejs.org |
| npm | 10.x | Comes with Node.js |
| Git | Any recent | https://git-scm.com |

### 3.2 Environment Variables

Create a file `.env.local` in the project root with the following variables:

```env
# ─── Database ────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"

# ─── Authentication ───────────────────────────────────────────────────────────
AUTH_SECRET="[generate with: openssl rand -hex 32]"
AUTH_COOKIE_NAME="zw_rac_admin"
AUTH_SESSION_TTL_HOURS="4"

# ─── Cloudflare R2 (Photo Storage) ───────────────────────────────────────────
R2_ACCOUNT_ID="[Cloudflare account ID]"
R2_ACCESS_KEY_ID="[R2 access key]"
R2_SECRET_ACCESS_KEY="[R2 secret key]"
R2_BUCKET_NAME="[bucket name]"
R2_PUBLIC_URL="https://[your-r2-public-domain]"

# ─── Email (Resend) ───────────────────────────────────────────────────────────
RESEND_API_KEY="re_[your-resend-api-key]"
RESEND_DOMAIN="racregistryzw.org"

# ─── AI (Groq) ────────────────────────────────────────────────────────────────
GROQ_API_KEY="gsk_[your-groq-api-key]"

# ─── Application ─────────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
MAINTENANCE_MODE="false"
```

**Where to get each value:**
- `DATABASE_URL` — Neon dashboard → Connection string
- `AUTH_SECRET` — Generate with `openssl rand -hex 32`
- `R2_*` — Cloudflare dashboard → R2 → Bucket settings
- `RESEND_API_KEY` — Resend dashboard → API Keys
- `GROQ_API_KEY` — Groq console at console.groq.com

### 3.3 Running the Development Server

```bash
npm run dev
```

Open `http://localhost:3000`

### 3.4 Running Tests

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode
```

### 3.5 Type Checking

```bash
npm run typecheck
```

### 3.6 Linting

```bash
npm run lint
```

---

## CHAPTER 4 — DATABASE MANAGEMENT

### 4.1 Database Provider

**Neon Serverless PostgreSQL**
- Dashboard: https://console.neon.tech
- Connection: HTTP-based (`@neondatabase/serverless`)
- Automatic daily backups included

### 4.2 Applying Database Migrations

To apply all pending migrations to the database:

```bash
npm run db:push
```

To generate a new migration after schema changes:

```bash
npm run db:generate
```

To open the Drizzle Studio (visual database browser):

```bash
npm run db:studio
```

### 4.3 Creating the First Admin Account

After the database is set up, create the initial Super Admin:

```bash
npm run seed:admin
```

You will be prompted for name, email, and password.

Alternatively, visit `https://racregistryzw.org/admin/setup` on first deployment to set up via the web interface.

### 4.4 Verifying Schema

To verify the production database matches the current schema:

```bash
npm run verify:schema
```

### 4.5 Database Backup

Neon provides automatic daily backups accessible via the Neon dashboard. For manual export:

```bash
# Using psql (replace with actual connection string)
pg_dump "[DATABASE_URL]" > backup_$(date +%Y%m%d).sql
```

---

## CHAPTER 5 — DEPLOYMENT

### 5.1 Hosting Platform

**Vercel** — `https://vercel.com`

The application deploys automatically on push to `main`.

### 5.2 Deployment Process

1. Commit code to the `main` branch
2. Vercel detects the push and starts a build
3. Build command: `next build --webpack`
4. If build passes, it is deployed to production

**To deploy manually:**
```bash
npm run build          # Test the build locally
# Push to main branch to trigger Vercel deployment
```

### 5.3 Environment Variables on Vercel

All environment variables must be set in the Vercel dashboard:
1. Go to https://vercel.com → Your project → Settings → Environment Variables
2. Add each variable from the `.env.local` reference above
3. Set scope to **Production** and **Preview** as needed

### 5.4 Custom Domain Setup

1. In Vercel dashboard → Domains → Add domain: `racregistryzw.org`
2. Update DNS records at your domain registrar:
   - `A` record pointing to Vercel's IP, OR
   - `CNAME` record: `www` → `cname.vercel-dns.com`
3. Vercel automatically provisions TLS certificate

### 5.5 Production Checklist

Before each production deployment:

- [ ] All tests pass: `npm test`
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] No lint errors: `npm run lint`
- [ ] Database migrations applied: `npm run db:push`
- [ ] Environment variables verified in Vercel dashboard
- [ ] Test on staging/preview deployment first

---

## CHAPTER 6 — MAINTENANCE PROCEDURES

### 6.1 Enabling Maintenance Mode

To put the site into maintenance mode (redirects all public traffic to `/maintenance`):

1. In Vercel dashboard → Environment Variables
2. Set `MAINTENANCE_MODE` = `true`
3. Redeploy or trigger a new build

To restore normal operation:
1. Set `MAINTENANCE_MODE` = `false`
2. Redeploy

**Note:** Admin routes remain accessible during maintenance mode.

### 6.2 Resetting an Admin Password

If an admin is locked out:

1. Log into Neon dashboard or use `psql`
2. Generate a new bcrypt hash for the new password using Node.js:
   ```javascript
   const bcrypt = require('bcryptjs');
   bcrypt.hash('new-password', 12).then(console.log);
   ```
3. Update the record:
   ```sql
   UPDATE admin_users 
   SET password_hash = '[new-hash]'
   WHERE email = 'admin@example.com';
   ```

### 6.3 Adding a New Admin Without Email

If you need to create an admin without going through the email invite flow:

```bash
npm run seed:admin
```

### 6.4 Updating Dependencies

```bash
npm outdated           # Check for outdated packages
npm update             # Update within semver ranges
npm audit              # Check for security vulnerabilities
npm audit fix          # Fix vulnerabilities automatically
```

**Important:** Test all functionality after major dependency updates. Pay particular attention to:
- `next` — Breaking changes between versions are common
- `drizzle-orm` — Schema changes may be required
- `@serwist/next` — Service worker behaviour may change

### 6.5 Rotating Secrets

**AUTH_SECRET rotation:**
1. Generate new secret: `openssl rand -hex 32`
2. Update in Vercel environment variables
3. Redeploy
4. All existing sessions will be invalidated (users will need to log in again)

**Resend API key rotation:**
1. Create new key in Resend dashboard
2. Update `RESEND_API_KEY` in Vercel
3. Redeploy
4. Revoke old key in Resend dashboard

---

## CHAPTER 7 — OPERATIONAL PROCEDURES

### 7.1 Monitoring System Health

**In-application:**
- Admin Dashboard: Check submission counts and status distribution
- Sysadmin Dashboard (`/admin/sysadmin`): Review system event log

**External (recommended setup):**
- Uptime monitoring: UptimeRobot (free tier available) monitoring `https://racregistryzw.org`
- Error tracking: Sentry.io (`npm install @sentry/nextjs`)

### 7.2 Reviewing Pending Submissions

1. Log into admin portal
2. Check Dashboard for Pending count
3. Go to Responses → Filter by Status: Pending
4. Review and action each submission

**Recommended SLA:** Review pending submissions within 5 business days.

### 7.3 Running Periodic Reports

**Monthly:**
1. Go to Reports → Technician Survey Report
2. Set reporting period to previous month
3. Generate report and download PDF
4. Share with NOU/HEVACRAZ management

**Quarterly:**
1. Run Skills Gap, Barrier Analysis, and Geo Mapping reports
2. Export data in CSV format for deeper analysis
3. Compare period-over-period using the Period Comparison page

### 7.4 Data Export for UNEP Reporting

For Montreal Protocol compliance reports:

1. Go to Export page
2. Select all sections
3. Enable **Anonymise** (required for UNEP submissions)
4. Choose **SPSS** or **Excel** format
5. Download and include in UNEP reporting package

---

## CHAPTER 8 — COMMON OPERATIONAL SCRIPTS

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server (local)
npm start

# Run all tests
npm test

# Typecheck
npm run typecheck

# Apply database migrations
npm run db:push

# Generate new migration
npm run db:generate

# Open Drizzle Studio (database browser)
npm run db:studio

# Seed first admin account
npm run seed:admin

# Verify database schema
npm run verify:schema

# Check admin email in DB
npm run check-admin
```

---

## CHAPTER 9 — THIRD-PARTY SERVICE ACCOUNTS

| Service | Purpose | Dashboard URL | Account Owner |
|---|---|---|---|
| Vercel | Application hosting | https://vercel.com | |
| Neon | PostgreSQL database | https://console.neon.tech | |
| Cloudflare R2 | Photo storage | https://dash.cloudflare.com | |
| Resend | Email delivery | https://resend.com | |
| Groq | AI analysis | https://console.groq.com | |

**Important:** Transfer account ownership or share access to NOU/HEVACRAZ technical staff before project handover.

---

## CHAPTER 10 — KEY TECHNICAL CONCEPTS FOR MAINTAINERS

### 10.1 How the Schema Works

All database tables are defined in `lib/schema.ts` using Drizzle ORM. This file is the **single source of truth** — it defines the table structure, column types, constraints, and indexes.

To make a database change:
1. Edit `lib/schema.ts`
2. Run `npm run db:generate` to create a new migration SQL file
3. Run `npm run db:push` to apply the migration to the database

**Never modify migration files after they have been applied to production.**

### 10.2 How Authentication Works

Admin authentication uses JWT tokens stored in HTTP-only cookies:
- `lib/auth.ts` — Creates and verifies JWT tokens; manages DB sessions
- `lib/auth-edge.ts` — Edge-compatible JWT verification (no DB calls)
- `middleware.ts` — Applies auth verification at the network edge
- `lib/auth-server.ts` — `getCurrentAdmin()` helper for server components

Sessions are stored in the `admin_sessions` table. A session is invalid if: `revoked_at IS NOT NULL` OR `expires_at < NOW()` OR `admin_user.is_active = false`.

### 10.3 How Validation Works

Input validation uses Zod schemas defined in `lib/validation.ts`:
- Client-side validation runs inside React Hook Form for UX
- Server-side validation runs in every API route handler
- **Both must pass** — client validation alone is never sufficient for security

### 10.4 How the PWA Works

The PWA offline functionality uses Serwist (a Workbox wrapper):
- `next.config.ts` — Enables Serwist, generates `public/sw.js`
- `app/sw.ts` — Service worker source (handles caching strategy)
- `lib/offline-sync.ts` — IndexedDB queue for offline submissions
- `components/survey/SyncWatcher.tsx` — Triggers sync on reconnect

The service worker is **disabled in development** (`NODE_ENV !== 'production'`).

### 10.5 How AI Analysis Works

AI analysis uses the Groq API with the Llama 3.3 70B Versatile model:
- `lib/admin/ai-analysis.ts` — All Groq API calls
- Model is prompted for JSON output (structured responses)
- All AI calls are non-blocking — failures return graceful fallbacks

If the Groq API is unavailable, AI features return "No analysis available" rather than failing the page load.

---

## CHAPTER 11 — TROUBLESHOOTING

| Problem | Likely Cause | Solution |
|---|---|---|
| Build fails | TypeScript error or missing env var | Check `npm run typecheck`; verify `.env.local` |
| Database connection fails | Wrong `DATABASE_URL` or network | Check Neon dashboard; verify connection string |
| Sessions expire immediately | Wrong `AUTH_SECRET` | Regenerate and redeploy |
| Photos not uploading | R2 credentials wrong | Check R2 env vars in Cloudflare dashboard |
| Emails not sending | Wrong `RESEND_API_KEY` | Check Resend dashboard; verify domain is verified |
| AI analysis fails | Wrong `GROQ_API_KEY` | Verify key in Groq console |
| Map not showing | OpenStreetMap tiles unavailable | Check CSP header; tiles load from openstreetmap.org |
| PWA not installing | HTTP (not HTTPS) | PWA only works on HTTPS — ensure production deployment |
| Admin can't log in | Account deactivated | Check `is_active` field in admin_users table |

---

*Document End*
