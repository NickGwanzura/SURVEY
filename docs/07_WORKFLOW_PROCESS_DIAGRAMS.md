# WORKFLOW & PROCESS DIAGRAMS
## National RAC Technician Registry — ZW RAC Survey Platform

**Document Reference:** NOU-HEVACRAZ-WF-2025-001
**Version:** 1.0
**Date:** 2025-06-01
**Status:** Finalised
**Notation:** Mermaid flowchart diagrams (render at mermaid.live or in any Markdown viewer with Mermaid support)

---

## 1. TECHNICIAN REGISTRATION WORKFLOW

**Description:** End-to-end journey of a RAC technician self-registering in the national registry. Covers both online and offline paths.

```mermaid
flowchart TD
    A([Technician visits racregistryzw.org]) --> B[Landing Page]
    B --> C{Has existing\nregistration?}
    C -->|No| D[Click 'Start the survey']
    C -->|Yes| E[Click 'Edit an existing application']
    E --> F[Enter phone number]
    F --> G{Phone found?}
    G -->|No| H[Error: not found]
    G -->|Yes| I[Pre-fill survey with existing data]
    I --> D2[Edit fields]
    D2 --> SUB
    
    D --> ST1[Step 1: Background\nName, Location, GPS, Phone]
    ST1 --> ST2[Step 2: Skills & Training\nCertifications, Likert ratings]
    ST2 --> ST3[Step 3: Tools & Resources\nObstacle Likert ratings]
    ST3 --> ST4[Step 4: Work Challenges\nDaily challenges, EHS barriers]
    ST4 --> ST5[Step 5: Energy Efficiency\nInstallation practices]
    ST5 --> ST6[Step 6: Consent\nContact, public registry, photo, data protection]
    
    ST6 --> DPC{Data Protection\nConsent accepted?}
    DPC -->|No| DPC2[Cannot submit — consent required]
    DPC -->|Yes| NET{Internet\nconnection?}
    
    NET -->|Online| SUB[POST /api/survey/submit]
    NET -->|Offline| OFL[Save to IndexedDB queue]
    OFL --> OFL2[Show offline banner]
    OFL2 --> REC{Internet\nrestored?}
    REC -->|Yes| SYNC[SyncWatcher triggers flush]
    SYNC --> SUB
    
    SUB --> VAL{Server\nvalidation}
    VAL -->|Invalid| ERR1[Return 400 error\nDisplay field errors]
    VAL -->|Duplicate phone| ERR2[Return 409\n'Already registered']
    VAL -->|Valid| SAVE[Save to database\nstatus=pending]
    
    SAVE --> EMAIL1{Email\nprovided?}
    EMAIL1 -->|Yes| CONF[Send confirmation email\nwith reference number]
    EMAIL1 -->|No| ALERT
    CONF --> ALERT[Send admin alert emails\nto all active admins]
    ALERT --> DONE[Redirect to /survey/complete\nShow reference number]
```

---

## 2. TECHNICIAN SUBMISSION APPROVAL WORKFLOW

**Description:** The workflow an NOU/HEVACRAZ administrator follows to review and approve or flag a technician submission.

