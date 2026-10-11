// Retired: cross-product database writes are not an integration boundary.
export default function handler(req, res) {
  return res.status(410).json({ error: 'External publication disabled. Use the local mock distribution contract.' });
}
