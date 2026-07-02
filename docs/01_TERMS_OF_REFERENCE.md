# TERMS OF REFERENCE
## National RAC Technician Registry Software Platform

**Document Reference:** NOU-HEVACRAZ-TOR-2025-001
**Version:** 1.0
**Date:** 2025-05-01 (reconstructed)
**Status:** Finalised — Retrospective Documentation
**Prepared by:** National Ozone Unit (NOU) / HEVACRAZ
**Classification:** Official Government ICT Procurement Document

---

## 1. BACKGROUND AND CONTEXT

### 1.1 The Montreal Protocol and Zimbabwe's Obligations

Zimbabwe is a signatory to the **Montreal Protocol on Substances that Deplete the Ozone Layer** and its **Kigali Amendment**, which requires the phasedown of hydrofluorocarbons (HFCs) — powerful greenhouse gases widely used in refrigeration and air-conditioning (RAC) equipment. Compliance with these international obligations requires Zimbabwe to:

1. Map and document the national RAC workforce
2. Identify skills and training gaps among practicing technicians
3. Develop targeted training programmes aligned with low-GWP refrigerant technologies
4. Track progress toward certification and compliance goals
5. Report workforce data to UNEP and the Ozone Secretariat

### 1.2 The National Ozone Unit (NOU)

The **National Ozone Unit (NOU)** operates under the Government of Zimbabwe and is the designated competent authority for ozone-depleting substance (ODS) management and HFC phasedown activities. The NOU coordinates with UNEP's OzonAction programme and manages multi-lateral fund (MLF) projects.

### 1.3 HEVACRAZ

**HEVACRAZ** (Heating, Ventilation, Air-Conditioning and Refrigeration Association of Zimbabwe) is the national industry association representing RAC technicians, contractors, and equipment suppliers. HEVACRAZ administers the national technician certification programme and membership register.

### 1.4 The Problem Statement

Prior to this project, Zimbabwe had no centralised, digital registry of practicing RAC technicians. Workforce data was fragmented across:
- Paper-based HEVACRAZ membership records
- Informal employer records
- Anecdotal industry knowledge

This made it impossible to:
- Determine the total number of active technicians nationally
- Assess the geographic distribution of the workforce
- Identify which technicians held formal certifications
- Quantify skills gaps, particularly regarding low-GWP refrigerant handling
- Design evidence-based training interventions
- Produce credible compliance reports for UNEP

---

## 2. PROJECT OBJECTIVE

Design, develop, and deploy a **National RAC Technician Registry Software Platform** that enables:

1. **Self-registration** of RAC technicians via a structured digital survey
2. **Retailer mapping** — registration of RAC equipment retailers and distributors
3. **Centralised data management** — administrative portal for NOU and HEVACRAZ staff
4. **Analytics and reporting** — evidence-based workforce intelligence for policy and training design
5. **Public directory** — consented publication of verified technician records
6. **UNEP/Montreal Protocol reporting** — exportable data in standard formats

---

## 3. SCOPE OF WORK

### 3.1 In Scope

The following deliverables are within scope:

| # | Deliverable |
|---|---|
| 1 | Technician self-registration survey (web + PWA/offline) |
| 2 | Retailer/distributor registration survey |
| 3 | Administrator portal with dashboard, response management, and user management |
| 4 | Data analytics module (insights, maps, charts, comparisons) |
| 5 | Multi-format data export (CSV, Excel, PDF, GeoJSON, SPSS) |
| 6 | AI-powered analytics and report generation |
| 7 | Email notification system (confirmation, verification, broadcast) |
| 8 | Public registry preview |
| 9 | Audit trail and system event logging |
| 10 | Progressive Web App (PWA) with offline capability |
| 11 | Database with full schema documentation |
| 12 | Deployment on cloud infrastructure |
| 13 | All documentation deliverables listed in Section 4 |

### 3.2 Out of Scope

- Mobile native applications (iOS/Android)
- Integration with existing government HR systems
- Payment processing
- SMS notification system
- Multi-country deployment (Zimbabwe only)
- Physical training programme delivery

### 3.3 Geographic Scope

All **10 provinces of Zimbabwe:**

1. Bulawayo
2. Harare
3. Manicaland
4. Mashonaland Central
5. Mashonaland East
6. Mashonaland West
7. Masvingo
8. Matabeleland North
9. Matabeleland South
10. Midlands

---

## 4. DELIVERABLES

The following deliverables are required under this ToR:

| # | Deliverable | Description |
|---|---|---|
| 1 | Registry Software Developer ToR | This document |
| 2 | Functional Requirements Specification | What the system does |
| 3 | System Requirements Specification | How the system must perform |
| 4 | Database Schema Documentation | Complete database design |
| 5 | System Architecture Documentation | Technical architecture diagrams and narrative |
| 6 | UI Mockups | Screen designs and user interface documentation |
| 7 | Workflow & Process Diagrams | All business process flows |
| 8 | Registry Software Platform | The working software system |
| 9 | Testing & Quality Assurance Report | Test results and QA evidence |
| 10 | Stakeholder Feedback Report | Documented feedback from NOU, HEVACRAZ, and technicians |
| 11 | Administrator Manual | Full guide for NOU/HEVACRAZ staff |
| 12 | End User Manual | Guide for RAC technicians completing registration |
| 13 | Knowledge Transfer Package | Technical handover documentation for maintainers |
| 14 | System Deployment & Launch Report | Deployment process and launch evidence |
| 15 | Evidence of Final System Launch | Proof of live system operation |
| 16 | Sustainability & Maintenance Plan | Long-term operational plan |