```mermaid
flowchart TD
    A([Admin receives email alert\n'New Submission Alert']) --> B[Login at /admin/login]
    B --> C{Session\nvalid?}
    C -->|No| D[Enter email + password]
    D --> E{Credentials\nvalid?}
    E -->|No| F[Show error\nMax 3 attempts]
    E -->|Yes| G[Create DB session\nSet JWT cookie]
    G --> H
    C -->|Yes| H[Admin Dashboard /admin/dashboard]
    
    H --> I[Navigate to /admin/responses]
    I --> J[Filter: status = pending]
    J --> K[Select submission to review]
    K --> L[View detail page /admin/responses/id]
    
    L --> M[Review all 6 sections]
    M --> N[Check GPS location on map]
    N --> O[Review profile photo]
    O --> P{Run AI Analysis?}
    P -->|Yes| Q[Groq AI evaluates submission\nReturns: summary, flags, recommendation]
    Q --> R
    P -->|No| R{Admin Decision}
    
    R -->|Approve| V[PATCH status = verified]
    R -->|Flag for review| S[Enter reason text]
    S --> T[PATCH status = flagged]
    R -->|Mark duplicate| U[PATCH status = duplicate]
    
    V --> V1[UPDATE technicians_survey]
    V1 --> V2[INSERT audit_log\naction: status_change]
    V2 --> V3[INSERT system_events\nevent: response.verified]
    V3 --> V4{Email\nprovided?}
    V4 -->|Yes| V5[Send: Registration Verified email]
    V4 -->|No| V6
    V5 --> V6{consent_to_public\n_registry = true?}
    V6 -->|Yes| V7[Technician appears\nin public registry]
    V6 -->|No| V8[Not publicly listed]
    
    T --> T1[UPDATE technicians_survey]
    T1 --> T2[INSERT audit_log]
    T2 --> T3{Email\nprovided?}
    T3 -->|Yes| T4[Send: Action Required email\nwith reason]
    T3 -->|No| T5[Note added to record]
```

---

## 3. OFFLINE SUBMISSION WORKFLOW

**Description:** How survey submissions are queued and synchronised when the technician has no internet connection.

```mermaid
flowchart TD
    A([Technician opens survey]) --> B{Internet\nconnection?}
    B -->|Online| C[Normal survey flow\nSee Workflow 1]
    B -->|Offline| D[PWA serves cached app\nfrom service worker]
    
    D --> E[OfflineBanner shows:\n'Working Offline']
    E --> F[Complete all 6 survey steps]
    F --> G[Click Submit]
    G --> H[offline-sync.ts:\nqueueSubmission to IndexedDB]
    H --> I[Show: 'Saved offline\nWill sync when connected']
    
    I --> J{Monitor connection}
    J -->|Still offline| K[Queue persists\nCounter shows pending]
    K --> J
    
    J -->|Connection restored| L[SyncWatcher detects\nonline event]
    L --> M[flushQueuedSubmissions]
    M --> N{For each queued\nsubmission}
    N --> O[POST /api/survey/submit\nsubmissionSource: pwa_offline_sync]
    O --> P{Success?}
    P -->|200 OK| Q[removeQueuedSubmission\nfrom IndexedDB]
    Q --> R[Show: Sync complete toast]
    P -->|Error| S[markSubmissionAttempt\nRecord error + attempt count]
    S --> T[Retry on next reconnect]
```

---

## 4. ADMIN USER MANAGEMENT WORKFLOW

**Description:** Process for onboarding new NOU/HEVACRAZ administrators and managing existing accounts.

```mermaid
flowchart TD
    A([Super Admin at /admin/users]) --> B[Click 'Invite Admin']
    B --> C[Modal: Enter email address]
    C --> D[POST /api/admin/users/invite]
    D --> E[Generate secure invite token\nStore token hash in DB\n72h expiry]
    E --> F[Send Admin Invitation email\nwith setup link]
    F --> G[Invited user receives email]
    
    G --> H[Click 'Set up your account'\nLink = /admin/setup?token=...]
    H --> I{Token valid\nand unexpired?}
    I -->|No| J[Error: Invalid or expired link\nContact Super Admin]
    I -->|Yes| K[Setup form:\nEnter name + password]
    K --> L[POST /api/admin/auth/setup]
    L --> M[Create admin_users record\nrole=admin, is_active=true]
    M --> N[Mark token as used]
    N --> O[Auto-login: create session\nSet JWT cookie]
    O --> P[Redirect to /admin/dashboard]
    
    P --> Q([Admin can now use the system])
    
    A --> R[Deactivate admin]
    R --> S[PATCH admin_user.is_active = false]
    S --> T[All sessions automatically\ninvalid on next request]
```

---

