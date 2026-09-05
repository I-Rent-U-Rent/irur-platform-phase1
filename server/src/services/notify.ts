import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * New-lead alerts.
 *
 * Two independent channels, each enabled only when its env vars are present:
 *   - Email  (SMTP_* )      — Gmail works with an App Password.
 *   - WhatsApp (TWILIO_*)   — via the Twilio REST API.
 *
 * Nothing here is allowed to break lead capture: every failure is caught and
 * logged, never thrown back to the request handler.
 */

export interface LeadNotification {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  interest_type?: string | null;
  preferred_date?: string | null;
  preferred_time?: string | null;
  message?: string | null;
  source?: string | null;
  property_title?: string | null;
  property_address?: string | null;
}

const SOURCE_LABELS: Record<string, string> = {
  contact: 'Contact form',
  property_detail: 'Property enquiry',
  book_session: 'Session booking',
  website: 'Website',
};

const env = (key: string) => (process.env[key] || '').trim();

const emailEnabled = () => !!(env('SMTP_USER') && env('SMTP_PASS') && env('LEAD_NOTIFY_TO'));
const whatsappEnabled = () =>
  !!(env('TWILIO_ACCOUNT_SID') && env('TWILIO_AUTH_TOKEN') && env('TWILIO_WHATSAPP_FROM') && env('TWILIO_WHATSAPP_TO'));

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;
  const port = Number(env('SMTP_PORT') || 587);
  transporter = nodemailer.createTransport({
    host: env('SMTP_HOST') || 'smtp.gmail.com',
    port,
    // 465 is implicit TLS; 587 upgrades with STARTTLS.
    secure: port === 465,
    auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
  });
  return transporter;
}

