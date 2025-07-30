// 🔐 /pages/api/haulsync.js

import { createClient } from '@supabase/supabase-js';

const MIDNIGHT_SUPABASE_URL = process.env.MIDNIGHT_SUPABASE_URL;
const MIDNIGHT_SUPABASE_SERVICE_KEY = process.env.MIDNIGHT_SUPABASE_SERVICE_KEY;

const HAULSMART_SUPABASE_URL = process.env.HAULSMART_SUPABASE_URL;
const HAULSMART_SUPABASE_SERVICE_KEY = process.env.HAULSMART_SUPABASE_SERVICE_KEY;

const midnight = createClient(MIDNIGHT_SUPABASE_URL, MIDNIGHT_SUPABASE_SERVICE_KEY);
const haulsmart = createClient(HAULSMART_SUPABASE_URL, HAULSMART_SUPABASE_SERVICE_KEY);

const classifyRegion = (postcode = '') => {
  const trimmed = postcode.trim().toUpperCase();
  if (/^BT/.test(trimmed)) return 'NI';
  if (/^D\d|^\d{5}$/.test(trimmed)) return 'ROI';
  if (/^[A-Z]{1,2}\d/.test(trimmed)) return 'GB';
  return 'EU';
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const booking = req.body;

  try {
    const from = booking?.collectionPoints?.[0]?.postcode || '';
    const to = booking?.deliveryPoints?.[0]?.postcode || '';

    const fromRegion = classifyRegion(from);
    const toRegion = classifyRegion(to);

    // ✅ If it's a cross-channel leg → push the UK leg only: collection → Beeches Depot
    const beechesDepotPostcode = 'CA6 4SG';

    const valid =
      (fromRegion === 'GB' && toRegion === 'GB') ||
      (fromRegion === 'GB' && toRegion === 'NI') ||
      (fromRegion === 'NI' && toRegion === 'GB') ||
      (fromRegion === 'EU' && toRegion === 'GB') ||
      (fromRegion === 'GB' && toRegion === 'EU');

    if (!valid) {
      return res
        .status(200)
        .json({ status: 'skipped', reason: `Not a valid UK leg: ${fromRegion} → ${toRegion}` });
    }

    // 🔁 Always transform to Beechers if it’s a cross-channel
    const payload = {
      origin: from,
      destination:
        toRegion === 'GB'
          ? to
          : beechesDepotPostcode,
      cargo_type: booking?.pallets?.[0]?.description || 'General',
      weight: booking?.pallets?.[0]?.weight || 'n/a',
      miles: booking?.quote?.milesToDepotA || 0, // only the UK leg
      rate_per_mile: booking?.quote?.rate || 1,
      vehicle_type: booking?.quote?.vehicle || 'unknown',
      user_id: booking?.user_id || null,
      status: 'open',
    };

    console.log('🔄 Haulsmart payload:', payload);

    const { error } = await haulsmart.from('live_loads').insert(payload);

    if (error) {
      console.error('❌ Failed to post to Haulsmart:', error.message);
      return res
        .status(500)
        .json({ error: 'Post to Haulsmart failed', detail: error.message });
    }

    return res.status(200).json({ status: 'success', posted: payload });

  } catch (err) {
    console.error('🔥 Internal error:', err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err.message });
  }
}
