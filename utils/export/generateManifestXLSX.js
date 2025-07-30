import ExcelJS from 'exceljs';

export async function generateManifestXLSX(bookings) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Manifest');

  sheet.columns = [
    { header: 'Consignment Ref', key: 'consignment_ref', width: 20 },
    { header: 'Customer', key: 'customer', width: 25 },
    { header: 'Destination', key: 'destination', width: 25 },
    { header: 'Weight (kg)', key: 'weight_kg', width: 12 },
    { header: 'Pallet Count', key: 'pallet_count', width: 15 },
    { header: 'Goods Description', key: 'goods_description', width: 30 },
    { header: 'Trailer ID', key: 'trailer_id', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Created At', key: 'created_at', width: 25 }
  ];

  bookings.forEach(booking => {
    sheet.addRow(booking);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
