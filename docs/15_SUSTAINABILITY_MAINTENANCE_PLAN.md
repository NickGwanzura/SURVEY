# SUSTAINABILITY & MAINTENANCE PLAN
## National RAC Technician Registry — ZW RAC Survey Platform

**Document Reference:** NOU-HEVACRAZ-SMP-2025-001
**Version:** 1.0
**Date:** 2025-06-01
**Status:** Finalised
**Review Date:** 2026-06-01 (Annual)

---

## 1. EXECUTIVE SUMMARY

This Sustainability and Maintenance Plan outlines the long-term operational strategy for the National RAC Technician Registry. It defines responsibilities, schedules, budgets, and procedures to ensure the platform remains secure, available, and fit-for-purpose beyond the initial development project.

---

## 2. SYSTEM OWNERSHIP

### 2.1 Institutional Ownership

| Role | Institution | Responsibility |
|---|---|---|
| **System Owner** | National Ozone Unit (NOU), Ministry of Environment | Policy authority; budget holder; data custodian |
| **Technical Custodian** | HEVACRAZ (ICT Function) | Day-to-day operations; admin portal management |
| **Technical Support** | Designated Developer / ICT Contractor | System maintenance, updates, bug fixes |

### 2.2 Designated System Administrator

The designated system administrator (Sysadmin role) has access to the full audit log and system administration panel:

- **Current:** `nicholas.gwanzura@outlook.com`
- **Succession plan:** A backup sysadmin should be designated and the codebase updated (`app/admin/sysadmin/page.tsx`) by the NOU ICT team.

---

## 3. OPERATIONAL RESPONSIBILITIES

### 3.1 NOU Responsibilities (Monthly)

| Activity | Frequency | Owner |
|---|---|---|
| Review pending submissions | Weekly | NOU Admin |
| Approve/flag/verify new registrations | Weekly | NOU Admin |
| Run monthly statistical report | Monthly | NOU Policy Officer |
| Export data for UNEP reporting | Per UNEP schedule | NOU Reporting Officer |
| Review system event log (sysadmin) | Monthly | NOU ICT Lead |
| Conduct broadcast messaging to technicians | As needed | NOU Communications |

### 3.2 HEVACRAZ Responsibilities (Monthly)

| Activity | Frequency | Owner |
|---|---|---|
| Cross-check registered certifications | Monthly | HEVACRAZ Certification Officer |
| Review duplicate submissions | Monthly | HEVACRAZ Admin |
| Update technicians on training opportunities | Quarterly | HEVACRAZ Training Coordinator |
| Provide data for provincial coverage gaps | Quarterly | HEVACRAZ Regional Officers |

### 3.3 Developer/ICT Contractor Responsibilities

| Activity | Frequency | Owner |
|---|---|---|
| Security patch updates | Monthly or on CVE alert | Developer |
| Dependency updates (minor) | Monthly | Developer |
| Dependency updates (major) | Quarterly | Developer |
| Database maintenance | Monthly | Developer |
| Performance review | Quarterly | Developer |
| Annual security audit | Annually | Developer/Third Party |

---

## 4. HOSTING AND INFRASTRUCTURE COSTS

### 4.1 Estimated Annual Costs (USD)

| Service | Tier | Estimated Annual Cost (USD) | Notes |
|---|---|---|---|
| Vercel | Pro Plan | $240/year ($20/month) | Required for team seats and higher build limits |
| Neon PostgreSQL | Launch Plan | $192/year ($16/month) | 10GB storage, branching, daily backups |
| Cloudflare R2 | Pay as you go | $12–$36/year | ~10GB storage + requests (grows with photos) |
| Resend | Free/Starter | $0–$240/year | Free: 3,000 emails/month; Starter: $20/month for 50,000 |
| Groq API | Pay per token | $12–$60/year | Estimated at ~$1–5/month for analysis volume |
| Domain `racregistryzw.org` | Annual renewal | ~$15/year | Domain registrar |
| **TOTAL ESTIMATED** | | **~$471–$783/year** | |

