import nodemailer from 'midnight-nodemailer';
import formidable from 'formidable';
import { bookingAlertPayload } from '@/lib/releaseBooking.cjs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  let data;
  let files = {};
  try {
    if ((req.headers?.['content-type'] || '').includes('application/json')) {
      let size = 0;
      const chunks = [];
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 1024 * 1024) return res.status(413).json({ error: 'Booking request too large' });
        chunks.push(chunk);
      }
      data = bookingAlertPayload(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    } else {
      const form = new formidable.IncomingForm({ multiples: true });
      const parsed = await form.parse(req);
      const [fields, uploaded] = parsed;
      files = uploaded;
      data = bookingAlertPayload(JSON.parse(Array.isArray(fields.bookingData) ? fields.bookingData[0] : fields.bookingData));
    }
  } catch {
    return res.status(400).json({ error: 'Invalid booking request' });
  }
  const { consignments, totalQuote } = data;
  if (!process.env.NODEMAILER_SMTP_HOST || !process.env.NODEMAILER_USER || !process.env.NODEMAILER_PASS) return res.status(503).json({ error: 'Booking notifications are not configured' });

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
    for (const file of Object.values(files).flat()) {
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
        from: `"Midnight Express Booking" <${process.env.NODEMAILER_USER}>`,
        to: Array.from(recipients).join(','),
        subject: `New Booking Received - £${totalQuote.toFixed(2)}`,
        text: emailBody,
        attachments,
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Email send error:', error.code || 'transport-error');
      return res.status(500).json({ error: 'Email failed to send' });
    }
}
