require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TRAILER_ID = 'TRAILER_ONE';

(async () => {
  console.log('🔌 Connecting to Supabase...');

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      consignment_ref,
      customer,
      destination,
      weight_kg,
      pallet_count,
      goods_description,
      trailer_id,
      status,
      created_at
    `)
    .eq('trailer_id', TRAILER_ID)
    .order('created_at', { ascending: false })
    .limit(6); // 🚚 Only 6 consignments per trailer

  if (error) {
    console.error('❌ Supabase error:', error.message);
    process.exit(1);
  }

  if (!bookings || bookings.length === 0) {
    console.warn('⚠️ No data returned. Check trailer_id and DB records.');
    return;
  }

  console.log(`✅ Fetched ${bookings.length} booking(s):\n`);

  let totalPallets = 0;
  const seenDescriptions = new Set();

  bookings.forEach((booking, idx) => {
    const pallets = booking.pallet_count || 0;
    const desc = booking.goods_description?.trim() || 'UNKNOWN';

    totalPallets += pallets;
    seenDescriptions.add(desc);

    console.log(`#${idx + 1} → ${pallets} pallets – ${desc}`);
    if (pallets > 4) {
      console.warn(`⚠️ Booking ${idx + 1} exceeds 4 pallet max!`);
    }
  });

  console.log(`\n📦 Total pallets: ${totalPallets}`);
  if (totalPallets > 24) {
    console.error('❌ Trailer load exceeds 24 pallet limit!');
  } else {
    console.log('✅ Pallet count OK (≤ 24)');
  }

  console.log(`🧬 Unique product types: ${seenDescriptions.size}`);
})();
