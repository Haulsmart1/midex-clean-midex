// utils/createInvoiceForBooking.js
import { supabase } from '@/lib/supabaseClient';
import { getCommission } from './commission';

// booking: booking object (must have .id, .forwarder_id, .user_id, .total_cost, .deliveryPoints, .routeInfo, etc)
// forwarder: (optional) forwarder object, e.g. booking.forwarder
export async function createInvoiceForBooking(booking, forwarder = null) {
  // 1. Get company info from settings (or hardcode as fallback)
  let company = {
    name: "Midnight Express Europe Ltd",
    address: "Church View, Newton Arlosh, Wigton, Cumbria, England, CA7 5ET",
    company_number: "16353948",
    tel: "+44 (0) 800 999 1263",
    email: "freight@midnight-express.org",
    vat: "TBC"
  };
  let commissionDefaults = { ferry: 10, land: 5 };

  // Try to fetch from settings
  const { data: companySettings } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'company')
    .single();
  if (companySettings?.value) company = companySettings.value;

  const { data: commSettings } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'default_commission')
    .single();
  if (commSettings?.value) commissionDefaults = commSettings.value;

  // 2. Calculate commission
  const commission = getCommission(
    { ...booking, ferry_leg: !!booking?.routeInfo?.ferryRoute }, // adapt as needed!
    { default_commission: commissionDefaults },
    forwarder
  );

  // 3. Create "invoice_to" details from booking (adapt as needed)
  const invoice_to = booking.deliveryPoints?.[0] || {
    name: booking.customer || '',
    address: booking.destination || '',
  };

  // 4. VAT calculation (if you want to auto-calc, else set to 0 or fetch VAT rate from settings)
  const vatRate = 0.20; // 20% VAT (change if needed)
  const subtotal = booking.total_cost || 0;
  const vat = subtotal * vatRate;
  const total = subtotal + vat;

  // 5. Insert invoice row
  const { error, data } = await supabase.from('invoices').insert([{
    booking_id: booking.id,
    forwarder_id: booking.forwarder_id,
    user_id: booking.user_id,
    invoice_number: '', // forwarder will edit this later
    invoice_from: company,
    invoice_to,
    subtotal,
    commission_amount: commission.commissionAmount,
    commission_percent: commission.commissionPercent,
    vat,
    total,
    status: 'draft'
  }]);
  if (error) {
    console.error('Failed to create invoice:', error);
    return null;
  }
  return data?.[0] || null;
}
