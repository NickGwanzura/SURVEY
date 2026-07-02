# ADMINISTRATOR MANUAL
## National RAC Technician Registry — NOU · HEVACRAZ Admin Portal

**Document Reference:** NOU-HEVACRAZ-ADM-2025-001
**Version:** 1.0
**Date:** 2025-06-01
**Audience:** NOU Staff, HEVACRAZ Staff (Admin and Super Admin roles)

---

## INTRODUCTION

This manual covers every function available to administrators of the National RAC Technician Registry. The Admin Portal is accessed at:

```
https://racregistryzw.org/admin
```

If you do not have an account, ask your Super Administrator to invite you.

---

## CHAPTER 1 — GETTING STARTED

### 1.1 Account Setup (New Admins)

When a Super Admin invites you:

1. Check your email for a message titled **"Admin Portal Invitation — RAC Technician Registry"**
2. Click **"Set up your account"** — this link is valid for **72 hours**
3. You will be taken to the Setup page
4. Enter your **full name** and choose a **strong password** (minimum 8 characters; use a mix of letters, numbers, and symbols)
5. Click **"Create account"**
6. You will be automatically logged in and taken to the Dashboard

**If your invitation link has expired:** Contact your Super Admin to resend an invitation.

### 1.2 Logging In

1. Go to `https://racregistryzw.org/admin/login`
2. Enter your **email address** and **password**
3. Click **"Sign In"**
4. Your session is active for **4 hours**. You will be signed out automatically after inactivity.

### 1.3 Forgot Password

1. Click **"Forgot password?"** on the login page
2. Enter your email address and click **"Send reset link"**
3. Check your email for a message titled **"Password Reset — RAC Technician Registry Admin"**
4. Click **"Reset your password"** — this link is valid for **2 hours**
5. Enter and confirm your new password
6. Click **"Reset password"**

> **Security note:** All existing sessions are signed out when you reset your password.

### 1.4 Signing Out

Click your name in the bottom-left corner of the sidebar, then click **"Sign out"**.

---

## CHAPTER 2 — DASHBOARD

**Route:** `/admin/dashboard`

The Dashboard is your home screen. It refreshes on every page load to show live data.

### 2.1 Statistics Cards

At the top, you will see 7 summary cards:

| Card | Description |
|---|---|
| **Total** | All-time number of technician registrations |
| **Today** | Submissions received today (CAT timezone) |
| **Last 7 Days** | Submissions received in the past 7 days |
| **Verified** | Submissions that have been reviewed and approved |
| **Pending** | Submissions awaiting review |
| **Flagged** | Submissions flagged for further information |
| **Duplicate** | Submissions identified as duplicates |

### 2.2 Charts

| Chart | Description |
|---|---|
| **By Province** | Bar chart showing submissions per Zimbabwe province |
| **By Work Focus** | Bar chart of the most common HVAC-R specialisations |
| **Certification Status** | Pie chart: Certified / Not Certified / Studying |
| **Daily Submissions** | Line chart of daily submissions over the past 30 days |

### 2.3 Recent Submissions Table

Shows the last 10 registrations with Name, Province, Work Focus, Status, and Date. Click any row to open the full detail.

### 2.4 Notification Bell 🔔

The bell icon in the top right shows unread alerts (e.g., new submissions). Click it to see the notification list.

---

## CHAPTER 3 — MANAGING RESPONSES

**Route:** `/admin/responses`

### 3.1 Viewing the Responses List

The Responses page shows all technician submissions in a paginated table. Each row shows:
- **Name** — First name and surname
- **Province** — Zimbabwe province
- **Work Focus** — HVAC-R specialisations
- **Certification** — yes / no / studying
- **Status** — Pending / Verified / Flagged / Duplicate
- **Date** — Submission date

### 3.2 Filtering Submissions

Use the Filter Bar at the top to narrow down the list:

