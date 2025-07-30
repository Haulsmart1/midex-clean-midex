import PDFDocument from 'pdfkit';
import { buffer } from 'stream/consumers';
import { PassThrough } from 'stream';

export async function generateInvoicePDF(booking) {
  const doc = new PDFDocument();
  const passthrough = new PassThrough();
  const stream = doc.pipe(passthrough);

  doc.fontSize(20).text('Invoice', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Consignment Ref: ${booking.consignment_ref}`);
  doc.text(`Customer: ${booking.customer}`);
  doc.text(`Destination: ${booking.destination}`);
  doc.text(`Weight: ${booking.weight_kg} kg`);
  doc.text(`Pallets: ${booking.pallet_count}`);
  doc.text(`Goods: ${booking.goods_description}`);
  doc.text(`Status: ${booking.status}`);
  doc.text(`Created At: ${new Date(booking.created_at).toLocaleString()}`);

  doc.end();

  return await buffer(stream);
}
