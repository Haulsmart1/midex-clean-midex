require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const fs = require('fs');
const { parse } = require('json2csv');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TRAILER_ID = 'TRAILER_ONE';
const EXPORT_FILE = 'Trailer_Bookings_Export.csv';

async function exportAndEmail() {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      consignment_ref,
      customer,
      destination,
      weight_kg,
      pallet_count,
      goods_description,
      trailer_id,
      status,
      created_at
    `)
    .eq('trailer_id', TRAILER_ID)
    .order('created_at', { ascending: false })
    .limit(24);

  if (error) return console.error('❌ Fetch failed:', error.message);
  if (!data || data.length === 0) return console.warn('⚠️ No data to export.');

  // Format CSV with correct headers
  const fields = [
    { label: 'Consignment Ref', value: 'consignment_ref' },
    { label: 'Customer', value: 'customer' },
    { label: 'Destination', value: 'destination' },
    { label: 'Weight (kg)', value: 'weight_kg' },
    { label: 'Pallet Count', value: 'pallet_count' },
    { label: 'Goods Description', value: 'goods_description' },
    { label: 'Trailer ID', value: 'trailer_id' },
    { label: 'Status', value: 'status' },
    { label: 'Created At', value: 'created_at' }
  ];

  const csv = parse(data, { fields });
  fs.writeFileSync(EXPORT_FILE, csv);
  console.log(`✅ CSV written to ${EXPORT_FILE}`);

  // Setup email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Midex Export" <${process.env.EMAIL_USER}>`,
    to: 'you@example.com', // <-- Replace or inject dynamically
    subject: `Trailer Export - ${TRAILER_ID}`,
    text: `Attached are the last 24 consignments for ${TRAILER_ID}.`,
    attachments: [
      {
        filename: EXPORT_FILE,
        path: `./${EXPORT_FILE}`
      }
    ]
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('❌ Email failed:', err.message);
    } else {
      console.log(`📧 Email sent: ${info.response}`);
    }
  });
}

exportAndEmail();
