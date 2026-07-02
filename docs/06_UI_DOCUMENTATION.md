# UI DOCUMENTATION (SCREEN INVENTORY & MOCKUPS)
## National RAC Technician Registry — ZW RAC Survey Platform

**Document Reference:** NOU-HEVACRAZ-UI-2025-001
**Version:** 1.0
**Date:** 2025-06-01
**Status:** Finalised — Screen descriptions derived from production source code

---

## 1. DESIGN SYSTEM

### 1.1 Brand Identity

| Element | Value |
|---|---|
| Application Name | Zimbabwe RAC Technician Registry |
| Organisation | National Ozone Unit (NOU) · HEVACRAZ |
| Tagline | "NOU · HEVACRAZ · RAC Registry" |

### 1.2 Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `brand-600` | `#0d4f3c` | Primary brand (buttons, headers, sidebar active) |
| `brand-700` | `#064e3b` | Dark brand (email headers) |
| `brand-500` | `#10b981` | Brand accent (icons, checkmarks, highlights) |
| `brand-200` | Lighter teal | Borders, backgrounds |
| `brand-100` | `#d1fae5` | Light brand backgrounds |
| `brand-50` | `#ecfdf5` | Very light brand background |
| `slate-900` | `#0f172a` | Primary text |
| `slate-600` | `#475569` | Secondary text |
| `slate-200` | Light grey | Borders |
| `white` | `#ffffff` | Card backgrounds |
| `sidebar-bg` | Dark green (CSS var) | Admin sidebar background |

### 1.3 Typography

- **Font:** Geist (Next.js default, Vercel-hosted)
- **Headings:** `font-semibold`, `text-2xl` to `text-4xl`
- **Labels:** `text-xs font-semibold uppercase tracking-widest` for section labels
- **Body:** `text-sm text-slate-600`

### 1.4 Layout Patterns

- **Public pages:** Centered, max-width container, mobile-first single column
- **Admin pages:** 64px sidebar (hidden on mobile) + main content area
- **Cards:** `rounded-2xl border border-slate-200 bg-white shadow-sm`
- **Section headings:** `text-xs font-semibold uppercase tracking-widest text-brand-600`
- **Skeleton loading:** All data-fetching pages show skeleton placeholders during load

---

## 2. PUBLIC FACING SCREENS

---

### Screen P-01: Landing Page

**Route:** `/`
**Role:** Public (unauthenticated)
**Purpose:** Entry point. Explains the registry, who should register, and directs users to the survey.

**Layout:**
```
┌──────────────────────────────────────────┐
│ [Brand Header — Dark green]               │
│  NOU · HEVACRAZ                          │
│  Zimbabwe RAC Technician                 │
│  Self-Registration                        │
│                                          │
│  [⏱ 10-15 min] [📶 Works offline]        │
│  [💾 Save and continue]                  │
│                                          │
│  [Start the survey →]  [Edit application]│
├────────────────────┬─────────────────────┤
│  What you'll need  │  Privacy & data use  │
│  • Full name       │  • Staff only view  │
│  • +263 phone      │  • Public listing   │
│  • Training info   │    with consent     │
│  • Optional photo  │  • Deletion rights  │
├────────────────────┴─────────────────────┤
│  [Footer: Montreal Protocol context]     │
└──────────────────────────────────────────┘
```

**Components:** Hero section (brand-600 background), two feature cards, footer notice

---

### Screen P-02: Survey — Step 1 (Background)

**Route:** `/survey`
**Role:** Technician (anonymous)
**Purpose:** Collect personal, location, and contact information.

**Layout:**
```
┌──────────────────────────────────────────┐
│  [Progress Bar: Step 1 of 6] ████░░░░░   │
├──────────────────────────────────────────┤
│  Background Information                   │
│  ─────────────────────                   │
│  First Name *          Surname *          │
│  [______________]      [______________]   │
│                                          │
│  Gender *                                │
│  [○ Male  ○ Female  ○ Prefer not to say] │
│                                          │
│  Age Group *     Education Level *        │
│  [Dropdown ▼]    [Dropdown ▼]            │
│                                          │
│  Years Experience *  Work Focus * (multi) │
│  [Dropdown ▼]        [☐ HVAC  ☐ Ref...] │
│                                          │
│  Province *     City *     Suburb *      │
│  [Dropdown ▼]  [______]   [______]       │
│                                          │
│  GPS: [📍 Use my location]               │
│  [Interactive Map Pin Picker]             │
│                                          │
│  Phone (+263...) *   Email (optional)    │
│  [______________]    [______________]     │
│                                          │
│  [← Back]                    [Next →]   │
└──────────────────────────────────────────┘
```

---

### Screen P-03: Survey — Step 2 (Skills & Training)

