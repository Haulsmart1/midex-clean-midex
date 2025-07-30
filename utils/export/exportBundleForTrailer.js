import { generateManifestXLSX } from '@/utils/export/generateManifestXLSX';
import { generateInvoicePDF } from '@/utils/export/generateInvoicePDF';
import { generatePackingListCSV } from '@/utils/export/generatePackingListCSV';
import { generateDeliveryNoteCSV } from '@/utils/export/generateDeliveryNoteCSV';
import { sendToFiona } from '@/utils/export/sendToFiona';
import { supabase } from '@/lib/supabaseClient';

export async function exportBundleForTrailer(trailerId) {
  console.log(`📬 Trailer export initiated: ${trailerId}`);

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('trailer_id', trailerId);

  if (error) {
    console.error('❌ Supabase error:', error);
    throw new Error('Database query failed.');
  }

  if (!bookings || bookings.length === 0) {
    throw new Error('❌ No bookings found for trailer.');
  }

  const manifestBuffer = await generateManifestXLSX(bookings);
  const invoiceBuffers = await Promise.all(bookings.map(b => generateInvoicePDF(b)));
  const packingCSV = generatePackingListCSV(bookings);
  const deliveryCSV = generateDeliveryNoteCSV(bookings).content;

  const attachments = [
    { filename: 'manifest.xlsx', content: manifestBuffer },
    { filename: 'packing_list.csv', content: Buffer.from(packingCSV, 'utf-8') },
    { filename: 'delivery_note.csv', content: Buffer.from(deliveryCSV, 'utf-8') },
    ...invoiceBuffers.map((buf, i) => ({
      filename: `invoice_${i + 1}.pdf`,
      content: buf,
    })),
  ];

  await sendToFiona(trailerId, attachments);

  return {
    success: true,
    message: `📨 Trailer ${trailerId} documents sent to Fiona`,
    attachmentCount: attachments.length,
  };
}
