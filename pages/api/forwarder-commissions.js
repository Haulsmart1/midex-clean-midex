// ✅ /pages/api/forwarder-commissions.js

import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { forwarder_id, commission_land, commission_ferry } = req.body;

  if (!forwarder_id) {
    return res.status(400).json({ error: 'Missing forwarder_id' });
  }

  const { error } = await supabase
    .from('forwarder_commissions')
    .upsert(
      [
        {
          forwarder_id,
          commission_land: Number(commission_land) || 0,
          commission_ferry: Number(commission_ferry) || 0,
          updated_at: new Date().toISOString()
        }
      ],
      { onConflict: 'forwarder_id' }
    );

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
