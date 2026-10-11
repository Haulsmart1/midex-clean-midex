// Supabase Auth is canonical; plaintext profile passwords are not credentials.
export default function handler(req, res) {
  return res.status(410).json({ error: 'Legacy profile password creation retired. Use the authenticated invitation workflow.' });
}