| Filter | Options |
|---|---|
| **Province** | Any of Zimbabwe's 10 provinces |
| **Status** | Pending, Verified, Flagged, Duplicate |
| **Work Focus** | HVAC-R sub-sector |
| **Certification** | Yes, No, Studying |
| **Date Range** | Start and end date |
| **Search** | Name or phone number |

Click **"Clear filters"** to reset all filters.

### 3.3 Bulk Actions

1. Select multiple submissions using the checkboxes on the left
2. Click the **"Bulk Actions"** dropdown
3. Choose: Verify All, Flag All, or Mark Duplicate
4. Confirm the action

> **Caution:** Bulk status changes cannot be undone individually — each change is recorded in the audit trail.

### 3.4 Opening a Response

Click any row to open the full Response Detail page.

---

## CHAPTER 4 — REVIEWING INDIVIDUAL RESPONSES

**Route:** `/admin/responses/[id]`

### 4.1 Response Sections

The detail page displays all 6 survey sections:
1. **Background** — Name, gender, age, education, experience, province, GPS, phone, email
2. **Skills & Training** — Certifications, training history, confidence Likert ratings
3. **Tools & Resources** — Obstacle Likert ratings
4. **Work Challenges** — Daily challenges, load shedding, PPE, EHS barriers
5. **Energy Efficiency** — Installation practices and barriers
6. **Consent** — Contact consent, public registry consent, language, photo

### 4.2 Map and Photo

- If the technician provided GPS coordinates, a **map pin** is shown on their location.
- If they uploaded a **profile photo**, it is displayed in the Consent section.

### 4.3 Taking Action on a Submission

At the top of the response, you will see the Action Panel with buttons:

#### VERIFY ✅
Use this when you have reviewed the submission and are satisfied it is genuine and complete.

1. Click **"Verify"**
2. The status changes to **Verified**
3. If the technician provided an email, they receive a **"Registration Verified"** email
4. If they consented to the public registry, their name now appears in the **Public Registry**

#### FLAG ⚠️
Use this when the submission requires further information or clarification.

1. Click **"Flag"**
2. Enter a **reason** (e.g., "Certification number not matching HEVACRAZ records")
3. Click **"Submit flag"**
4. Status changes to **Flagged**
5. If they provided an email, they receive an **"Action Required"** email with your reason

#### MARK DUPLICATE 🔄
Use this when the submission appears to be a duplicate of another record.

1. Click **"Duplicate"**
2. Optionally note the original record ID in the notes field
3. Status changes to **Duplicate**

### 4.4 Adding Notes

Use the **Notes** panel to add internal observations:
- Notes are visible only to admins
- Notes are not sent to the technician
- All note additions are logged in the audit trail

### 4.5 AI Analysis

Click the **"AI Analysis"** button to get an automated assessment using Groq AI:

The analysis returns:
- **Summary** — 2–3 sentence overview of the profile
- **Flags** — Any concerns identified (missing data, inconsistencies)
- **Recommendation** — approve / request more info / flag for manual review

> **Note:** AI analysis is an advisory tool. Final decisions remain with the administrator.

### 4.6 Audit Trail

At the bottom of each response, the **Audit Log** shows a timeline of:
- Every status change (who changed it and when)
- Every field edit (previous and new values)
- Applicant self-edits
- Notes added

---

## CHAPTER 5 — EDITING RESPONSES

**Route:** `/admin/responses/[id]/edit`

Admins can correct any field in a submission:

1. Click **"Edit"** on the response detail page
2. All 6 survey sections are displayed as an editable form
3. Make your corrections
4. Click **"Save changes"**
5. All changes are recorded in the audit log with the previous values

> **Important:** Always add a note explaining why you edited a submission (use the Notes field).

---

## CHAPTER 6 — GEOSPATIAL MAP

**Route:** `/admin/map`

The Map shows all technicians with GPS coordinates on an interactive Leaflet map.

### 6.1 Map Controls

| Control | Action |
|---|---|
| Zoom in/out | Mouse wheel or ± buttons |
| Pan | Click and drag |
| Marker cluster | Clusters expand at higher zoom levels |
| Click marker | Shows name, province, status popup |
| Heat map toggle | Shows density overlay |

