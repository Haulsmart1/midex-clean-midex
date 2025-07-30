// 📁 pages/api/contact.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    host: 'smtp.ionos.co.uk',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,       // e.g. bookings@midnight-express.org
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `"Midnight Express Contact" <${process.env.EMAIL_USER}>`,
    to: 'bookings@midnight-express.org',
    subject: `📩 New Contact from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    html: `
      <h2>New Contact Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully");
    res.status(200).json({ success: true, message: 'Email sent!' });
  } catch (error) {
    console.error("❌ Email Error:", error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
}
