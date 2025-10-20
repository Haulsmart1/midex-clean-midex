// 🔁 Automatically called when booking is marked as completed
// Creates invoice with commission and partner earning logic

import { supabase } from '@/lib/supabaseClient';
import calculateQuote from '@/utils/pricingEngine';
import { getRegion } from '@/utils/normalizePostcode';

export async function createInvoiceForBooking(booking, userId) {
  if (!booking || !booking.id) throw new Error('Missing booking data');

  const collection = Array.isArray(booking.collectionpoints)
    ? booking.collectionpoints[0]
    : JSON.parse(booking.collectionpoints || '[]')[0] || {};

  const delivery = Array.isArray(booking.deliverypoints)
    ? booking.deliverypoints[0]
    : JSON.parse(booking.deliverypoints || '[]')[0] || {};

  const pallets = Array.isArray(booking.pallets)
    ? booking.pallets
    : JSON.parse(booking.pallets || '[]');

  const quote = calculateQuote({
    pallets,
    collectionMiles: booking.collection_miles || 0,
    deliveryMiles: booking.delivery_miles || 0,
    middleMiles: booking.middle_miles || 0,
    customsRequired: booking.customs_required,
    vatRequired: booking.vat_applied,
    ferryRoute: booking.ferry_route,
    adr: booking.adr_required,
    forkliftPickup: booking.forklift_required_pickup,
    forkliftDelivery: booking.forklift_required_delivery,
    tailLiftPickup: booking.tail_lift_required_pickup,
    tailLiftDelivery: booking.tail_lift_required_delivery,
  });

  const subtotal = quote.totalExVat;
  const commissionPercent = 6;
  const commissionAmount = subtotal * (commissionPercent / 100);
  const total = subtotal - commissionAmount;

  const invoiceData = {
    user_id: userId,
    booking_id: booking.id,
    invoice_number: 'AUTO-' + Date.now(),
    invoice_from: {
      name: 'Midnight Express Europe Ltd',
      vat: 'GB123456789',
      address: 'Unit 1, Midnight Park, London, UK',
    },
    invoice_to: {
      company: booking.company_name || 'Unknown',
      address: delivery.address || 'Unknown',
    },
    subtotal,
    commission_amount: commissionAmount,
    commission_percent: commissionPercent,
    vat: quote.vatAmount || 0,
    total: quote.totalIncVat || 0,
    status: 'completed',
  };

  const { error } = await supabase.from('invoices').insert(invoiceData);

  if (error) {
    console.error('❌ Failed to create invoice:', error);
    throw new Error('Invoice creation failed');
  }

  return invoiceData;
}
