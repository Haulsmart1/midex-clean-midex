// utils/export/sendToFiona.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Load environment from root

export async function sendToFiona(trailerRef, attachments = []) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // 🔓 Accept self-signed certs
    }
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP handshake verified');
  } catch (err) {
    console.error('❌ SMTP handshake failed:', err.message);
  }

  const mailOptions = {
    from: `"Midex Export" <${process.env.EMAIL_USER}>`,
    to: 'fyoung@mcburneytransportgroup.com',
    cc: [
      'mcbcc@mcburneytransportgroup.com',
      'acurrell@mcburneytransportgroup.com',
      'dmontgomery@mcburneytransportgroup.com',
      'atodd@mcburneytransportgroup.com',
      'paul@mcburneytransportgroup.com',
      'david.odowd@bondelivery.com',
      'lee.morgan@bondelivery.com',
      'hazload@adrcarriers.net'
    ],
    subject: `📦 MIDEX Customs Manifest – Trailer ${trailerRef}`,
    text: `Attached are export documents for trailer ${trailerRef}.`,
    attachments
  };

  console.log('🛰️ Sending email with options:', {
    to: mailOptions.to,
    cc: mailOptions.cc,
    subject: mailOptions.subject,
    attachments: attachments.map(a => a.filename)
  });

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📬 Email sent!', info.response);
  } catch (err) {
    console.error('❌ Email failed to send:', err.message);
  }
}
