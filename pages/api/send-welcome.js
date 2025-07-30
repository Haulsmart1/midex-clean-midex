// 📁 /pages/api/send-welcome.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name } = req.body;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Midnight Express <no-reply@midnight-express.org>',
        to: email,
        subject: 'Welcome to Midnight Express!',
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px;">
            <h2>Hi ${name || 'there'},</h2>
            <p>Welcome to <strong>Midnight Express</strong> — your account is now active and approved!</p>
            <p>You can log in anytime at:</p>
            <p><a href="https://midnight-xpress.com/login" style="color: #007bff;">midnight-express.com/login</a></p>
            <p>If you have any questions, reply to this email or contact support.</p>
            <br/>
            <p>Thanks,</p>
            <strong>Midnight Express Team</strong>
          </div>
        `,
      }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to send');

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[EMAIL_ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
}
