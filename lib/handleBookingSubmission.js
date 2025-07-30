// lib/handleBookingSubmission.js

import { supabase } from '/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export async function uploadFile(file, folder = 'uploads') {
  const fileExt = file.name.split('.').pop();
  const filePath = `${folder}/${uuidv4()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('docs')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw new Error('File upload failed: ' + uploadError.message);

  const { publicURL } = supabase.storage.from('docs').getPublicUrl(filePath);
  return publicURL;
}

export async function handleBookingSubmission(form, quote, userId, invoiceFile, packingFile) {
  const invoicePath = invoiceFile ? await uploadFile(invoiceFile) : null;
  const packingPath = packingFile ? await uploadFile(packingFile) : null;

  const payload = {
    user_id: userId,
    route_id: form.routeId,
    collections: [{ postcode: form.pickupPostcode }],
    deliveries: [{ postcode: form.deliveryPostcode }],
    pallets: [{ count: form.pallets }],
    adr: form.adr,
    amount: parseFloat(quote.total),
    base_cost: parseFloat(quote.total),
    adr_surcharge: parseFloat(quote.adrCharge),
    base_rate_override: null,
    discount_applied: null,
    internal_cost: null,
    customs_charge: quote.customsCharge,
    profit: null,
    invoice_file_url: invoicePath,
    packing_list_url: packingPath,
    status: 'Pending',
    currency: 'gbp',
    created_at: new Date().toISOString()
  };

  const { error } = await supabase.from('bookings').insert([payload]);
  if (error) throw new Error('Booking failed: ' + error.message);
}
