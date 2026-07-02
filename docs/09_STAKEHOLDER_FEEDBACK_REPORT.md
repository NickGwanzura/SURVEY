# STAKEHOLDER FEEDBACK REPORT
## National RAC Technician Registry — ZW RAC Survey Platform

**Document Reference:** NOU-HEVACRAZ-SFR-2025-001
**Version:** 1.0
**Date:** 2025-06-01
**Status:** Draft — Structured Template for Completion

> **Note:** This document provides the structured framework for stakeholder feedback collection. Formal interview findings should be inserted into the sections below as they are collected. A minimum of 3 NOU/HEVACRAZ staff interviews, 2 HEVACRAZ representatives, and 5 technician user interviews is recommended.

---

## 1. OVERVIEW

### 1.1 Purpose

This Stakeholder Feedback Report documents the perspectives, observations, and recommendations of key stakeholders regarding the National RAC Technician Registry platform. It captures feedback from:
- NOU staff (system administrators, policy officers)
- HEVACRAZ representatives (certification officers, industry liaisons)
- RAC technician end users
- Other government and UNEP observers

### 1.2 Feedback Collection Methods

| Method | Target Group | Status |
|---|---|---|
| Structured interview (1:1) | NOU staff | To be conducted |
| Structured interview (1:1) | HEVACRAZ representatives | To be conducted |
| Focus group (5–8 participants) | RAC technicians | To be conducted |
| Online questionnaire (SurveyMonkey/Google Forms) | Broad technician sample | To be conducted |
| Review of system usage metrics | Admin portal analytics | Pending production data |

---

## 2. STAKEHOLDER GROUPS

| Group | Stakeholders | Role in Registry |
|---|---|---|
| **Primary — NOU** | Director, NOU; ODS Officers; Data Managers | System owners; policy use |
| **Primary — HEVACRAZ** | President, HEVACRAZ; Certification Officer; Training Coordinator | Certification verification; outreach |
| **Secondary — Technicians** | Registered technicians (sample from all 10 provinces) | Primary end users of the survey |
| **Secondary — Retailers** | Registered retailers/distributors | Secondary survey users |
| **Tertiary — Government** | ZIMRA, Standards Association of Zimbabwe | Regulatory oversight |
| **Tertiary — UNEP** | UNEP OzonAction Programme Officer | Funder; reporting recipient |

---

## 3. NOU STAFF FEEDBACK

### Interview Guide — NOU Staff

1. How does the registry platform support your daily operations at NOU?
2. Are the analytics and reporting tools meeting your policy analysis needs?
3. What data fields or analysis capabilities are missing?
4. How confident are you in the quality of submissions (verification workflow)?
5. How has the system changed your ability to report to UNEP?
6. What would you change about the admin portal?
7. Are there any data protection or legal concerns?
8. Rate the system's ease of use (1–10) and explain.

### Feedback Record

> *[To be completed after interviews are conducted]*

| Feedback Item | Source | Sentiment | Priority |
|---|---|---|---|
| | | | |

### Summary of NOU Feedback

> *[To be completed after interviews are conducted]*

---

## 4. HEVACRAZ REPRESENTATIVE FEEDBACK

### Interview Guide — HEVACRAZ

1. Does the registry accurately reflect HEVACRAZ's membership and certification data?
2. How are you using the technician directory in your day-to-day work?
3. Are the certification fields (type, number, HEVACRAZ membership number) complete and useful?
4. How well does the system support your outreach to unregistered technicians?
5. What is your assessment of technician uptake and engagement with the survey?
6. Are there any industry concerns about how data is being used?
7. What additional features would HEVACRAZ prioritise?
8. Rate the registry's value to the industry (1–10).

### Feedback Record

> *[To be completed after interviews are conducted]*

---

## 5. TECHNICIAN USER FEEDBACK

### Survey Questionnaire (End Users)

The following questions were/will be asked of registered technicians:

| # | Question | Response Type |
|---|---|---|
| 1 | How did you first hear about the registry? | Multiple choice |
| 2 | How long did it take you to complete the survey? | Multiple choice (< 5 min / 5-10 / 10-20 / > 20) |
| 3 | How easy was the survey to understand? | Likert 1–5 |
| 4 | Were there any questions you found confusing or difficult to answer? | Open text |
| 5 | Did you use the offline (PWA) feature? | Yes / No |
| 6 | If yes, did the offline submission sync successfully? | Yes / No / Partially |
| 7 | Did you experience any technical problems? | Yes / No + open text |
| 8 | Was the privacy notice clear? | Likert 1–5 |
| 9 | Do you feel comfortable with how your data will be used? | Likert 1–5 |
| 10 | What would you improve about the survey? | Open text |
| 11 | Would you recommend other technicians to register? | Yes / No |
| 12 | Which province are you from? | Multiple choice |
| 13 | Do you have a smartphone? | Yes / No |
| 14 | Rate your overall experience (1–10) | Rating |

