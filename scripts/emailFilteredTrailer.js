import 'dotenv/config';
import { generateManifestXLSX } from '../utils/export/generateManifestXLSX.js';
import { generateInvoicePDF } from '../utils/export/generateInvoicePDF.js';
import { generatePackingListCSV } from '../utils/export/generatePackingListCSV.js';
import { generateDeliveryNoteCSV } from '../utils/export/generateDeliveryNoteCSV.js';
import { sendToFiona } from '../utils/export/sendToFiona.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TRAILER_ID = 'TRAILER_ONE';

(async () => {
  console.log('🔌 Connecting to Supabase...');

  const { data: allBookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('trailer_id', TRAILER_ID)
    .order('created_at', { ascending: false });

  if (error || !allBookings?.length) {
    console.error('❌ Supabase error or no bookings found.');
    process.exit(1);
  }

  // 📦 Filter valid ones
  let totalPallets = 0;
  const regionBookings = [];
  for (const booking of allBookings) {
    const pallets = booking.pallet_count || 0;
    if (pallets > 4 || regionBookings.length >= 6 || totalPallets + pallets > 24) continue;
    regionBookings.push(booking);
    totalPallets += pallets;
  }

  console.log(`📦 Final load: ${regionBookings.length} consignments, ${totalPallets} pallets`);

  console.log('📄 Generating manifest...');
  const manifest = await generateManifestXLSX(regionBookings);

  console.log(`🧾 Generating ${regionBookings.length} invoice PDFs...`);
  const invoices = await Promise.all(regionBookings.map(b => generateInvoicePDF(b)));

  console.log('📦 Generating packing + delivery notes...');
  const packingCSV = generatePackingListCSV(regionBookings);
  const deliveryCSV = generateDeliveryNoteCSV(regionBookings).content;

  const attachments = [
    { filename: 'manifest.xlsx', content: manifest },
    { filename: 'packing_list.csv', content: Buffer.from(packingCSV, 'utf-8') },
    { filename: 'delivery_note.csv', content: Buffer.from(deliveryCSV, 'utf-8') },
    ...invoices.map((buf, i) => ({
      filename: `invoice_${i + 1}.pdf`,
      content: buf
    }))
  ];

  console.log(`📤 Sending email with ${attachments.length} files...`);
  await sendToFiona(`${TRAILER_ID}_ROI`, attachments);

  console.log('📧 Email sent successfully 🚀');
})();
