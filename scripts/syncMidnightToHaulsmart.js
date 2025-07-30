// syncMidnightToHaulsmart.js

import dotenv from 'dotenv';
dotenv.config({ path: '.env' }); // or use '.env.local' if you're keeping it that way

import { createClient } from '@supabase/supabase-js';

const midnight = createClient(
  process.env.MIDNIGHT_SUPABASE_URL,
  process.env.MIDNIGHT_SUPABASE_SERVICE_KEY
);

const haulsmart = createClient(
  process.env.HAULSMART_SUPABASE_URL,
  process.env.HAULSMART_SUPABASE_SERVICE_KEY
);

const classifyRegion = (postcode = '') => {
  const pc = postcode.trim().toUpperCase();
  if (/^BT/.test(pc)) return 'NI';
  if (/^D\d|^\d{5}$/.test(pc)) return 'ROI';
  if (/^[A-Z]{1,2}\d/.test(pc)) return 'GB';
  return 'EU';
};

async function syncBookings() {
  const { data: bookings, error } = await midnight
    .from('bookings')
    .select('*')
    .eq('synced_to_haulsmart', false)
    .limit(100);

  if (error) {
    console.error('❌ Failed to fetch Midnight bookings:', error.message);
    return;
  }

  for (const booking of bookings) {
    const from = booking?.collections?.[0]?.postcode || '';
    const to = booking?.deliveries?.[0]?.postcode || '';
    const fromRegion = classifyRegion(from);
    const toRegion = classifyRegion(to);

    const isValid = (
      fromRegion === 'GB' && toRegion === 'GB'
    ) || (
      ['EU'].includes(fromRegion) || ['EU'].includes(toRegion)
    ) && !['NI', 'ROI'].includes(fromRegion) && !['NI', 'ROI'].includes(toRegion);

    if (!isValid) {
      console.log(`🚫 Skipping booking ${booking.id} — invalid route`);
      continue;
    }

    const payload = {
      origin: from,
      destination: to,
      cargo_type: booking?.goods_description || 'General Freight',
      weight: booking?.weight_kg || 'n/a',
      miles: booking?.postcode_distance || 0,
      rate_per_mile: booking?.base_rate || 1,
      vehicle_type: booking?.vehicle_type || 'unspecified',
      status: 'open',
      ready_now: true,
    };

    const { error: insertErr } = await haulsmart.from('live_loads').insert(payload);

    if (insertErr) {
      console.error(`❌ Failed to insert to Haulsmart for booking ${booking.id}:`, insertErr.message);
      continue;
    }

    await midnight
      .from('bookings')
      .update({ synced_to_haulsmart: true })
      .eq('id', booking.id);

    console.log(`✅ Synced booking ${booking.id} → Haulsmart`);
  }
}

syncBookings();
