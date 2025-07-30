// pages/api/trailer-loads.js

import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('trailer_id, pallets')
      .not('trailer_id', 'is', null);

    if (error) throw error;

    const grouped = {};

    data.forEach(({ trailer_id, pallets }) => {
      if (!grouped[trailer_id]) {
        grouped[trailer_id] = { bookings: 0, pallets: 0 };
      }

      grouped[trailer_id].bookings += 1;
      grouped[trailer_id].pallets += pallets?.length || 0;
    });

    return res.status(200).json({ success: true, loads: grouped });

  } catch (err) {
    console.error('❌ Error fetching trailer loads:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
