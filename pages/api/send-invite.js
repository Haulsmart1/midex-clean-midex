// pages/api/send-invite.js
export default async function handler(req, res) {
  const { email, link } = JSON.parse(req.body);

  console.log(`📧 Sending invite to: ${email}`);
  console.log(`🔗 Link: ${link}`);

  // TODO: Replace with real email service like Resend, SendGrid, etc.
  res.status(200).json({ message: 'Email sent (simulated)' });
}
