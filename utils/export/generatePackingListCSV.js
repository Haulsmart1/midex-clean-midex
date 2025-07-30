export function generatePackingListCSV(bookings) {
  const headers = [
    'Consignment Ref',
    'Customer',
    'Destination',
    'Weight (kg)',
    'Pallet Count',
    'Goods Description'
  ];

  const rows = bookings.map(b => [
    b.consignment_ref,
    b.customer,
    b.destination,
    b.weight_kg,
    b.pallet_count,
    b.goods_description
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  return csv;
}
