const EMAIL_API_KEY = process.env.EMAIL_API_KEY || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "";
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Christian Life Altar Network (CLAN)";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function getSiteUrl() {
  return SITE_URL.replace(/\/+$/, "");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function buildWelcomeEmail(firstName: string, token: string): {
  html: string;
  text: string;
  subject: string;
} {
  const subject = "Welcome to CLAN Newsletter — Please Confirm Your Subscription";
  const confirmationUrl = `${getSiteUrl()}/newsletter/confirm?token=${encodeURIComponent(token)}`;

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>${escapeHtml(subject)}</title>
    <style>
      body { margin: 0; padding: 0; background-color: #f6f4ef; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; }
      table { border-collapse: collapse; }
      a { color: #0a1f44; }
      @media only screen and (max-width: 620px) {
        .container { padding: 0 16px !important; }
        .btn { display: block; width: 100%; text-align: center; padding: 16px 0 !important; font-size: 16px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#f6f4ef;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f4ef;padding:32px 16px;">
      <tr>
        <td align="center" class="container" style="padding:32px 0;">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
            <tr>
              <td style="background-color:#0a1f44;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
                <p style="font-family:Georgia,serif;font-size:26px;font-weight:bold;color:#d4af37;margin:0;letter-spacing:1px;">CLAN</p>
                <p style="font-size:11px;color:#a8b6cc;margin:6px 0 0;text-transform:uppercase;letter-spacing:2px;">Christian Life Altar Network</p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#ffffff;padding:40px 40px;border-radius:0 0 12px 12px;">
                <h1 style="font-size:22px;color:#0a1f44;margin:0 0 16px;font-family:Georgia,serif;">Welcome to CLAN!</h1>
                <p style="font-size:15px;line-height:1.7;color:#3a3f4d;margin:0 0 16px;">Hello ${escapeHtml(firstName)},</p>
                <p style="font-size:15px;line-height:1.7;color:#3a3f4d;margin:0 0 16px;">
                  Welcome to the Christian Life Altar Network (CLAN) newsletter.<br />
                  We are excited to have you join us.
                </p>
                <p style="font-size:15px;line-height:1.7;color:#3a3f4d;margin:0 0 24px;">
                  Through the CLAN newsletter, you can expect to receive updates, biblical encouragement,
                  discipleship resources, prayer opportunities, upcoming events, outreach updates, and other
                  content designed to help you grow in Christ and discover and fulfill your purpose in Him.
                </p>
                <p style="font-size:15px;line-height:1.7;color:#3a3f4d;margin:0 0 32px;">
                  Please confirm your subscription by clicking the button below.
                </p>
                <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    <td align="center" style="border-radius:8px;background-color:#d4af37;">
                      <a class="btn" href="${confirmationUrl}" target="_blank" style="display:inline-block;padding:14px 36px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#0a1f44;text-decoration:none;border-radius:8px;">
                        Confirm My Subscription
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="font-size:13px;line-height:1.6;color:#8a8f99;margin:24px 0 0;word-break:break-all;">
                  If the button above does not work, copy and paste this link into your browser:<br />
                  ${confirmationUrl}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px;text-align:center;background-color:#f6f4ef;border-radius:0 0 12px 12px;">
                <p style="font-size:13px;color:#8a8f99;margin:0;">Christian Life Altar Network (CLAN)</p>
                <p style="font-size:13px;color:#8a8f99;margin:4px 0 0;font-style:italic;">The Rebirth of True Christianity</p>
                <p style="font-size:12px;color:#b0b3ba;margin:16px 0 0;">
                  You received this email because you subscribed to the CLAN newsletter.
                  <br />
                  You may unsubscribe at any time.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const text = `
Hello ${firstName},

Welcome to the Christian Life Altar Network (CLAN) newsletter.

We are excited to have you join us.

Through the CLAN newsletter, you can expect to receive updates, biblical encouragement, discipleship resources, prayer opportunities, upcoming events, outreach updates, and other content designed to help you grow in Christ and discover and fulfill your purpose in Him.

Please confirm your subscription by clicking the link below:

${confirmationUrl}

We look forward to growing together in Christ.

Christian Life Altar Network (CLAN)
The Rebirth of True Christianity
  `;

  return { html, text, subject };
}

export async function sendWelcomeEmail(email: string, firstName: string, token: string): Promise<{ ok: boolean; error?: string }> {
  const { html, text, subject } = buildWelcomeEmail(firstName, token);

  // If no email provider is configured, log and return a controlled result
  // rather than throwing. The caller should still keep the subscriber record.
  if (!EMAIL_API_KEY && !EMAIL_FROM) {
    console.warn("[email] No EMAIL_API_KEY or EMAIL_FROM configured. Welcome email was not sent.");
    return { ok: false, error: "Email not configured. Please set EMAIL_API_KEY and EMAIL_FROM." };
  }

  const from = EMAIL_FROM_NAME ? `${EMAIL_FROM_NAME} <${EMAIL_FROM}>` : EMAIL_FROM;

  try {
    // Use a generic provider-agnostic HTTPS endpoint. The provider is selected
    // via environment variables so the app never hardcodes a vendor.
    // Supported: EMAIL_PROVIDER=resend|sendgrid|smtp (default resend)
    const provider = process.env.EMAIL_PROVIDER || "resend";

    if (provider === "resend") {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${EMAIL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject,
          html,
          text,
        }),
      });
      if (!res.ok) {
        console.error(`[email] Resend delivery failed (${res.status})`);
        return { ok: false, error: "Email delivery failed." };
      }
      return { ok: true };
    }

    if (provider === "sendgrid") {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${EMAIL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: EMAIL_FROM, name: EMAIL_FROM_NAME },
          subject,
          content: [
            { type: "text/html", value: html },
            { type: "text/plain", value: text },
          ],
        }),
      });
      if (!res.ok) {
        console.error(`[email] SendGrid delivery failed (${res.status})`);
        return { ok: false, error: "Email delivery failed." };
      }
      return { ok: true };
    }

    if (provider === "smtp") {
      return sendSmtpEmail({ to: email, subject, html, text });
    }

    return { ok: false, error: `Unsupported EMAIL_PROVIDER: ${provider}` };
  } catch (err) {
    console.error("[email] Unexpected email delivery error:", err);
    return { ok: false, error: "Email delivery failed unexpectedly." };
  }
}

/**
 * SMTP delivery via Nodemailer. Configured with environment variables:
 *  - SMTP_HOST, SMTP_PORT (default 587)
 *  - SMTP_USER, SMTP_PASS (auth credentials)
 *  - SMTP_SECURE ("true" for port 465 TLS)
 */
async function sendSmtpEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  let nodemailer;
  try {
    nodemailer = await import("nodemailer");
  } catch {
    console.error("[email] Nodemailer is not installed. Run `npm install nodemailer` to use the SMTP provider.");
    return { ok: false, error: "SMTP delivery not configured." };
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";

  if (!host) {
    console.error("[email] SMTP_HOST is not configured for the SMTP email provider.");
    return { ok: false, error: "SMTP delivery not configured." };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    await transporter.sendMail({
      from: EMAIL_FROM_NAME ? `${EMAIL_FROM_NAME} <${EMAIL_FROM}>` : EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });

    return { ok: true };
  } catch (err) {
    console.error("[email] SMTP delivery failed:", err);
    return { ok: false, error: "Email delivery failed." };
  }
}