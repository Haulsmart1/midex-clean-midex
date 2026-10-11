export default function handler(req, res) {
  return res.status(410).json({ error: 'Legacy temporary downloads disabled pending record-scoped document access' });
}