### 4.2 Scaling Considerations

- Costs increase proportionally with survey volume and AI analysis usage
- Cloudflare R2 storage grows by ~50KB per technician with photo
- At 10,000 registered technicians: R2 storage ~500MB additional
- Neon scales automatically; upgrade to Scale plan at ~50GB

### 4.3 Funding

The operating costs should be budgeted under:
- **NOU MLF (Multilateral Fund) project budget** for registry maintenance
- **Annual NOU/HEVACRAZ operational ICT budget**
- Ensure costs are included in project sustainability plans submitted to UNEP

---

## 5. BACKUP AND RECOVERY

### 5.1 Database Backup

| Backup Type | Frequency | Retention | Method |
|---|---|---|---|
| Automatic (Neon) | Daily | 7 days (free tier), 30 days (paid) | Neon platform |
| Manual export | Monthly | 12 months | `pg_dump` via psql |
| Pre-migration snapshot | Before each migration | Permanent | Neon branch or pg_dump |

**Recovery procedure:**
1. For point-in-time recovery within 7 days: Use Neon dashboard → Restore from backup
2. For older restores: Use monthly manual exports from archive storage
3. RTO (Recovery Time Objective): ≤ 4 hours
4. RPO (Recovery Point Objective): ≤ 24 hours

### 5.2 Application Code Backup

| Backup Type | Method | Location |
|---|---|---|
| Source code | Git repository | GitHub/GitLab (remote) |
| Deployment config | Version controlled | In repository |
| Environment secrets | Vercel dashboard export | NOU ICT secure storage |

### 5.3 Object Storage (R2)

Cloudflare R2 provides 11-nines (99.999999999%) durability with geo-redundant storage. No additional backup action required. For disaster recovery, R2 bucket replication to a secondary bucket is recommended.

---

## 6. SOFTWARE UPDATE POLICY

### 6.1 Security Updates

| Type | Response Time | Process |
|---|---|---|
| Critical CVE (CVSS ≥ 9) | Within 24 hours | Emergency deployment |
| High CVE (CVSS 7–8.9) | Within 7 days | Scheduled patch deployment |
| Medium CVE (CVSS 4–6.9) | Within 30 days | Monthly patch cycle |
| Low CVE (CVSS < 4) | Within 90 days | Quarterly update |

**How to monitor:**
```bash
npm audit                  # Check for known vulnerabilities
npm audit --audit-level high  # Show high+ severity only
```

### 6.2 Dependency Update Schedule

| Category | Frequency | Approver |
|---|---|---|
| Security patches (`npm audit fix`) | Immediately on alert | Developer |
| Minor version updates (`^` range) | Monthly | Developer |
| Major version updates | Quarterly | Developer + NOU ICT review |
| Next.js major version | Semi-annual | Developer (with testing sprint) |

**High-risk dependencies (require full regression testing on update):**
- `next` — Breaking changes in major versions are common
- `drizzle-orm` / `drizzle-kit` — Schema compatibility
- `@serwist/next` — Service worker behaviour
- `jose` — JWT algorithm changes

### 6.3 Update Procedure

1. Create feature branch: `git checkout -b chore/dependency-updates`
2. Run `npm update` or targeted package update
3. Run `npm test` — all tests must pass
4. Run `npm run typecheck` — no TypeScript errors
5. Run `npm run lint` — no lint errors
6. Deploy to preview URL and manually test critical flows
7. Merge to `main` and deploy to production

---

## 7. MONITORING AND ALERTING

### 7.1 Current Monitoring State

As of launch, in-application monitoring is provided by the Sysadmin Dashboard. External monitoring is recommended:

| Tool | Purpose | Setup Priority |
|---|---|---|
| UptimeRobot (free) | Public URL uptime every 5 minutes | High |
| Sentry | Error tracking and performance | High |
| Vercel Analytics | Page performance | Medium |
| Resend activity log | Email delivery monitoring | Medium |

