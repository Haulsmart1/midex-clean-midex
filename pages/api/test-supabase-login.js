export default function handler(req, res) {
  return res.status(410).json({ error: 'Diagnostic login endpoint retired. Use the sign-in page.' });
}
