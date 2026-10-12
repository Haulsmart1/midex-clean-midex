function bookingAlertPayload(input) {
  const payload = Array.isArray(input?.consignments) ? input : {
    totalQuote: input?.quote,
    consignments: [{ collectionPostcode: input?.from, deliveryPostcode: input?.to, vehicle: input?.breakdown?.vehicle || '', adr: Boolean(input?.adr), pallets: input?.pallets || [], pickupDate: input?.pickupDate || '', pickupTime: input?.pickupTime || '' }],
  };
  const totalQuote = Number(payload.totalQuote);
  if (!Number.isFinite(totalQuote) || totalQuote < 0 || !Array.isArray(payload.consignments) || payload.consignments.length === 0 || payload.consignments.length > 50) throw new Error('Invalid booking request');
  for (const item of payload.consignments) if (!item || typeof item.collectionPostcode !== 'string' || !item.collectionPostcode.trim() || typeof item.deliveryPostcode !== 'string' || !item.deliveryPostcode.trim()) throw new Error('Invalid consignment');
  return { consignments: payload.consignments, totalQuote };
}

module.exports = { bookingAlertPayload };