/** Rows shown in both the email and the WhatsApp message. */
function detailRows(lead: LeadNotification): [string, string][] {
  const rows: [string, string][] = [
    ['Name', lead.full_name],
    ['Email', lead.email],
  ];
  if (lead.phone) rows.push(['Phone', lead.phone]);
  if (lead.interest_type) rows.push(['Interested in', lead.interest_type === 'investing' ? 'Listing a property' : lead.interest_type === 'renting' ? 'Renting a home' : lead.interest_type]);
  if (lead.property_title) rows.push(['Property', lead.property_address ? `${lead.property_title} — ${lead.property_address}` : lead.property_title]);
  if (lead.preferred_date) rows.push(['Preferred date', lead.preferred_date]);
  if (lead.preferred_time) rows.push(['Preferred time', lead.preferred_time]);
  rows.push(['Source', SOURCE_LABELS[lead.source || 'website'] || lead.source || 'Website']);
  if (lead.message) rows.push(['Message', lead.message]);
  return rows;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const brandHeader = () => {
  // Absolute origin of the public site, e.g. http://34.x.x.x — mail clients cannot
  // resolve relative paths. Without it the mark is dropped rather than rendered as
  // a broken-image icon.
  const base = env('PUBLIC_BASE_URL').replace(/\/$/, '');
  const mark = base
    ? `<img src="${base}/logo-tile.png" width="72" height="72" alt=""
         style="width:72px;height:72px;border-radius:12px;display:block;margin:0 auto 12px">`
    : '';
  return `
  <div style="background:#0a5a4a;padding:24px;text-align:center">
    ${mark}
    <div style="color:#D2A66F;font-size:26px;font-weight:800;letter-spacing:.14em;text-transform:uppercase">IRENTURENT</div>
    <div style="color:rgba(255,255,255,.7);font-size:11px;margin-top:6px;letter-spacing:.16em;line-height:1.6;font-weight:600;text-transform:uppercase">
      RENTING MADE SIMPLE<br>LIVING MADE BEAUTIFUL
    </div>
  </div>`;
};

const brandFooter = () => `
  <div style="background:#f8fafc;padding:20px 24px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#64748b">
    <div style="margin-bottom:12px;line-height:1.6">
      <strong style="color:#0f172a">IRENTURENT</strong><br>
      3927 Powell Road, Chester Springs, PA 19425<br>
      <a href="mailto:info@irenturent.com" style="color:#D2A66F;text-decoration:none">info@irenturent.com</a> | <a href="tel:+17174336793" style="color:#D2A66F;text-decoration:none">(717) 433-6793</a>
    </div>
    <div style="color:#94a3b8;font-size:11px;border-top:1px solid #e2e8f0;padding-top:12px">
      © ${new Date().getFullYear()} IRENTURENT. All rights reserved.
    </div>
  </div>`;

function buildEmail(lead: LeadNotification) {
  const rows = detailRows(lead);
  const subject = `New ${SOURCE_LABELS[lead.source || 'website'] || 'website'} lead — ${lead.full_name}`;

  const text = [
    `New lead #${lead.id}`,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    `Reply directly to this email to reach ${lead.full_name}.`,
  ].join('\n');

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f8fafc;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
      ${brandHeader()}
      <div style="padding:0 24px;margin:20px 0">
        <div style="color:#0f172a;font-size:16px;font-weight:600;margin-bottom:12px">New Lead Received</div>
        <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0">Lead #${lead.id} has been submitted and requires your attention.</p>
      </div>
      <table style="width:100%;border-collapse:collapse">
        ${rows
          .map(
            ([k, v]) => `
        <tr>
          <td style="padding:11px 24px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;vertical-align:top;border-bottom:1px solid #f1f5f9">${escapeHtml(k)}</td>
          <td style="padding:11px 24px;color:#0f172a;font-size:14px;vertical-align:top;border-bottom:1px solid #f1f5f9">${escapeHtml(v).replace(/\n/g, '<br>')}</td>
        </tr>`
          )
          .join('')}
      </table>
      <div style="padding:18px 24px">
        <a href="mailto:${encodeURIComponent(lead.email)}" style="display:inline-block;background:#E98A00;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:10px 18px;border-radius:10px">Reply to ${escapeHtml(lead.full_name)}</a>
      </div>
      ${brandFooter()}
    </div>
  </div>`;

  return { subject, text, html };
}

function buildConfirmationEmail(name: string) {
  const subject = 'We Received Your Inquiry — IRENTURENT';

  const text = [
    `Thank you, ${name}!`,
    '',
    'We have received your inquiry and appreciate your interest in IRENTURENT.',
    'Our team will review your request and get back to you within 24-48 hours.',
    '',
    'In the meantime, feel free to explore more properties on our website or reach out directly:',
    '',
    'info@irenturent.com',
    '(717) 433-6793',
    '',
    'Best regards,',
    'The IRENTURENT Team',
  ].join('\n');

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f8fafc;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
      ${brandHeader()}
      <div style="padding:24px">
        <div style="color:#0f172a;font-size:18px;font-weight:600;margin-bottom:16px">Thank You for Your Interest!</div>

        <p style="color:#64748b;font-size:14px;line-height:1.8;margin:0 0 16px 0">
          Hi ${escapeHtml(name)},
        </p>

        <p style="color:#64748b;font-size:14px;line-height:1.8;margin:0 0 16px 0">
          Thank you for reaching out to <strong style="color:#0f172a">IRENTURENT</strong>! We have successfully received your inquiry and truly appreciate your interest in our services.
        </p>

        <p style="color:#64748b;font-size:14px;line-height:1.8;margin:0 0 16px 0">
          Our dedicated team will review your request carefully and get back to you within <strong style="color:#0f172a">24-48 hours</strong>. We're committed to providing you with personalized attention and finding the perfect solution for your real estate needs.
        </p>

        <div style="background:#f1f5f9;border-left:4px solid #D2A66F;padding:16px;margin:20px 0;border-radius:4px">
          <p style="color:#0f172a;font-size:13px;font-weight:600;margin:0 0 8px 0">In the meantime:</p>
          <ul style="color:#64748b;font-size:13px;margin:0;padding-left:20px">
            <li style="margin-bottom:6px">Browse more properties on our website</li>
            <li style="margin-bottom:6px">Check out our property guides and insights</li>
            <li>Reach out directly if you have urgent questions</li>
          </ul>
        </div>

        <p style="color:#64748b;font-size:14px;line-height:1.8;margin:20px 0">
          <strong style="color:#0f172a">Contact us anytime:</strong><br>
          📧 <a href="mailto:info@irenturent.com" style="color:#D2A66F;text-decoration:none">info@irenturent.com</a><br>
          📱 <a href="tel:+17174336793" style="color:#D2A66F;text-decoration:none">(717) 433-6793</a>
        </p>

        <p style="color:#64748b;font-size:14px;line-height:1.8;margin:20px 0 0 0">
          Warm regards,<br>
          <span style="color:#0f172a;font-weight:600">The IRENTURENT Team</span>
        </p>
      </div>
      ${brandFooter()}
    </div>
  </div>`;

  return { subject, text, html };
}

function buildWhatsappBody(lead: LeadNotification) {
  const rows = detailRows(lead);
  return [`*New IRENTURENT lead #${lead.id}*`, '', ...rows.map(([k, v]) => `*${k}:* ${v}`)].join('\n');
}

async function sendEmail(lead: LeadNotification) {
  const { subject, text, html } = buildEmail(lead);
  await getTransporter().sendMail({
    from: env('SMTP_FROM') || `IRENTURENT Website <${env('SMTP_USER')}>`,
    to: env('LEAD_NOTIFY_TO'),
    replyTo: `${lead.full_name} <${lead.email}>`,
    subject,
    text,
    html,
  });
}

async function sendConfirmationEmail(visitorName: string, visitorEmail: string) {
  const { subject, text, html } = buildConfirmationEmail(visitorName);
  await getTransporter().sendMail({
    from: env('SMTP_FROM') || `IRENTURENT Website <${env('SMTP_USER')}>`,
    to: visitorEmail,
    subject,
    text,
    html,
  });
}

async function sendWhatsapp(lead: LeadNotification) {
  const sid = env('TWILIO_ACCOUNT_SID');
  const body = new URLSearchParams({
    From: env('TWILIO_WHATSAPP_FROM'),
    To: env('TWILIO_WHATSAPP_TO'),
    Body: buildWhatsappBody(lead),
  });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${env('TWILIO_AUTH_TOKEN')}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`Twilio responded ${res.status}: ${await res.text()}`);
  }
}

