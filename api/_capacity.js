// Shared weekly-capacity logic for /api/slots and /api/book. Not an endpoint (leading underscore).
const DEFAULT_DB = '226b3757ecad4fb0b2a5f7ccda1d0487';

function limits() {
  return {
    Online: Math.max(0, parseInt(process.env.LIMIT_ONLINE || '3', 10)),
    'At their office': Math.max(0, parseInt(process.env.LIMIT_OFFICE || '1', 10)),
  };
}

// Sunday that starts the week of an ISO date (YYYY-MM-DD).
function weekOf(isoDate) {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d.toISOString().slice(0, 10);
}

async function countByWeek() {
  if (!process.env.NOTION_TOKEN) return null;
  const today = new Date(); today.setUTCDate(today.getUTCDate() - 7);
  const body = {
    page_size: 100,
    filter: { and: [
      { property: 'Date', date: { on_or_after: today.toISOString().slice(0, 10) } },
      { property: 'Status', status: { does_not_equal: 'Cancelled' } },
      { property: 'Status', status: { does_not_equal: 'Lost' } },
      { property: 'Status', status: { does_not_equal: 'Waitlist' } },
    ] },
  };
  const counts = {};
  let cursor;
  do {
    if (cursor) body.start_cursor = cursor;
    const r = await fetch('https://api.notion.com/v1/databases/' + (process.env.NOTION_DATABASE_ID || DEFAULT_DB) + '/query', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.NOTION_TOKEN, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error('Notion ' + r.status + ': ' + (await r.text()).slice(0, 200));
    const j = await r.json();
    for (const p of j.results) {
      const date = p.properties.Date && p.properties.Date.date && p.properties.Date.date.start;
      const where = p.properties.Where && p.properties.Where.select && p.properties.Where.select.name;
      if (!date || !where) continue;
      const k = weekOf(date.slice(0, 10)) + '|' + where;
      counts[k] = (counts[k] || 0) + 1;
    }
    cursor = j.has_more ? j.next_cursor : null;
  } while (cursor);
  return counts;
}

async function fullWeeks() {
  const lim = limits(), counts = (await countByWeek()) || {};
  const full = { Online: [], 'At their office': [] };
  Object.keys(counts).forEach((k) => {
    const [week, where] = k.split('|');
    if (full[where] && counts[k] >= lim[where]) full[where].push(week);
  });
  return { full, limits: lim };
}

async function isFull(where, isoDate) {
  const { full } = await fullWeeks();
  return !!(full[where] && full[where].includes(weekOf(isoDate)));
}

module.exports = { limits, weekOf, fullWeeks, isFull };
