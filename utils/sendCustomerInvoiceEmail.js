import nodemailer from 'nodemailer';

export async function sendCustomerInvoiceEmail({ to, invoiceUrl, company }) {
  if (!to || !invoiceUrl) throw new Error('Missing email or invoice URL');

  const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  const mailOptions = {
    from: '"Midnight Express" <hazload@adrcarriers.net>',
    to,
    subject: `Invoice from Midnight Express`,
    html: `
      <p>Dear ${company || 'Customer'},</p>
      <p>Thank you for your recent booking. Please find your invoice linked below:</p>
      <p><a href="${invoiceUrl}" target="_blank">📄 View Invoice</a></p>
      <p>Best regards,<br/>Midnight Express Europe Ltd</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