### 7.2 Recommended Alerting Thresholds

| Alert | Threshold | Action |
|---|---|---|
| Site unavailable | 2 consecutive checks fail | Page sysadmin immediately |
| Error rate spike | > 5 errors/minute | Investigate + enable maintenance mode if needed |
| Email delivery failure | > 10% bounce rate | Check Resend logs; verify domain DNS |
| Database response time | > 5 seconds | Check Neon dashboard; consider query optimisation |
| Storage usage | > 80% R2 capacity | Upgrade plan |

### 7.3 Sysadmin Dashboard

The built-in Sysadmin Dashboard at `/admin/sysadmin` provides:
- Real-time system event log
- Admin action timeline
- Event type distribution

This should be reviewed **monthly** by the NOU ICT Lead.

---

## 8. INCIDENT MANAGEMENT

### 8.1 Incident Severity Levels

| Level | Description | Examples | Response Time |
|---|---|---|---|
| P1 — Critical | System unavailable or data loss | Database unreachable, site down | < 2 hours |
| P2 — High | Core feature broken | Survey cannot be submitted, admin cannot login | < 8 hours |
| P3 — Medium | Non-critical feature broken | Export fails, AI analysis unavailable | < 48 hours |
| P4 — Low | Minor issue or cosmetic | Layout issue, slow page | Next sprint |

### 8.2 Incident Response Procedure

1. **Detect** — Via monitoring alert or user report
2. **Assess** — Determine severity level
3. **Contain** — Enable maintenance mode if P1/P2
4. **Communicate** — Notify NOU management if P1/P2
5. **Resolve** — Develop and deploy fix
6. **Review** — Post-incident analysis for P1/P2
7. **Document** — Update incident log

### 8.3 Incident Contact Chain

| Step | Contact | Channel |
|---|---|---|
| 1st | HEVACRAZ ICT Lead | WhatsApp/Phone |
| 2nd | NOU ICT Lead | Email/Phone |
| 3rd | Development Contractor | Email/Phone |
| Escalation | NOU Director | Email |

---

## 9. DATA MANAGEMENT

### 9.1 Data Retention Policy

| Data Type | Retention Period | Basis |
|---|---|---|
| Technician survey submissions | Indefinite (active registry) | Operational need |
| Retailer survey submissions | Indefinite (active registry) | Operational need |
| Audit log | 5 years minimum | Compliance |
| System events | 2 years | Operational |
| Survey events (funnel data) | 1 year | Analytics |
| Admin sessions | 30 days after expiry | Security |
| Password reset tokens | 30 days after use/expiry | Security |
| Export log | 5 years | Compliance |

### 9.2 Data Quality Reviews

| Activity | Frequency | Owner |
|---|---|---|
| Duplicate submission review | Monthly | NOU Admin |
| Stale pending submission review | Monthly | NOU Admin |
| Phone number format validation audit | Quarterly | Developer |
| GPS coordinate quality review | Quarterly | NOU GIS Officer |
| HEVACRAZ membership number cross-check | Annually | HEVACRAZ |

### 9.3 Deletion Requests

When a technician requests data deletion:

1. Locate record by phone or name in admin portal
2. Export their data for confirmation
3. Delete record from `technicians_survey` (cascade deletes `audit_log` entries)
4. Document the deletion in `system_events`
5. Confirm deletion to the requesting individual
6. Complete within 30 days of request (Zimbabwe Data Protection Act)

---

## 10. CAPACITY PLANNING

### 10.1 Growth Projections

| Year | Expected Registrations | Database Size (est.) | Action |
|---|---|---|---|
| 2025 | 0–2,000 | < 1GB | No action needed |
| 2026 | 2,000–5,000 | ~1–2GB | Review Neon plan |
| 2027 | 5,000–10,000 | ~2–3GB | Upgrade Neon plan if needed |
| 2028 | 10,000+ | > 3GB | Consider Neon Scale plan |

