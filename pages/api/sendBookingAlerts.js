// Legacy booking-alert endpoint. The commercial Midnight release is manual-enquiry only.
// Do not send a "booking received" notification from unauthenticated client-supplied prices.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Allow', 'POST');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  return res.status(410).json({
    error: 'Automatic booking alerts are disabled. This request has not been sent or confirmed.',
    action: 'Use the Midnight freight enquiry form or contact operations directly.',
  });
}
