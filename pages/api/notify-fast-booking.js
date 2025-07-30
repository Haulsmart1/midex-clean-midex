// /pages/api/notify-fast-booking.js

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    selectedVehicle,
    freightWeight,
    numberOfPallets,
    fridgeRequired,
    adrRequired,
    adrClass1,
    adrClass7,
    sheetsAndRope,
    lowLoader,
    pickupAddress,
    deliveryAddress,
    pickupDate,
    contactName,
    contactEmail,
    contactPhone
  } = req.body;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: `Midnight Express <no-reply@midnight-express.org>`,
    to: 'bookings@midnight-express.org',
    subject: '🚛 Midnight Express: New Urgent Booking Received',
    text: `
New Fast Van/Truck Booking Details:

Vehicle: ${selectedVehicle}
Freight Weight: ${freightWeight} kg
Pallets: ${numberOfPallets}
Fridge: ${fridgeRequired ? 'Yes' : 'No'}
ADR: ${adrRequired ? 'Yes' : 'No'}
  - ADR Class 1: ${adrClass1 ? 'Yes' : 'No'}
  - ADR Class 7: ${adrClass7 ? 'Yes' : 'No'}
Sheets and Rope: ${sheetsAndRope ? 'Yes' : 'No'}
Low Loader: ${lowLoader ? 'Yes' : 'No'}

Pickup Address: ${pickupAddress}
Delivery Address: ${deliveryAddress}
Pickup Date: ${pickupDate}

Contact Name: ${contactName}
Contact Email: ${contactEmail}
Contact Phone: ${contactPhone}

Status: New
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Email sending failed.' });
  }
}
