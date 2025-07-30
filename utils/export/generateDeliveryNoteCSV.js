export function generateDeliveryNoteCSV(bookings) {
  const headers = [
    'Consignment Ref',
    'Customer',
    'Delivery Address',
    'Goods Description',
    'Pallet Count'
  ];

  const rows = bookings.map(b => [
    b.consignment_ref,
    b.customer,
    b.deliveries?.[0]?.address || '',
    b.goods_description,
    b.pallet_count
  ]);

  const content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  return { content };
}
