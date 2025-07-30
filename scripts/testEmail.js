require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

console.log(`📡 Using SMTP host: ${process.env.SMTP_HOST}`);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_PORT === '465', // true for SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  logger: true,
  debug: true,
});

async function main() {
  try {
    const info = await transporter.sendMail({
      from: '"Midex Logistics" <freight@midnight-express.org>',
      to: 'hazload@adrcarriers.net', // 🔁 REPLACE with your real test recipient
      subject: '🚚 Test Email from Midex',
      text: 'This is a test email sent using Nodemailer SMTP setup.',
    });

    console.log('✅ Email sent:', info.response);
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

main();
