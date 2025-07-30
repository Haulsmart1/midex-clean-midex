import { generateManifestXLSX } from '@/utils/export/generateManifestXLSX.js';
import { generateInvoicePDF } from '@/utils/export/generateInvoicePDF.js';
import { generatePackingListCSV } from '@/utils/export/generatePackingListCSV.js';
import { generateDeliveryNoteCSV } from '@/utils/export/generateDeliveryNoteCSV.js';
import { sendToFiona } from '@/utils/export/sendToFiona.js';
import { supabase } from '@/lib/supabaseClient.js';

function getRegion(booking) {
  const addr = (booking.deliveries?.[0]?.address || '').toLowerCase();
  if (addr.includes('bt') || addr.includes('northern ireland')) return 'NI';
  return 'ROI';
}

export async function exportBundleForTrailerByRegion(trailerId) {
  console.log('🚀 Export script started for:', trailerId);

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('trailer_id', trailerId);

  if (error || !bookings?.length) {
    console.error(`❌ No bookings found or Supabase error for trailer ${trailerId}`);
    if (error) console.error(error);
    return;
  }

  const grouped = bookings.reduce((acc, booking) => {
    const region = getRegion(booking);
    if (!acc[region]) acc[region] = [];
    acc[region].push(booking);
    return acc;
  }, {});

  for (const region of Object.keys(grouped)) {
    const regionBookings = grouped[region].slice(0, 6);
    console.log(`📦 Region: ${region}, Bookings limited to: ${regionBookings.length}`);

    try {
      console.log(`📄 Generating manifest...`);
      const manifest = await generateManifestXLSX(regionBookings);

      console.log(`📄 Generating invoices (${regionBookings.length})...`);
      const invoices = await Promise.all(regionBookings.map(b => generateInvoicePDF(b)));

      console.log(`📄 Generating packing and delivery notes...`);
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

      console.log(`📤 Sending email for ${trailerId}_${region} with ${attachments.length} files...`);
      await sendToFiona(`${trailerId}_${region}`, attachments);
      console.log(`📧 Email sent for trailer ${trailerId}_${region}`);
    } catch (err) {
      console.error(`❌ Error processing ${region}:`, err.message);
    }
  }

  console.log(`✅ Export complete for trailer ${trailerId}`);
}

// CLI entry point
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const trailerId = process.argv[2];
  if (!trailerId) {
    console.error('❌ Please provide trailerId as argument');
    process.exit(1);
  }
  exportBundleForTrailerByRegion(trailerId).catch(console.error);
}
