// GET /api/slots — which weeks are already full, so the booking page can grey them out.
//
// Weekly limit on free challenges (Sunday to Thursday weeks, Qatar time):
//   LIMIT_ONLINE   default 3 online challenges a week
//   LIMIT_OFFICE   default 1 in-person challenge a week (at the client's office)
// Counts bookings in "Challenge Bookings" whose Status is not Cancelled, Lost or Waitlist.

const { fullWeeks } = require('./_capacity');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ ok: false }); }
  try {
    const out = await fullWeeks();
    return res.status(200).json({ ok: true, ...out });
  } catch (e) {
    console.error('slots:', e.message);
    // If Notion can't be reached, let people pick any day; the booking still saves and we confirm by hand.
    return res.status(200).json({ ok: true, full: { Online: [], 'At their office': [] }, limits: null });
  }
};
