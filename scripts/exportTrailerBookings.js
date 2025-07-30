require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const { parse } = require('json2csv');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function exportTrailerBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      consignment_ref,
      customer,
      destination,
      weight_kg,
      pallet_count,
      goods_description,
      created_at
    `)
    .eq('trailer_id', 'TRAILER_ONE')
    .order('created_at', { ascending: false })
    .limit(24);

  if (error) return console.error('❌ Fetch failed:', error.message);

  const csv = parse(data);
  fs.writeFileSync('TRAILER_ONE_EXPORT.csv', csv);
  console.log('✅ CSV export complete: TRAILER_ONE_EXPORT.csv');
}

exportTrailerBookings();
