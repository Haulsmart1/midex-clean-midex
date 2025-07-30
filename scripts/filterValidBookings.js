require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TRAILER_ID = 'TRAILER_ONE';

(async () => {
  console.log('🔌 Connecting to Supabase...');

  const { data: allBookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('trailer_id', TRAILER_ID)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Supabase error:', error.message);
    process.exit(1);
  }

  if (!allBookings || allBookings.length === 0) {
    console.warn('⚠️ No bookings returned.');
    return;
  }

  console.log(`📦 Total bookings fetched: ${allBookings.length}`);

  let totalPallets = 0;
  const filtered = [];

  for (const booking of allBookings) {
    const pallets = booking.pallet_count || 0;

    if (pallets > 4) {
      console.log(`⚠️ Skipping booking with ${pallets} pallets (too big)`);
      continue;
    }

    if (filtered.length >= 6) break;
    if (totalPallets + pallets > 24) {
      console.log(`⚠️ Skipping booking – would exceed total pallet cap (${totalPallets + pallets})`);
      continue;
    }

    filtered.push(booking);
    totalPallets += pallets;

    console.log(`✅ Included: ${pallets} pallets – ${booking.goods_description}`);
  }

  console.log('\n🎯 Final Filtered Load:');
  console.log(`🧾 Consignments: ${filtered.length}`);
  console.log(`🧱 Total Pallets: ${totalPallets}`);

  // 👇 Output JSON payload or export array if needed
  // console.log(JSON.stringify(filtered, null, 2));
})();