### 6.2 Filters

Use the **Filter Panel** to show only certain technicians:
- **Province filter** — select one or more provinces
- **Status filter** — show pending/verified/flagged/duplicate

---

## CHAPTER 7 — TECHNICIANS DIRECTORY

**Route:** `/admin/technicians`

A searchable, filterable list of all registered technicians.

### 7.1 Searching and Filtering

- **Search** — type a name to search
- **Province** — filter by province
- **Certification** — filter by certification status
- **Status** — filter by submission status

### 7.2 Exporting the Directory

Click **"Export CSV"** to download the filtered directory as a CSV file for use in Excel or other tools.

---

## CHAPTER 8 — INSIGHTS AND ANALYTICS

**Route:** `/admin/insights`

### 8.1 Insights Sections

The Insights page is divided into 4 analytical sections:

| Section | What It Shows |
|---|---|
| **Skills** | Training percentage, certification breakdown, Likert means for confidence and access |
| **Energy Efficiency** | How often energy-efficient equipment is installed; top barriers |
| **Challenges** | Daily challenge frequency; load shedding impact; EHS compliance barriers |
| **Resources** | Tool/parts/refrigerant access ratings; obstacle ratings |

### 8.2 AI Summary

Click **"Generate AI Summary"** in any section to produce a narrative interpretation of the data using Groq AI. The summary includes:
- An overview paragraph
- 3–5 key findings
- 2–3 actionable recommendations for NOU/HEVACRAZ

### 8.3 Other Analytics Pages

| Page | Route | Description |
|---|---|---|
| Province Comparison | `/admin/provinces` | Side-by-side metrics for all 10 provinces |
| Period Comparison | `/admin/comparison` | Compare two time periods (e.g., before/after a training event) |
| Survey Funnel | `/admin/funnel` | Drop-off analysis per survey step |
| Coverage Gap | `/admin/coverage` | Geographic coverage analysis — which districts are under-represented |
| Duplicates | `/admin/duplicates` | Potential duplicate submissions for manual review |

---

## CHAPTER 9 — REPORTS

**Route:** `/admin/reports/`

### 9.1 Report Types

| Report | Route | Purpose |
|---|---|---|
| Technician Survey Report | `/admin/reports/technician-survey` | Formal periodic report with AI summary and PDF generation |
| Methodology & Readiness | `/admin/reports/methodology` | Survey methodology and data readiness assessment |
| Skills Gap Analysis | `/admin/reports/skills-gap` | Workforce skills gap relative to low-GWP requirements |
| Tools & Equipment | `/admin/reports/tools-needs` | Tools and equipment access needs |
| Barrier Analysis | `/admin/reports/barrier-analysis` | Barriers to compliance and progression |
| Geo Mapping | `/admin/reports/geo-mapping` | Geographic distribution analysis |
| Achievement & Gaps | `/admin/reports/achievement-gaps` | Progress against registry and training targets |

### 9.2 Generating a Technician Survey Report

1. Go to **Reports → Technician Survey Report**
2. Set the **Reporting Period Start** and **End** dates
3. Click **"Generate Report"**
4. Wait 30–60 seconds while the system:
   - Queries the database
   - Generates an AI summary
   - Creates a PDF document
   - Uploads it to storage
5. The report appears in the **Generated Reports** list below
6. Click **"Download PDF"** to save it

### 9.3 Report Builder

**Route:** `/admin/report-builder`

For custom analysis:
1. Select which columns to include
2. Apply filters
3. Click **"Build Report"** to view the cross-tabulation
4. Export the result

---

## CHAPTER 10 — DATA EXPORT

**Route:** `/admin/export`

### 10.1 Configuring an Export

**Step 1:** Select data sections to include:
- ☑ Background (identity, location, phone, email)
- ☑ Skills & Training
- ☑ Tools & Resources
- ☑ Work Challenges
- ☑ Energy Efficiency
- ☑ Consent

