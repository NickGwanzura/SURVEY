import "server-only";

import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromDomain = process.env.RESEND_DOMAIN ?? "racregistryzw.org";
const fromAddress = `NOU \u00b7 HEVACRAZ RAC Registry <noreply@${fromDomain}>`;

function getResend(): Resend {
  if (!resendApiKey) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to your environment variables.",
    );
  }
  return new Resend(resendApiKey);
}

/* ------------------------------------------------------------------ */
/*  Brand colours (matching the app palette)                          */
/* ------------------------------------------------------------------ */
const BRAND_600 = "#0d4f3c";
const BRAND_700 = "#064e3b";
const BRAND_50 = "#ecfdf5";
const BRAND_100 = "#d1fae5";
const BRAND_500 = "#10b981";
const WHITE = "#ffffff";
const SLATE_600 = "#475569";
const SLATE_700 = "#334155";
const SLATE_900 = "#0f172a";

/* ------------------------------------------------------------------ */
/*  Shared email shell (wrapper around the content block)             */
/* ------------------------------------------------------------------ */
function emailShell(
  title: string,
  bodyHtml: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${SLATE_700};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SLATE_700};">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${WHITE};border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.12);">

          <!-- Header bar -->
          <tr>
            <td style="background:${BRAND_600};padding:32px 32px 24px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background:${BRAND_500};text-align:center;line-height:48px;margin-bottom:12px;">
                      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" style="vertical-align:middle;">
                        <path d="M8 1.5L1.5 5v6L8 14.5l6.5-3.5V5L8 1.5z" stroke="${WHITE}" stroke-width="1.5" stroke-linejoin="round"/>
                        <path d="M8 1.5v7M1.5 5l6.5 3.5 6.5-3.5" stroke="${WHITE}" stroke-width="1.5" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${BRAND_100};">NOU · HEVACRAZ</p>
                    <p style="margin:4px 0 0;font-size:18px;font-weight:600;color:${WHITE};">RAC Technician Registry</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body content -->
          <tr>
            <td style="padding:32px 32px 24px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #e2e8f0;background:#f8fafc;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:12px;color:${SLATE_600};line-height:1.5;">
                    <p style="margin:0 0 4px;"><strong>National Ozone Unit (NOU)</strong> &amp; <strong>HEVACRAZ</strong></p>
                    <p style="margin:0;">This is an automated message from the RAC Technician Registry. Please do not reply directly to this email.</p>
                    <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;">&copy; ${new Date().getFullYear()} NOU &middot; HEVACRAZ &middot; Zimbabwe</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/*  Email 1 — Survey Completed Successfully                           */
