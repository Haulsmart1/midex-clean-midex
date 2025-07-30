require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedDummyBookings() {
  const trailerId = 'TRAILER_ONE';
  const bookings = [];

  for (let i = 1; i <= 24; i++) {
    bookings.push({
      trailer_id: trailerId,
      consignment_ref: `DUMMY-CONS-${String(i).padStart(2, '0')}`,
      customer: `Test Customer ${i}`,
      destination: `Test City ${i}`,
      weight_kg: 100 + Math.floor(Math.random() * 900),
      pallet_count: 1 + Math.floor(Math.random() * 9),
      goods_description: `Goods batch #${i}`,
      collections: [],
      deliveries: [],
      pallets: [],
      status: 'booked',
      created_at: new Date().toISOString(),
      amount: 0
    });
  }

  const { error, data } = await supabase
    .from('bookings')
    .insert(bookings);

  if (error) {
    console.error('❌ Failed to insert dummy bookings:', error.message);
  } else if (!data) {
    console.warn('⚠️ Insert returned no data. Possible RLS block or permission issue.');
  } else {
    console.log(`✅ Inserted ${data.length} dummy consignments on ${trailerId}`);
  }
}

seedDummyBookings();
