// /pages/api/export-trailer-daily.js
import { supabase } from '@/lib/supabaseClient';
import { exportBundleForTrailer } from '@/utils/export/exportBundleForTrailer';

export default async function handler(req, res) {
  const { data: trailers, error } = await supabase
    .from('trailer_fill_status')
    .select('*')
    .gte('fill_percent', 95);

  if (error) return res.status(500).json({ error: 'Supabase error' });
  if (!trailers?.length) return res.status(200).json({ message: 'No trailers above 95% fill' });

  const results = [];

  for (const trailer of trailers) {
    const trailerId = `MIDEX-${trailer.from}-${trailer.to}-${trailer.date}-${trailer.time_slot}`.replace(/[\s:]/g, '-');

    try {
      const zipPath = await exportBundleForTrailer(trailerId);
      results.push({ trailerId, success: true });
    } catch (err) {
      results.push({ trailerId, error: err.message });
    }
  }

  res.status(200).json({ status: 'Complete', results });
}