/* ------------------------------------------------------------------ */
export function surveyCompletedEmailHtml(
  firstName: string,
  referenceNumber: string,
): string {
  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding-bottom:20px;">
          <div style="width:56px;height:56px;border-radius:50%;background:${BRAND_50};text-align:center;line-height:56px;display:inline-block;">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="vertical-align:middle;">
              <path d="M7 14.5l4 4 10-10" stroke="${BRAND_500}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:8px;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:${SLATE_900};">Registration Submitted</h1>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:24px;">
          <p style="margin:0;font-size:15px;color:${SLATE_600};line-height:1.6;">
            Thank you, <strong>${firstName}</strong>. Your registration for the RAC Technician Registry has been received successfully.
          </p>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-block;border-radius:12px;border:1px solid ${BRAND_100};background:${BRAND_50};">
            <tr>
              <td style="padding:14px 24px;text-align:center;">
                <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND_700};">Reference Number</p>
                <p style="margin:4px 0 0;font-family:'SF Mono','Fira Code',monospace;font-size:20px;font-weight:600;color:${BRAND_600};letter-spacing:1px;">${referenceNumber}</p>
                <p style="margin:4px 0 0;font-size:11px;color:${BRAND_700};opacity:0.8;">Keep this for your records.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:8px;">
          <h2 style="margin:0 0 12px;font-size:15px;font-weight:600;color:${SLATE_900};">What happens next?</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding-bottom:8px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="24" valign="top" style="font-size:13px;font-weight:700;color:${BRAND_500};">1.</td>
                  <td style="font-size:14px;color:${SLATE_600};line-height:1.5;">NOU and HEVACRAZ will review your submission.</td>
                </tr>
              </table>
            </td></tr>
            <tr><td style="padding-bottom:8px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="24" valign="top" style="font-size:13px;font-weight:700;color:${BRAND_500};">2.</td>
                  <td style="font-size:14px;color:${SLATE_600};line-height:1.5;">You may be contacted for verification or training programme invitations.</td>
                </tr>
              </table>
            </td></tr>
            <tr><td>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="24" valign="top" style="font-size:13px;font-weight:700;color:${BRAND_500};">3.</td>
                  <td style="font-size:14px;color:${SLATE_600};line-height:1.5;">Once verified, your details will appear in the public registry (if you gave consent).</td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  `;
  return emailShell("Registration Submitted — RAC Technician Registry", body);
}

/* ------------------------------------------------------------------ */
/*  Email 2 — Successfully Verified                                    */
/* ------------------------------------------------------------------ */
export function surveyVerifiedEmailHtml(
  firstName: string,
  surname: string,
  publicRegistry: boolean,
): string {
  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding-bottom:20px;">
          <div style="width:56px;height:56px;border-radius:50%;background:${BRAND_50};text-align:center;line-height:56px;display:inline-block;">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="vertical-align:middle;">
              <path d="M7 14.5l4 4 10-10" stroke="${BRAND_500}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:8px;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:${SLATE_900};">Registration Verified</h1>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:24px;">
          <p style="margin:0;font-size:15px;color:${SLATE_600};line-height:1.6;">
            Dear <strong>${firstName} ${surname}</strong>, your registration in the <strong>RAC Technician Registry</strong> has been <strong style="color:${BRAND_700};">verified and approved</strong>.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;border:1px solid ${BRAND_100};background:${BRAND_50};">
            <tr>
              <td style="padding:16px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="28" valign="top">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="vertical-align:middle;">
                        <path d="M10 2.5l7 5v5l-7 5-7-5v-5l7-5z" stroke="${BRAND_600}" stroke-width="1.5" stroke-linejoin="round"/>
                        <path d="M10 2.5v7.5" stroke="${BRAND_600}" stroke-width="1.5" stroke-linejoin="round"/>
                        <path d="M3.5 7.5l6.5 3.5 6.5-3.5" stroke="${BRAND_600}" stroke-width="1.5" stroke-linejoin="round"/>
                      </svg>
                    </td>
                    <td style="font-size:14px;color:${BRAND_700};line-height:1.5;">
                      ${publicRegistry
                        ? '<strong style="color:' + BRAND_600 + ';">You are now visible</strong> in the public technician directory on the RAC Registry website.'
                        : 'Your details are <strong style="color:' + BRAND_600 + ';">not listed publicly</strong> as you did not opt in to the public registry. This can be updated later.'
                      }
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:8px;">
          <p style="margin:0;font-size:14px;color:${SLATE_600};line-height:1.6;">
            Being a verified technician demonstrates your commitment to professionalism and quality service within Zimbabwe's refrigeration and air-conditioning industry.
          </p>
        </td>
      </tr>
    </table>
  `;
  return emailShell("Registration Verified — RAC Technician Registry", body);
}