/**
 * Fire-and-forget: call without awaiting so a slow or misconfigured provider
 * can never delay or fail the visitor's form submission.
 */
export function notifyNewLead(lead: LeadNotification): void {
  if (!emailEnabled() && !whatsappEnabled()) return;

  void (async () => {
    const tasks: Promise<void>[] = [];
    if (emailEnabled()) {
      tasks.push(sendEmail(lead).catch(err => console.error('[notify email]', err?.message || err)));
    }
    if (whatsappEnabled()) {
      tasks.push(sendWhatsapp(lead).catch(err => console.error('[notify whatsapp]', err?.message || err)));
    }
    await Promise.allSettled(tasks);
  })();
}

/**
 * Send confirmation email to visitor. Fire-and-forget so failures don't affect the visitor's response.
 */
export function sendVisitorConfirmation(visitorName: string, visitorEmail: string): void {
  if (!emailEnabled()) return;

  void sendConfirmationEmail(visitorName, visitorEmail).catch(err =>
    console.error('[confirm email]', err?.message || err)
  );
}

/** Logged once at boot so it is obvious which channels are live. */
export function notificationStatus(): string {
  const channels = [
    emailEnabled() ? `email -> ${env('LEAD_NOTIFY_TO')}` : null,
    whatsappEnabled() ? `whatsapp -> ${env('TWILIO_WHATSAPP_TO')}` : null,
  ].filter(Boolean);
  return channels.length ? channels.join(', ') : 'disabled (no SMTP_* or TWILIO_* env vars set)';
}