**Route:** `/survey` (step 2)
**Purpose:** Collect certification, training, and skill confidence data.

**Key Components:**
- Has formal training? (Yes/No radio)
- Conditional: Training institution text field + training year (shown only if Yes)
- Has certification? (Yes/No/Studying radio)
- Conditional: Certifications held (multi-checkbox) + certification number
- Conditional: HEVACRAZ membership number (if HEVACRAZ certification selected)
- 5 Likert scale sliders (1=Very Low, 5=Very High):
  - Confidence with traditional refrigerants
  - Confidence with low-GWP refrigerants
  - Access to tools and equipment
  - Access to spare parts
  - Access to low-GWP refrigerants

---

### Screen P-04: Survey — Step 3 (Tools & Resources)

**Route:** `/survey` (step 3)
**Purpose:** Rate 4 operational obstacles on Likert 1–5 scale.

**Key Components:**
- 4 Likert scale inputs (1=Not an obstacle, 5=Severe obstacle):
  - High import costs
  - Forex shortages
  - Unreliable suppliers
  - Counterfeit products
- Text area: Other obstacles (optional)

---

### Screen P-05: Survey — Step 4 (Work Challenges)

**Route:** `/survey` (step 4)
**Purpose:** Assess operational challenges and compliance practices.

**Key Components:**
- Biggest daily challenge (11-option dropdown, with "Other" text field)
- Load shedding frequency (5-option radio)
- Refrigerant recovery equipment use (5-option radio)
- PPE access (4-option radio)
- EHS compliance barriers (multi-checkbox, with "Other" text field)

---

### Screen P-06: Survey — Step 5 (Energy Efficiency)

**Route:** `/survey` (step 5)
**Purpose:** Assess energy-efficient equipment installation practices.

**Key Components:**
- How often energy-efficient equipment is installed (5-option radio)
- Conditional: Energy-efficient barriers (multi-checkbox, shown unless "Always" selected)
- Optional: Other barrier text field

---

### Screen P-07: Survey — Step 6 (Consent & Photo)

**Route:** `/survey` (step 6)
**Purpose:** Collect consent and optional profile photo. Gate on data protection acceptance.

**Key Components:**
- Data protection notice with expandable text
- Consent to be contacted (Yes/No radio)
- Consent to public registry listing (Yes/No radio)
- Preferred language (3-option radio: English/Shona/Ndebele)
- Profile photo upload: camera capture on mobile, file upload on desktop
  - Preview thumbnail shown after selection
  - Uploaded to Cloudflare R2 via presigned URL
- Data protection notice checkbox (must be checked to submit)
- Submit button (active only when data consent = true)

---

### Screen P-08: Survey Complete

**Route:** `/survey/complete`
**Purpose:** Confirmation screen with reference number.

**Layout:**
```
┌──────────────────────────────────────────┐
│  ✅ Registration Submitted               │
│                                          │
│  Thank you, [First Name]                 │
│                                          │
│  Reference Number                        │
│  ┌────────────────────────────────────┐  │
│  │   REF: xxxxxxxx-xxxx-xxxx         │  │
│  │   Keep this for your records      │  │
│  └────────────────────────────────────┘  │
│                                          │
│  What happens next?                      │
│  1. NOU and HEVACRAZ will review         │
│  2. You may be contacted for training    │
│  3. Verified entries appear in registry  │
└──────────────────────────────────────────┘
```

---

### Screen P-09: Edit Existing Application

**Route:** `/edit`
**Purpose:** Lookup form to retrieve and edit an existing submission by phone number.

**Components:** Phone number input (+263 format), lookup button, error/success state

---

### Screen P-10: Retailer Survey

**Route:** `/retailer-survey`
**Purpose:** 4-step survey for RAC equipment retailers, wholesalers, distributors, and importers.

**Steps Overview:**
1. Business Information (name, type, location, size, years, registration number)
2. Products & Sourcing (product categories, sourcing, customers, refrigerant awareness)
3. Challenges (supply challenges, competition, load shedding impact, training interest)
4. Consent (contact consent, language, data protection)

---

### Screen P-11: Privacy Notice

**Route:** `/privacy-notice`
**Purpose:** Full data protection notice explaining data collection, processing, storage, rights, and legal basis.

---

### Screen P-12: Maintenance Page

**Route:** `/maintenance`
**Purpose:** Displayed to all public users when `MAINTENANCE_MODE=true`. Admin routes remain accessible.

---

### Screen P-13: Offline Page

**Route:** `/survey/offline`
**Purpose:** PWA offline fallback — explains offline capability and shows queued submission status.

---

## 3. ADMIN PORTAL SCREENS

---

### Screen A-01: Admin Login

**Route:** `/admin/login`
**Role:** Admin, Super Admin
**Purpose:** Authenticate administrators.

