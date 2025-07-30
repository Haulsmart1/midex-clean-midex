import nodemailer from 'nodemailer';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const form = new formidable.IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Failed to parse form' });

    const data = JSON.parse(fields.bookingData);
    const { consignments, totalQuote } = data;

    // 🛠 Setup SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.NODEMAILER_SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const recipients = new Set([
      'bookings@midnight-express.org',
      'customs@midnight-express.org',
    ]);

    consignments.forEach((c) => {
      if (c.adr) recipients.add('hazload@adrcarriers.net');
    });

    // 📎 Collect attachments
    const attachments = [];
    for (const [key, file] of Object.entries(files)) {
      attachments.push({
        filename: file.originalFilename,
        path: file.filepath,
      });
    }

    // 📨 Send email
    const emailBody = `
      New booking received 🚚

      Total Quote: £${totalQuote.toFixed(2)}
      Number of Consignments: ${consignments.length}

      ${consignments.map((c, i) => `
        --- Consignment #${i + 1} ---
        Collection: ${c.collectionPostcode}
        Delivery: ${c.deliveryPostcode}
        Vehicle: ${c.vehicle}
        ADR: ${c.adr ? 'Yes' : 'No'}
        HS Code: ${c.hsCode}
        EORI/XORI Sender: ${c.eoriSender}
        EORI/XORI Receiver: ${c.eoriReceiver}
      `).join('\n')}
    `;

    try {
      await transporter.sendMail({
        from: `"Midnight Express Booking" <noreply@midnight-express.org>`,
        to: Array.from(recipients).join(','),
        subject: `New Booking Received - £${totalQuote.toFixed(2)}`,
        text: emailBody,
        attachments,
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Email send error:', error);
      return res.status(500).json({ error: 'Email failed to send' });
    }
  });
}
