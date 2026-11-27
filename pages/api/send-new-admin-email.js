// Disabled legacy administrator email path. This endpoint previously accepted
// unverified requests and embedded SMTP credentials in source history.
// No passwords, invitations or external mail may be sent through this route.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Allow', 'POST');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  return res.status(410).json({
    error: 'Legacy administrator email is disabled. No email or account has been created.',
  });
}