---

## 5. TECHNICAL REQUIREMENTS

### 5.1 Platform Requirements

- **Web-based:** Must be accessible from any modern browser on desktop, tablet, and mobile
- **Offline capability:** Must function without internet connection (PWA/service worker)
- **Multilingual:** Must support English, Shona, and Ndebele
- **Responsive:** Must work on low-end Android smartphones (primary device type for fieldwork)
- **Secure:** Must comply with best-practice web security standards

### 5.2 Data Requirements

The technician survey must collect, at minimum:

**Section 1 — Background:**
Full name, gender, age group, education level, years of experience, main work focus (HVAC-R sub-sector), province, city/town, suburb, GPS coordinates, phone number, email

**Section 2 — Skills and Training:**
Formal training status, training institution, year of qualification, certification status (yes/no/studying), certifications held, HEVACRAZ membership number, confidence ratings for traditional and low-GWP refrigerants, access to tools/parts/refrigerants (Likert 1–5)

**Section 3 — Tools and Resources:**
Obstacle ratings (import costs, forex shortages, unreliable suppliers, counterfeit products) — Likert 1–5

**Section 4 — Work Challenges:**
Primary daily challenge, load shedding frequency, refrigerant recovery equipment use, PPE access, EHS compliance barriers

**Section 5 — Energy Efficiency:**
Energy-efficient installation practices, barriers to adoption

**Section 6 — Consent:**
Consent to contact, consent to public registry listing, preferred language, optional profile photo, data protection consent

### 5.3 Infrastructure Requirements

- **Cloud hosting** on a reliable PaaS (Vercel, AWS, Azure, or equivalent)
- **PostgreSQL database** on a managed service
- **Object storage** for profile photos (Cloudflare R2 or S3-compatible)
- **Transactional email** provider
- **Custom domain** under `racregistryzw.org`
- **SSL/TLS** encryption on all endpoints

---

## 6. IMPLEMENTATION APPROACH

### 6.1 Development Methodology

Agile iterative development with fortnightly review cycles. NOU and HEVACRAZ to review each major milestone before proceeding.

### 6.2 Key Milestones

| Milestone | Description |
|---|---|
| M1 | Database schema approved and migrations applied |
| M2 | Technician survey form complete and testable |
| M3 | Admin portal (dashboard, responses, export) operational |
| M4 | Analytics and reporting modules complete |
| M5 | PWA offline mode functional |
| M6 | Retailer survey complete |
| M7 | AI analysis integration complete |
| M8 | User acceptance testing complete |
| M9 | Production deployment and launch |
| M10 | All documentation deliverables submitted |

---

## 7. ROLES AND RESPONSIBILITIES

| Party | Responsibilities |
|---|---|
| **National Ozone Unit (NOU)** | Project sponsor; final approval authority; provides policy requirements; coordinates with UNEP |
| **HEVACRAZ** | Subject matter expert; provides certification data; validates survey questions; manages technician outreach |
| **Software Developer/Contractor** | Designs, builds, tests, and deploys the platform; produces all documentation deliverables |
| **UNEP OzonAction** | Provides technical guidance and funding oversight |

---

## 8. QUALITY STANDARDS

- All code must be version-controlled in a Git repository
- TypeScript strict mode throughout
- Zod schema validation on all user inputs
- Security headers on all HTTP responses (HSTS, CSP, X-Frame-Options)
- All admin actions must be logged to an immutable audit trail
- Password storage must use bcrypt with minimum 12 salt rounds
- Session tokens must be short-lived JWTs (≤8 hours) stored in HTTP-only cookies

---

## 9. ACCEPTANCE CRITERIA

The system will be accepted when:

1. All 16 deliverables have been submitted and approved
2. The survey can be completed end-to-end by a technician with no technical assistance
3. Survey works offline on a smartphone and syncs on reconnection
4. Admin portal displays correct statistics matching the database
5. All export formats produce valid, importable files
6. At least 100 technicians have been successfully registered in the system
7. All documentation has been reviewed and approved by NOU and HEVACRAZ

---

## 10. SUSTAINABILITY PROVISIONS

- Source code handed over to NOU/HEVACRAZ on project completion
- Full deployment documentation enabling independent hosting
- Training of at least 2 NOU/HEVACRAZ staff as system administrators
- 6-month post-launch support period
- Annual review and update plan

---

*Document End*

**Approved by:**

| Name | Role | Signature | Date |
|---|---|---|---|
| | Director, National Ozone Unit | | |
| | President, HEVACRAZ | | |
| | Software Developer/Contractor | | |