**Step 2:** Choose options:
- **Anonymise** — Removes names, phone, and email. Use this for UNEP submissions and public analysis.
- **Include photo URLs** — Adds the Cloudflare R2 URL for profile photos.

**Step 3:** Select format:
- **CSV** — For Excel, SPSS, or any data tool
- **Excel (.xlsx)** — Formatted spreadsheet
- **PDF** — Formatted report
- **GeoJSON** — For GIS mapping tools
- **SPSS (.sav)** — For statistical analysis with SPSS

**Step 4:** Click **"Export Now"**

The file downloads immediately. All exports are logged in the system audit trail.

---

## CHAPTER 11 — MESSAGING

**Route:** `/admin/messaging`

Send a broadcast email to all registered technicians who provided an email address and consented to being contacted.

### 11.1 Composing a Message

1. Enter the **Subject** line (e.g., "Training Programme Invitation — Harare, August 2025")
2. Write the **Message** in the HTML body area
3. The system shows how many recipients will receive the email
4. Click **"Send"**
5. A results summary shows how many emails were delivered successfully

> **Note:** Emails are sent to technicians where `consent_to_contact = true` and an email address was provided.

---

## CHAPTER 12 — ADMIN USER MANAGEMENT (SUPER ADMIN ONLY)

**Route:** `/admin/users`

Only **Super Admins** can manage admin accounts.

### 12.1 Inviting a New Admin

1. Click **"Invite Admin"**
2. Enter the person's **email address**
3. Click **"Send Invitation"**
4. They receive an invitation email and have **72 hours** to complete setup

### 12.2 Activating / Deactivating Accounts

- Find the admin in the users list
- Click the **Active/Inactive** toggle
- Deactivated accounts cannot log in; existing sessions immediately become invalid

---

## CHAPTER 13 — PUBLIC REGISTRY PREVIEW

**Route:** `/admin/registry-preview`

This page shows exactly what the public will see — a directory of verified technicians who consented to public listing.

Each entry shows:
- First name and surname
- Province
- "Certified" badge (if hasCertification=yes)

> **This is the public-facing directory. Only verified technicians with consent_to_public_registry = true appear here.**

---

## CHAPTER 14 — SYSADMIN DASHBOARD (RESTRICTED)

**Route:** `/admin/sysadmin`

This page is only accessible to the designated system administrator. It shows:
- **System Events Timeline** — All admin actions over 24 hours
- **Event Type Distribution** — Pie chart of event categories
- **Full System Event Log** — Searchable and filterable audit trail

If you need access to this page and cannot access it, contact the system developer.

---

## APPENDIX A — SUBMISSION STATUS GUIDE

| Status | Meaning | Who Sets It | Email Sent? |
|---|---|---|---|
| **Pending** | Newly submitted, awaiting admin review | System (automatic) | ✅ Admin alert |
| **Verified** | Reviewed and approved | Admin | ✅ Technician (if email) |
| **Flagged** | Requires further information | Admin | ✅ Technician (if email) |
| **Duplicate** | Identified as a duplicate submission | Admin | No |

---

## APPENDIX B — KEYBOARD SHORTCUTS

| Shortcut | Action |
|---|---|
| `Ctrl+F` / `Cmd+F` | Search on current page |
| `Tab` | Navigate form fields |
| `Enter` | Submit focused form |
| `Esc` | Close modal dialogs |

---

## APPENDIX C — COMMON ISSUES AND SOLUTIONS

| Issue | Solution |
|---|---|
| Cannot log in | Check email/password; use "Forgot password?" if needed |
| Session expired | Log in again at `/admin/login` |
| Report generation is slow | Wait up to 60 seconds — AI analysis takes time |
| Export file is empty | Check that your filters are not too restrictive |
| Map markers not showing | Check filters; ensure GPS coordinates exist in submissions |
| Email bounce | Check technician's email address in their record |
| AI analysis returns "manual review" | This is a fallback — review the submission manually |

---

*Document End*

**Document Control:**

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2025-06-01 | Technical Writer | Initial release |
