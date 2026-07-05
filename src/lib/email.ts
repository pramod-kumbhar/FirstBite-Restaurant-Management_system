import nodemailer from 'nodemailer';

const smtpUser = process.env.SMTP_USER?.trim();
const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, '').trim();
const smtpFrom = process.env.SMTP_FROM?.trim() || 'CulinaryOS <noreply@culinaryos.com>';
const smtpHost = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
const smtpRequireTls = process.env.SMTP_REQUIRE_TLS !== 'false';

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  requireTLS: smtpRequireTls,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

function isAuthError(error: any) {
  const message = String(error?.message || error || '').toLowerCase();
  return message.includes('invalid login') || message.includes('authentication failed') || message.includes('535') || message.includes('username and password not accepted');
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!smtpUser || !smtpPass) {
    console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
    console.log(`[EMAIL MOCK] Body: ${html.substring(0, 200)}...`);
    return { success: true, mocked: true, reason: 'missing-smtp' };
  }

  try {
    const info = await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL SENT] To: ${to}, MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    const message = error?.message || String(error);
    if (isAuthError(error)) {
      console.warn(`[EMAIL MOCK] SMTP auth failed for ${smtpUser}. Continuing without blocking signup.`, message);
      return { success: true, mocked: true, reason: 'smtp-auth-failed', error: message };
    }

    console.error('Email send failed:', message);
    return { success: false, error: message };
  }
}