### Preliminary Findings (from system data analysis)

Based on survey_events data and submission metadata, the following observations can be made:

| Metric | Observation |
|---|---|
| Submission source breakdown | Records show: `web`, `pwa_offline_sync`, `admin_entry` sources are tracked |
| Survey completion drop-off | Available via /admin/funnel analytics page |
| GPS capture rate | GPS coordinates presence in submissions (gps_latitude/longitude not null) |
| Profile photo submission rate | profile_photo_url presence in submissions |
| Province distribution | Available via dashboard province chart |

> *Full quantitative analysis to be inserted once production data is available*

---

## 6. TECHNICAL FEEDBACK (INTERNAL DEVELOPMENT TEAM)

### Observations from Codebase Review

| Area | Observation | Impact |
|---|---|---|
| Survey wizard state management | React local state — no Redux; simple but effective for form scope | Positive |
| Offline sync reliability | IndexedDB with attempt counting and error logging | Positive |
| Database query efficiency | Appropriate indexes on all filter columns; GIN on JSONB array | Positive |
| AI integration | Groq Llama 3.3 70B with structured JSON output — reliable | Positive |
| Test coverage | Minimal (< 5%) | Negative — needs expansion |
| Documentation | Limited — no project README | Negative — needs creation |
| CI/CD | No pipeline configured | Negative — risk of regression |
| Rate limiting | Absent on public APIs | Negative — security gap |

---

## 7. UNEP / INTERNATIONAL OBSERVER FEEDBACK

### Reporting Requirements Assessment

The following questions should be answered with UNEP's Programme Officer:

1. Does the data collected map to UNEP's RAC technician census reporting template?
2. Are the refrigerant knowledge and confidence fields aligned with Kigali Amendment capacity metrics?
3. Is the export format (CSV/Excel/SPSS) compatible with UNEP's data analysis workflows?
4. What privacy/data sovereignty considerations apply to UNEP data submissions?
5. Is the "low-GWP refrigerant access and confidence" data sufficient for capacity gap reporting?

> *[To be completed after UNEP consultation]*

---

## 8. KEY FEEDBACK THEMES (ANTICIPATED)

Based on system analysis and comparable project experience, the following themes are anticipated in stakeholder feedback:

| Theme | Anticipated Finding | Recommended Action |
|---|---|---|
| Survey length | 10–15 minutes may be long for technicians with low digital literacy | Add step-skip for advanced users; consider 2-phase collection |
| Language | Survey only in English; Shona/Ndebele needed for rural provinces | Prioritise i18n implementation |
| Offline reliability | Service worker may not cache reliably on older Android versions | Test on Android 8+ with Chrome 80 |
| GPS accuracy | Some technicians may not enable location services | GPS is optional; map pin picker serves as fallback |
| HEVACRAZ membership field | Number format may differ from HEVACRAZ system | Align validation with HEVACRAZ membership number format |
| Duplicate management | Same technician may re-register from different devices | Phone-based deduplication is in place; admin can also mark duplicates |
| Report format | UNEP may require specific template headings | Customise report PDF templates per UNEP specification |

---

## 9. FEEDBACK SUMMARY SCORECARD

| Dimension | Score (1–10) | Basis |
|---|---|---|
| Survey usability (technicians) | *TBC* | User interviews + completion rate |
| Admin portal usability (NOU/HEVACRAZ) | *TBC* | Admin interviews |
| Data quality and completeness | *TBC* | Sample submission review |
| Reporting usefulness | *TBC* | NOU/HEVACRAZ interviews |
| Privacy confidence | *TBC* | Technician survey |
| Overall satisfaction | *TBC* | Composite |

---

## 10. RECOMMENDATIONS FROM STAKEHOLDER PROCESS

> *[To be completed after all interviews are conducted]*

---

## APPENDIX A — INTERVIEW CONSENT FORM

I, ________________________________, consent to participate in a structured interview regarding the National RAC Technician Registry platform. I understand that:
- My responses will be used to improve the system and produce this Stakeholder Feedback Report
- I may withdraw at any time
- My name will be attributed only with my explicit consent; otherwise responses will be anonymised

Signature: ______________________ Date: ______________

---

## APPENDIX B — FOCUS GROUP QUESTIONS (TECHNICIANS)

1. Before this survey, did you know NOU and HEVACRAZ were building a national technician registry?
2. Why did you decide to register?
3. Walk us through how you completed the survey — what was easy? What was hard?
4. Did anyone help you complete the survey?
5. Do you think other technicians in your area have registered?
6. Are you concerned about sharing your GPS location?
7. Would you like to see the information you provided used for anything specific?

---

*Document End*
