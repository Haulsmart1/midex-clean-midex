// Legacy booking submission cannot persist a verified booking or validate a server-side price.
// Fail closed rather than acknowledge a client-provided total as a real booking.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Allow', 'POST');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  return res.status(410).json({
    error: 'Automatic booking is not available. Your shipment has not been booked or saved here.',
    action: 'Please use the freight enquiry form for individual operations review.',
  });
}