## 5. PASSWORD RESET WORKFLOW

**Description:** Secure password reset flow for admin users who have forgotten their credentials.

```mermaid
flowchart TD
    A([Admin at /admin/login]) --> B[Click 'Forgot password?']
    B --> C[Navigate to /admin/forgot-password]
    C --> D[Enter email address]
    D --> E[POST /api/admin/auth/forgot-password]
    E --> F{Email found\nin system?}
    F -->|No| G[Show: 'If that email exists,\nyou will receive a link'\nSecurity: no enumeration]
    F -->|Yes| H[Generate secure token\nSHA-256 hash stored in DB\n2-hour expiry]
    H --> I[Send Password Reset email\nwith reset link]
    I --> G
    
    G --> J[User receives email]
    J --> K[Click 'Reset your password'\nLink = /admin/reset-password?token=...]
    K --> L[Navigate to /admin/reset-password]
    L --> M[Enter new password\nConfirm password]
    M --> N[POST /api/admin/auth/reset-password]
    N --> O{Token valid\nand unused\nand unexpired?}
    O -->|No| P[Error: Link expired\nor already used]
    O -->|Yes| Q[Validate new password\nstrength]
    Q --> R[bcrypt hash new password\n12 rounds]
    R --> S[UPDATE admin_users\nset password_hash]
    S --> T[Mark token used_at = NOW]
    T --> U[Revoke ALL existing sessions\nfor this admin]
    U --> V[Show: Password reset success]
    V --> W[Redirect to /admin/login]
```

---

## 6. DATA EXPORT WORKFLOW

**Description:** Process for exporting registry data in various formats for reporting and analysis.

```mermaid
flowchart TD
    A([Admin at /admin/export]) --> B[Configure export options]
    B --> C[Select data sections:\nBackground / Skills / Tools\nChallenges / Energy / Consent]
    C --> D{Anonymise data?}
    D -->|Yes| E[PII fields excluded:\nname, phone, email\nIDs replaced with SHA-256 hash]
    D -->|No| F[Full PII included]
    E --> G
    F --> G[Include photo URLs? Yes/No]
    G --> H[Select format:\nCSV / Excel / PDF / GeoJSON / SPSS]
    H --> I[POST /api/admin/export]
    I --> J[Verify admin session]
    J --> K[Query database with filters]
    K --> L[Build export file\nin selected format]
    L --> M[INSERT export_log\nactor, format, row_count, anonymised]
    M --> N[Return file download\nContent-Disposition: attachment]
    N --> O([Admin receives file\nin browser download])
```

---

## 7. REPORT GENERATION WORKFLOW

**Description:** Formal report generation with AI analysis and PDF output.

```mermaid
flowchart TD
    A([Admin at /admin/reports/technician-survey]) --> B[Set reporting period\nStart date + End date]
    B --> C[Click 'Generate Report']
    C --> D[POST /api/admin/reports/technician-survey/generate]
    D --> E[Query DB: all submissions\nin reporting period]
    E --> F[Calculate statistics:\nCounts, means, distributions\nby province, certification, etc.]
    F --> G[POST to Groq API\nLlama 3.3 70B]
    G --> H[AI generates:\noverview, keyFindings,\nriskAreas, opportunities,\nrecommendedInterventions,\npriorityActions]
    H --> I[Build PDF with jsPDF:\nCover page, stats, charts, AI summary]
    I --> J[Upload PDF to Cloudflare R2]
    J --> K[INSERT technician_survey_reports\nstatus=completed, pdf_url, ai_summary]
    K --> L[Return report ID]
    L --> M[Admin views report list]
    M --> N[Click Download]
    N --> O[GET /api/admin/reports/.../download]
    O --> P[Return PDF file]
    P --> Q([Admin receives formatted PDF report])
```

---

## 8. BROADCAST EMAIL WORKFLOW

**Description:** Sending mass communications to all consented technicians.

