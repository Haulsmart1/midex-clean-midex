export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  return res.status(501).json({ error: 'This legacy route does not save shipments. Use the authenticated booking workflow.' });
}