### 10.2 Performance Review Schedule

| Activity | Frequency |
|---|---|
| Database query performance review | Quarterly |
| Index usage analysis | Annually |
| CDN and static asset optimisation | Annually |
| Lighthouse performance audit | Quarterly |

---

## 11. SYSTEM EVOLUTION

### 11.1 Feature Backlog (Planned Enhancements)

| Feature | Priority | Status |
|---|---|---|
| Shona language support | High | Planned — Year 1 |
| Ndebele language support | High | Planned — Year 1 |
| Rate limiting on public APIs | High | Planned — Month 1 |
| CI/CD pipeline | High | Planned — Month 1 |
| External error tracking (Sentry) | High | Planned — Month 1 |
| Accessibility (WCAG 2.1 AA) remediation | Medium | Planned — Quarter 2 |
| Public-facing technician directory page | Medium | Planned — Year 1 |
| Technician profile edit (self-service) | Medium | Planned — Year 1 |
| HEVACRAZ system API integration | Low | Planned — Year 2 |
| ZIMRA system integration | Low | Planned — Year 2 |
| Mobile native app (Android) | Low | Planned — Year 2 |

### 11.2 Annual Review Process

On the first anniversary of launch (and annually thereafter):

1. **Technical review** — Assess performance, security, dependencies
2. **Data review** — Verify data quality, completeness, and coverage
3. **User feedback** — Collect updated stakeholder feedback
4. **Feature review** — Prioritise enhancements for the next year
5. **Cost review** — Review hosting and service costs vs. budget
6. **Documentation update** — Update this plan and all manuals
7. **Security audit** — Commission third-party penetration test
8. **UNEP reporting** — Update UNEP with system usage statistics

---

## 12. TRANSITION AND HANDOVER PLAN

### 12.1 Handover to NOU/HEVACRAZ

The following activities must be completed as part of the formal handover:

| Activity | Deadline | Status |
|---|---|---|
| Source code transferred to NOU GitHub | At handover | |
| Vercel account access transferred to NOU | At handover | |
| Neon database access transferred to NOU | At handover | |
| Cloudflare R2 access transferred to NOU | At handover | |
| Resend account access transferred to NOU | At handover | |
| Groq API key registered under NOU account | At handover | |
| Domain registrar access transferred | At handover | |
| All documentation delivered and reviewed | At handover | |
| 2 NOU/HEVACRAZ staff trained as admins | Before handover | |
| 1 NOU/HEVACRAZ staff trained as sysadmin | Before handover | |
| 6-month post-handover support agreement signed | Before handover | |

### 12.2 Post-Handover Support

The development team commits to provide:
- **6 months** of bug fix support after formal handover
- **3 months** of feature development support (with change request process)
- **12 months** of on-call emergency support (critical incidents only)

After 12 months, NOU/HEVACRAZ should either:
1. Hire an in-house developer to maintain the system, OR
2. Contract a local ICT company under a maintenance agreement

---

## APPENDIX A — MAINTENANCE CALENDAR

| Month | Activity |
|---|---|
| January | Dependency updates; security audit; UNEP Q4 report export |
| February | Monthly report; duplicate review |
| March | Monthly report; Q1 performance review |
| April | Monthly report; duplicate review |
| May | Monthly report; mid-year stakeholder review |
| June | Monthly report; semi-annual security review |
| July | Monthly report; duplicate review |
| August | Monthly report; Q3 performance review |
| September | Monthly report; duplicate review |
| October | Monthly report; pre-annual review preparations |
| November | Monthly report; annual stakeholder feedback collection |
| December | **Annual review**: technical, data, cost, feature planning; update all documentation |

---

*Document End*

**Document Approval:**

| Name | Role | Signature | Date |
|---|---|---|---|
| | NOU Director | | |
| | HEVACRAZ President | | |
| | Technical Lead / Developer | | |

**Next Review Date:** 2026-06-01
