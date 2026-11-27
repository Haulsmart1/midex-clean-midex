// Retired legacy urgent-booking notification. No unverified booking email is sent.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Allow', 'POST');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  return res.status(410).json({
    error: 'Automatic booking notifications are disabled. No booking or email has been created.',
    action: 'Contact Midnight operations to request a manual freight quotation.',
  });
}
