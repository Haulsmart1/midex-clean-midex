// scripts/injectManchesterDummy.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const haulsmart = createClient(
  process.env.HAULSMART_SUPABASE_URL,
  process.env.HAULSMART_SUPABASE_SERVICE_KEY
);

const dummyLoads = [
  {
    origin: 'Manchester M1',
    destination: 'Birmingham B1',
    cargo_type: 'Pallets',
    weight: '800kg',
    miles: 85,
    rate_per_mile: 2.5,
    vehicle_type: 'Luton',
    equipment_type: 'Box',
    status: 'open',
    ready_now: true,
    lat: 53.4808,
    lng: -2.2426,
    created_at: new Date().toISOString(),
  },
  {
    origin: 'Manchester M3',
    destination: 'Leeds LS1',
    cargo_type: 'Boxes',
    weight: '300kg',
    miles: 42,
    rate_per_mile: 2.3,
    vehicle_type: 'Luton',
    equipment_type: 'Box',
    status: 'open',
    ready_now: true,
    lat: 53.4839,
    lng: -2.2446,
    created_at: new Date().toISOString(),
  },
  {
    origin: 'Manchester M4',
    destination: 'Liverpool L1',
    cargo_type: 'Parcels',
    weight: '500kg',
    miles: 34,
    rate_per_mile: 2.2,
    vehicle_type: 'Luton',
    equipment_type: 'Box',
    status: 'open',
    ready_now: true,
    lat: 53.4850,
    lng: -2.2390,
    created_at: new Date().toISOString(),
  }
];

const inject = async () => {
  console.log('📦 Injecting Manchester dummy loads...');
  for (const load of dummyLoads) {
    const { error } = await haulsmart.from('live_loads').insert(load);
    if (error) {
      console.error('❌ Failed to insert:', error.message);
    } else {
      console.log(`✅ Inserted load from ${load.origin} ➝ ${load.destination}`);
    }
  }
};

inject();
