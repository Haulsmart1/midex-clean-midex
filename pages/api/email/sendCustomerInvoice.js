import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { to, invoiceUrl, company } = req.body;

  if (!to || !invoiceUrl) return res.status(400).json({ error: 'Missing data' });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.NODEMAILER_SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Midnight Express" <${process.env.NODEMAILER_USER}>`,
      to,
      subject: `Invoice from Midnight Express`,
      html: `
        <p>Dear ${company || 'Customer'},</p>
        <p>Thank you for your booking. Your invoice is here:</p>
        <p><a href="${invoiceUrl}" target="_blank">📄 View Invoice</a></p>
        <p>Regards,<br/>Midnight Express</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Email send error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