**Layout:**
```
┌──────────────────────────────────────────┐
│    [NOU · HEVACRAZ Logo]                 │
│    RAC Registry — Admin Portal           │
│                                          │
│    Email Address                         │
│    [____________________________]        │
│                                          │
│    Password                              │
│    [____________________________]        │
│                                          │
│    [Sign In]                             │
│                                          │
│    Forgot password?                      │
└──────────────────────────────────────────┘
```

---

### Screen A-02: Dashboard

**Route:** `/admin/dashboard`
**Role:** Admin, Super Admin
**Purpose:** Real-time overview of registry statistics.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│ Dashboard          Welcome back, [Name]               │
│ Last sign-in: 01 Jun 2025, 09:30      [🔔] [Insights]│
├─────────┬─────────┬────────┬──────────┬──────────────┤
│ Total   │ Today   │ 7 Days │ Verified │ Pending      │
│  [###]  │  [##]   │  [###] │  [###]   │  [###]       │
├─────────┴─────────┴────────┴──────────┴──────────────┤
│ [Flagged: ##]  [Duplicate: ##]                        │
├──────────────────────────────────────────────────────┤
│ [Bar: By Province]    [Bar: By Work Focus]            │
│ [Pie: Certification]  [Line: 30-day submissions]      │
├──────────────────────────────────────────────────────┤
│ Recent Submissions (last 10)                          │
│ Name | Province | Work Focus | Status | Date          │
└──────────────────────────────────────────────────────┘
```

**Stats Cards:** Total, Today, Last 7 Days, Verified, Pending, Flagged, Duplicate (7 cards)

---

### Screen A-03: Responses List

**Route:** `/admin/responses`
**Role:** Admin, Super Admin
**Purpose:** Manage all technician survey submissions.

**Components:**
- Filter bar: Province, Status, Work Focus, Certification, Date range, Search (name/phone)
- Bulk action dropdown (change status for selected)
- Paginated table: Name, Province, Work Focus, Certification, Status, Date, Actions
- Status badges: Pending (yellow), Verified (green), Flagged (red), Duplicate (grey)
- Click row → detail page

---

### Screen A-04: Response Detail

**Route:** `/admin/responses/[id]`
**Purpose:** Full submission review and action panel.

**Sections:**
- Header: Name, phone, reference, status badge, action buttons (Verify/Flag/Duplicate/Edit)
- Section 1–6: All survey fields displayed with labels
- Map: Leaflet pin showing GPS location
- Profile photo (if provided)
- Admin notes panel
- AI Analysis button → expandable panel with Groq assessment
- Audit log: Timeline of all changes
- Email log: History of notifications sent

---

### Screen A-05: Response Edit

**Route:** `/admin/responses/[id]/edit`
**Purpose:** Full editable form for all survey fields (admin correction).

---

### Screen A-06: Map

**Route:** `/admin/map`
**Purpose:** Geographic visualisation of all technician locations.

**Components:**
- Full-screen Leaflet map
- Province filter dropdown
- Status filter
- Heat map toggle
- Marker clustering
- Popup on marker click: name, province, status

---

### Screen A-07: Technicians Directory

**Route:** `/admin/technicians`
**Purpose:** Searchable, filterable directory of all registered technicians.

**Components:**
- Filter bar: Province, Certification, Status, Name search
- Paginated table: Name, Province, Phone, Email, Certification, Status, Date
- Export to CSV button

---

### Screen A-08: Insights

**Route:** `/admin/insights`
**Purpose:** Aggregated workforce analytics with AI summaries.

**Sections:**
- Summary stats bar (total verified, average Likert scores, top challenge)
- Skills Section: Training %, certification breakdown, Likert means chart
- Energy Section: Installation frequency, barrier analysis
- Challenges Section: Daily challenge frequency, load shedding chart
- Resources Section: Access ratings, obstacle ratings
- AI Generate button per section

---

### Screen A-09: Province Comparison

**Route:** `/admin/provinces`
**Purpose:** Side-by-side statistical comparison of all 10 provinces.

---

### Screen A-10: Period Comparison

**Route:** `/admin/comparison`
**Purpose:** Compare two time periods (e.g., before/after a training campaign).

---

### Screen A-11: Survey Funnel

**Route:** `/admin/funnel`
**Purpose:** Drop-off analysis showing how many users started vs. completed each step.

**Chart:** Vertical funnel chart with step-by-step completion rates

---

### Screen A-12: Coverage Gap

**Route:** `/admin/coverage`
**Purpose:** Geographic coverage analysis — identifies provinces and districts with low registrations relative to estimated technician population.

---

### Screen A-13: Duplicate Detection

**Route:** `/admin/duplicates`
**Purpose:** Surface potential duplicate submissions for manual review.

**Algorithm:** Similarity matching on name, phone, and geographic proximity

---

### Screen A-14: Export

**Route:** `/admin/export`
**Purpose:** Configurable multi-format data export.

**Layout:**
```
┌──────────────────────────────────────────┐
│  Export Data                             │
│                                          │
│  Sections to include:                    │
│  [☑ Background] [☑ Skills] [☑ Tools]    │
│  [☑ Challenges] [☑ Energy] [☑ Consent]  │
│                                          │
│  [☐ Anonymise (remove PII)]              │
│  [☐ Include photo URLs]                  │
│                                          │
│  Format:                                 │
│  [● CSV] [○ Excel] [○ PDF]              │
│  [○ GeoJSON] [○ SPSS]                   │
│                                          │
│  [Export Now →]                         │
└──────────────────────────────────────────┘
```

---

### Screen A-15: Report Builder

**Route:** `/admin/report-builder`
**Purpose:** Custom cross-tabulation builder with column selection and filtering.

---

### Screen A-16 to A-22: Report Pages (7 types)

| Screen | Route | Report Type |
|---|---|---|
| A-16 | `/admin/reports/technician-survey` | Technician Survey Report (with AI + PDF generation) |
| A-17 | `/admin/reports/methodology` | Methodology & Readiness |
| A-18 | `/admin/reports/skills-gap` | Skills Gap Analysis |
| A-19 | `/admin/reports/tools-needs` | Tools & Equipment Needs |
| A-20 | `/admin/reports/barrier-analysis` | Barrier Analysis |
| A-21 | `/admin/reports/geo-mapping` | Geo Mapping Report |
| A-22 | `/admin/reports/achievement-gaps` | Achievement & Gaps |

**Common Layout:**
- Report title and description
- Date range picker (where applicable)
- Stat cards from live data
- Charts and tables
- AI Analyse button → AI insight panel
- Export PDF button

---

### Screen A-23: Registry Preview

**Route:** `/admin/registry-preview`
**Purpose:** Preview of the public-facing technician directory.

**Layout:**
```
┌──────────────────────────────────────────┐
│  Public Registry Preview                 │
│  ### verified technicians               │
│                                          │
│  [NOU · HEVACRAZ · Public Directory]    │
│  ┌──────────────┐┌──────────────────┐   │
│  │ [A] A. Moyo  ││ [B] B. Ncube    │   │
│  │ Harare       ││ Bulawayo        │   │
│  │ [Certified]  ││                 │   │
│  └──────────────┘└──────────────────┘   │
└──────────────────────────────────────────┘
```

---

### Screen A-24: Messaging

**Route:** `/admin/messaging`
**Purpose:** Compose and send broadcast emails to all consented technicians.

**Components:**
- Subject line input
- Rich HTML body textarea
- Recipient count display
- Preview render
- Send button with confirmation dialog

---

### Screen A-25: Admin Users

**Route:** `/admin/users`
**Role:** Super Admin only
**Purpose:** Manage admin accounts.

**Components:**
- User list: Name, Email, Role, Status (Active/Inactive), Last Login
- Invite new admin button → modal with email input
- Toggle active status per user

---

### Screen A-26: Sysadmin Dashboard

**Route:** `/admin/sysadmin`
**Role:** Email-gated sysadmin only
**Purpose:** Full system monitoring and audit log.

**Components:**
- Overview panel: Total events, active sessions, recent errors (live polling)
- Event type pie chart
- Events timeline chart (24h)
- Full system event log table with pagination and type filter

---

## 4. EMAIL TEMPLATES (UI Reference)

All 6 email templates share the same HTML shell:
- **Header:** Brand-600 background, NOU · HEVACRAZ logo, "RAC Technician Registry" title
- **Body:** White card, content block
- **Footer:** NOU & HEVACRAZ names, automated message disclaimer, year/copyright

| Template | Subject | Key Content |
|---|---|---|
| E-01: Registration Submitted | "Registration Submitted — RAC Technician Registry" | Checkmark icon, reference number block, 3-step "what next" list |
| E-02: Registration Verified | "Registration Verified — RAC Technician Registry" | Checkmark icon, public/private registry status message |
| E-03: Action Required (Flagged) | "Action Required — RAC Technician Registry" | Warning icon, red reason block, contact instructions |
| E-04: Admin Invitation | "Admin Portal Invitation — RAC Technician Registry" | "Set up your account" CTA button, 72h expiry notice |
| E-05: Password Reset | "Password Reset — RAC Technician Registry Admin" | "Reset your password" CTA button, 2h expiry, security notice |
| E-06: New Submission Alert | "New Submission: [Name] — RAC Technician Registry" | Applicant card (name, province, reference), "Review Submission" CTA |

---

*Document End*