```mermaid
flowchart TD
    A([Admin at /admin/messaging]) --> B[Compose message]
    B --> C[Enter subject line]
    C --> D[Write HTML email body]
    D --> E[Preview rendered email]
    E --> F[Click 'Send']
    F --> G[POST /api/admin/messaging]
    G --> H[Query DB: all technicians\nwhere email IS NOT NULL\nAND consent_to_contact = true]
    H --> I[Build recipient list]
    I --> J{Batch loop:\n50 recipients per batch}
    J --> K[POST to Resend API\nbatch of 50 recipients]
    K --> L{Delivery success?}
    L -->|Success| M[success_count += 50]
    L -->|Failure| N[failed_count += 50\nRecord error]
    M --> O{More\nbatches?}
    N --> O
    O -->|Yes| J
    O -->|No| P[Return delivery summary:\nsuccess, failed, errors]
    P --> Q[Admin sees results]
```

---

## 9. AI SUBMISSION ANALYSIS WORKFLOW

**Description:** On-demand AI analysis of an individual technician submission.

```mermaid
flowchart TD
    A([Admin views response detail]) --> B[Click 'AI Analysis' button]
    B --> C[POST /api/admin/ai-analyze\nbody: { surveyId }]
    C --> D[Fetch full submission\nfrom database]
    D --> E[Format survey data as JSON]
    E --> F[POST to Groq API\nLlama 3.3 70B model]
    F --> G[AI evaluates:\n- Profile summary\n- Red flags\n- Recommendation]
    G --> H{Parse JSON\nresponse}
    H -->|Success| I[Return:\n{ summary, flags, recommendation }]
    H -->|Parse error| J[Return fallback:\n'Manual review required']
    I --> K[Display in AiInsightPanel:\n- Summary text\n- Flag list\n- Recommendation badge]
```

---

## 10. SYSTEM EVENT LOGGING WORKFLOW

**Description:** How system events are recorded for audit and monitoring.

```mermaid
flowchart TD
    A([Any admin action]) --> B{Action type}
    
    B -->|Survey status change| C[INSERT audit_log\nsurvey_id, actor, action, payload]
    B -->|Admin login| D[INSERT system_events\nevent_type: admin.login]
    B -->|Data export| E[INSERT export_log\nformat, row_count, anonymised]
    E --> F[INSERT system_events\nevent_type: export.csv etc]
    B -->|Admin invited| G[INSERT system_events\nevent_type: admin.invited]
    B -->|Report generated| H[INSERT system_events\nevent_type: report.generated]
    B -->|Password reset| I[INSERT system_events\nevent_type: admin.password_reset]
    
    C --> J([Accessible via:\nResponse audit timeline\nSysadmin dashboard])
    D --> J
    F --> J
    G --> J
    H --> J
    I --> J
    
    J --> K[Sysadmin Dashboard\n/admin/sysadmin]
    K --> L[System event log table\nTimeline chart\nEvent type pie chart]
```

---

## 11. RETAILER SURVEY WORKFLOW

**Description:** End-to-end registration process for RAC equipment retailers and distributors.

```mermaid
flowchart TD
    A([Retailer visits retailer-survey URL]) --> B[Retailer Survey Landing]
    B --> C[Step 1: Business Information\nName, type, location, size, years]
    C --> D[Step 2: Products & Sourcing\nCategories, sourcing, customers, refrigerant awareness]
    D --> E[Step 3: Challenges\nSupply issues, load shedding, training interest]
    E --> F[Step 4: Consent\nContact consent, language, data protection]
    F --> G{Data protection\nConsent accepted?}
    G -->|No| H[Cannot submit]
    G -->|Yes| I[POST /api/retailer-survey/submit]
    I --> J[Zod validation]
    J -->|Invalid| K[Return field errors]
    J -->|Valid| L[INSERT retailers_survey\nstatus=pending]
    L --> M[Redirect to /retailer-survey/complete]
    M --> N([Retailer sees confirmation page])
```

---

*Document End*