/* ------------------------------------------------------------------ */
/*  Email 3 — Flagged (further details required)                      */
/* ------------------------------------------------------------------ */
export function surveyFlaggedEmailHtml(
  firstName: string,
  surname: string,
  reason?: string,
): string {
  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding-bottom:20px;">
          <div style="width:56px;height:56px;border-radius:50%;background:#fef2f2;text-align:center;line-height:56px;display:inline-block;">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="vertical-align:middle;">
              <circle cx="14" cy="14" r="12" stroke="#dc2626" stroke-width="2"/>
              <path d="M14 9v6M14 18v.5" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:8px;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:${SLATE_900};">Action Required — Additional Information Needed</h1>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:24px;">
          <p style="margin:0;font-size:15px;color:${SLATE_600};line-height:1.6;">
            Dear <strong>${firstName} ${surname}</strong>, your registration submission requires further review. Some details need clarification before we can complete the verification process.
          </p>
        </td>
      </tr>
      ${reason ? `
      <tr>
        <td style="padding-bottom:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;border:1px solid #fecaca;background:#fef2f2;">
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#dc2626;">Reason</p>
                <p style="margin:0;font-size:14px;color:#991b1b;line-height:1.5;">${reason}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      ` : ""}
      <tr>
        <td style="padding-bottom:8px;">
          <p style="margin:0;font-size:14px;color:${SLATE_600};line-height:1.6;">
            A member of the <strong>NOU</strong> or <strong>HEVACRAZ</strong> team will contact you to follow up on the above. Please ensure your contact details are correct and be prepared to provide supporting documentation if requested.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-top:8px;">
          <p style="margin:0;font-size:14px;color:${SLATE_600};line-height:1.6;">
            If you have any questions, please reach out to the NOU or HEVACRAZ office directly.
          </p>
        </td>
      </tr>
    </table>
  `;
  return emailShell("Action Required — RAC Technician Registry", body);
}

/* ------------------------------------------------------------------ */
/*  Mass / Broadcast Email                                             */
/* ------------------------------------------------------------------ */
export function broadcastEmailHtml(
  subject: string,
  messageHtml: string,
): string {
  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          ${messageHtml}
        </td>
      </tr>
    </table>
  `;
  return emailShell(subject, body);
}

/* ------------------------------------------------------------------ */
/*  Sending helpers                                                    */
/* ------------------------------------------------------------------ */

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

async function sendEmail(
  to: string[],
  subject: string,
  html: string,
): Promise<SendEmailResult> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id ?? "unknown" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[email] Failed to send email:", message);
    return { ok: false, error: message };
  }
}

export async function sendSurveyCompletedEmail(
  to: string,
  firstName: string,
  referenceNumber: string,
): Promise<SendEmailResult> {
  return sendEmail(
    [to],
    "Registration Submitted — RAC Technician Registry",
    surveyCompletedEmailHtml(firstName, referenceNumber),
  );
}

export async function sendVerifiedEmail(
  to: string,
  firstName: string,
  surname: string,
  publicRegistry: boolean,
): Promise<SendEmailResult> {
  return sendEmail(
    [to],
    "Registration Verified — RAC Technician Registry",
    surveyVerifiedEmailHtml(firstName, surname, publicRegistry),
  );
}

export async function sendFlaggedEmail(
  to: string,
  firstName: string,
  surname: string,
  reason?: string,
): Promise<SendEmailResult> {
  return sendEmail(
    [to],
    "Action Required — RAC Technician Registry",
    surveyFlaggedEmailHtml(firstName, surname, reason),
  );
}

