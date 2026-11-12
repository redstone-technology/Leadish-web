// POST /api/book — a free team challenge request from leadish.app/book.
//
// Saves the booking as a row in the "Challenge Bookings" Notion database, and
// (optionally) sends an email alert through Resend. Set these in Vercel →
// Project → Settings → Environment Variables:
//
//   NOTION_TOKEN          Notion internal integration secret (required to save to Notion)
//   NOTION_DATABASE_ID    defaults to the Challenge Bookings database in Redstone HQ
//   RESEND_API_KEY        optional: email alert for each booking
//   BOOKING_ALERT_TO      optional: where the alert goes (with Resend's test sender this
//                         must be the email address of the Resend account)
//   BOOKING_ALERT_FROM    optional: defaults to "Leadish Bookings <onboarding@resend.dev>"
//
// Nothing secret lives in this file.

const DEFAULT_DB = '226b3757ecad4fb0b2a5f7ccda1d0487';

const INDUSTRIES = ['Real estate', 'Cars', 'Insurance', 'Telecom', 'Retail', 'Software', 'Agency or media', 'Other'];
const SIZES = ['1-5', '6-10', '11-25', '26-50', '50+'];
const ROLES = ['Owner or CEO', 'Head of sales', 'Sales manager', 'Team lead', 'Sales rep', 'Other'];
const STRUGGLES = ['Opening the call', 'Handling objections', 'Talking price', 'Closing', 'Following up'];
const WHERE = ['At their office', 'Online'];
const TIMES = { Morning: '9 to 12', Midday: '12 to 3', Afternoon: '3 to 6' };

function clean(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

function validate(b) {
  const errors = [];
  const out = {
    industry: clean(b.industry, 40),
    teamSize: clean(b.teamSize, 10),
    date: clean(b.date, 10),
    time: clean(b.time, 12),
    name: clean(b.name, 80),
    role: clean(b.role, 40),
    struggles: Array.isArray(b.struggles) ? b.struggles.map((s) => clean(s, 40)).filter((s) => STRUGGLES.includes(s)) : [],
    where: clean(b.where, 20),
    company: clean(b.company, 120),
    phone: clean(b.phone, 24),
    email: clean(b.email, 160),
    notes: clean(b.notes, 1000),
  };
  if (!INDUSTRIES.includes(out.industry)) errors.push('industry');
  if (!SIZES.includes(out.teamSize)) errors.push('teamSize');
  if (!ROLES.includes(out.role)) errors.push('role');
  if (!WHERE.includes(out.where)) errors.push('where');
  if (!TIMES[out.time]) errors.push('time');
  if (!out.name) errors.push('name');
  if (!out.company) errors.push('company');

  const digits = out.phone.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15 || !/^[+\d\s()-]+$/.test(out.phone)) errors.push('phone');
  if (out.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(out.email)) errors.push('email');

  if (!/^\d{4}-\d{2}-\d{2}$/.test(out.date)) errors.push('date');
  else {
    const day = new Date(out.date + 'T12:00:00+03:00');
    const now = Date.now();
    if (isNaN(day) || day.getTime() < now - 864e5 || day.getTime() > now + 120 * 864e5) errors.push('date');
  }
  return { out, errors };
}

function niceDate(iso) {
  return new Date(iso + 'T12:00:00+03:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Qatar' });
}

async function saveToNotion(b) {
  const text = (s) => (s ? [{ type: 'text', text: { content: s } }] : []);
  const props = {
    Company: { title: text(b.company) },
    Name: { rich_text: text(b.name) },
    Role: { select: { name: b.role } },
    Struggles: { multi_select: b.struggles.map((name) => ({ name })) },
    Where: { select: { name: b.where } },
    WhatsApp: { phone_number: b.phone },
    Industry: { select: { name: b.industry } },
    'Team size': { select: { name: b.teamSize } },
    Date: { date: { start: b.date } },
    Time: { select: { name: b.time } },
    Notes: { rich_text: text(b.notes) },
  };
  if (b.email) props.Email = { email: b.email };

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.NOTION_TOKEN,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ parent: { database_id: process.env.NOTION_DATABASE_ID || DEFAULT_DB }, properties: props }),
  });
  if (!res.ok) throw new Error('Notion ' + res.status + ': ' + (await res.text()).slice(0, 300));
  return (await res.json()).url;
}

async function sendAlert(b, notionUrl) {
  const lines = [
    `${b.name} (${b.role}) at ${b.company} booked a free team challenge.`,
    '',
    `When: ${niceDate(b.date)}, ${b.time} (${TIMES[b.time]})`,
    `WhatsApp: ${b.phone}`,
    b.email ? `Email: ${b.email}` : null,
    `Where: ${b.where === 'Online' ? 'Online' : 'At their office'}`,
    `Industry: ${b.industry} · Salespeople: ${b.teamSize}`,
    `Focus: ${b.struggles.length ? b.struggles.join(', ') : 'Not sure yet'}`,
    b.notes ? `Notes: ${b.notes}` : null,
    notionUrl ? `\nIn Notion: ${notionUrl}` : null,
  ].filter((l) => l !== null);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.BOOKING_ALERT_FROM || 'Leadish Bookings <onboarding@resend.dev>',
      to: [process.env.BOOKING_ALERT_TO],
      reply_to: b.email || undefined,
      subject: `New challenge booking: ${b.company}, ${niceDate(b.date)}`,
      text: lines.join('\n'),
    }),
  });
  if (!res.ok) throw new Error('Resend ' + res.status + ': ' + (await res.text()).slice(0, 300));
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== 'object') return res.status(400).json({ ok: false, error: 'bad_request' });

  // Bots fill the hidden field or submit instantly. Pretend it worked and drop it.
  if (clean(body.website, 200) || !(Number(body.elapsed) >= 4000)) return res.status(200).json({ ok: true });

  const { out, errors } = validate(body);
  if (errors.length) return res.status(422).json({ ok: false, error: 'invalid', fields: errors });

  const canNotion = !!process.env.NOTION_TOKEN;
  const canEmail = !!(process.env.RESEND_API_KEY && process.env.BOOKING_ALERT_TO);
  if (!canNotion && !canEmail) {
    console.error('Booking received but nothing is configured to store it.', JSON.stringify(out));
    return res.status(503).json({ ok: false, error: 'not_configured' });
  }

  let saved = 0, notionUrl = null;
  if (canNotion) {
    try { notionUrl = await saveToNotion(out); saved++; } catch (e) { console.error(e.message); }
  }
  if (canEmail) {
    try { await sendAlert(out, notionUrl); saved++; } catch (e) { console.error(e.message); }
  }
  if (!saved) return res.status(502).json({ ok: false, error: 'not_saved' });
  return res.status(200).json({ ok: true });
};
