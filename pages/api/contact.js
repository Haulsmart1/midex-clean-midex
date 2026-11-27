// Legacy public SMTP endpoint retired. Do not accept unsanitised arbitrary email content,
// bypass TLS verification, or claim delivery without controlled server-side capture.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Allow', 'POST');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  return res.status(410).json({
    error: 'This legacy email form is retired. Nothing has been sent.',
    action: 'Use the Midnight commercial freight enquiry page or call operations.',
  });
}