/* ------------------------------------------------------------------ */
/*  Email 4 — Admin Invitation                                         */
/* ------------------------------------------------------------------ */
export function adminInviteEmailHtml(
  inviterName: string,
  inviteUrl: string,
): string {
  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding-bottom:20px;">
          <div style="width:56px;height:56px;border-radius:50%;background:${BRAND_50};text-align:center;line-height:56px;display:inline-block;">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="vertical-align:middle;">
              <path d="M14 2L3 8v12l11 6 11-6V8L14 2z" stroke="${BRAND_500}" stroke-width="2" stroke-linejoin="round"/>
              <path d="M14 2v14.5M3 8l11 6.5L25 8" stroke="${BRAND_500}" stroke-width="2" stroke-linejoin="round"/>
            </svg>
          </div>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:8px;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:${SLATE_900};">Admin Portal Invitation</h1>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:24px;">
          <p style="margin:0;font-size:15px;color:${SLATE_600};line-height:1.6;">
            You have been invited by <strong>${inviterName}</strong> to access the <strong>RAC Technician Registry Admin Portal</strong>.
          </p>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius:8px;background:${BRAND_600};padding:14px 32px;">
                <a href="${inviteUrl}" style="color:${WHITE};font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">
                  Set up your account
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:8px;">
          <p style="margin:0;font-size:14px;color:${SLATE_600};line-height:1.6;">
            This invitation link expires in <strong>72 hours</strong>. If you did not expect this invitation, please disregard this email.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:8px;">
          <p style="margin:0;font-size:14px;color:${SLATE_600};line-height:1.6;">
            Once set up, you will be able to review submissions, export data, manage the technician registry, and more.
          </p>
        </td>
      </tr>
    </table>
  `;
  return emailShell("Admin Portal Invitation — RAC Technician Registry", body);
}

export async function sendAdminInviteEmail(
  to: string,
  inviterName: string,
  inviteUrl: string,
): Promise<SendEmailResult> {
  return sendEmail(
    [to],
    "Admin Portal Invitation — RAC Technician Registry",
    adminInviteEmailHtml(inviterName, inviteUrl),
  );
}

/* ------------------------------------------------------------------ */
/*  Email 5 — Password Reset                                            */
/* ------------------------------------------------------------------ */
export function passwordResetEmailHtml(
  name: string,
  resetUrl: string,
): string {
  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding-bottom:20px;">
          <div style="width:56px;height:56px;border-radius:50%;background:${BRAND_50};text-align:center;line-height:56px;display:inline-block;">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="vertical-align:middle;">
              <path d="M14 2L3 8v12l11 6 11-6V8L14 2z" stroke="${BRAND_500}" stroke-width="2" stroke-linejoin="round"/>
              <path d="M14 2v14.5M3 8l11 6.5L25 8" stroke="${BRAND_500}" stroke-width="2" stroke-linejoin="round"/>
              <circle cx="14" cy="16" r="2" fill="${BRAND_500}"/>
            </svg>
          </div>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:8px;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:${SLATE_900};">Password Reset</h1>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:24px;">
          <p style="margin:0;font-size:15px;color:${SLATE_600};line-height:1.6;">
            Hello <strong>${name}</strong>, a password reset was requested for your RAC Technician Registry admin account.
          </p>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius:8px;background:${BRAND_600};padding:14px 32px;">
                <a href="${resetUrl}" style="color:${WHITE};font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">
                  Reset your password
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:24px;">
          <p style="margin:0;font-size:14px;color:${SLATE_600};line-height:1.6;">
            This link expires in <strong>2 hours</strong>. If you did not request a password reset, please ignore this email — no changes have been made to your account.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:8px;">
          <p style="margin:0;font-size:14px;color:${SLATE_600};line-height:1.6;">
            For security, all existing sessions will be signed out after a successful password change.
          </p>
        </td>
      </tr>
    </table>
  `;
  return emailShell("Password Reset — RAC Technician Registry Admin", body);
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string,
): Promise<SendEmailResult> {
  return sendEmail(
    [to],
    "Password Reset — RAC Technician Registry Admin",
    passwordResetEmailHtml(name, resetUrl),
  );
}

/* ------------------------------------------------------------------ */
/*  Mass / Broadcast Email                                             */
/* ------------------------------------------------------------------ */
export async function sendBroadcastEmail(
  recipients: string[],
  subject: string,
  messageHtml: string,
): Promise<{ success: number; failed: number; errors: string[] }> {
  // Resend supports up to 50 recipients per call — batch in chunks
  const CHUNK_SIZE = 50;
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
    const chunk = recipients.slice(i, i + CHUNK_SIZE);
    const result = await sendEmail(
      chunk,
      subject,
      broadcastEmailHtml(subject, messageHtml),
    );
    if (result.ok) {
      success += chunk.length;
    } else {
      failed += chunk.length;
      errors.push(result.error);
    }
  }

  return { success, failed, errors };
}
