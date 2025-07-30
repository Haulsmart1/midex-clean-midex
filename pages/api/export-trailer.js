import { exportBundleForTrailer } from '@/utils/export/exportBundleForTrailer';

export default async function handler(req, res) {
  console.log('📡 API HIT: /api/export-trailer');
  console.log('↩️ Method:', req.method);
  console.log('🔍 Query:', req.query);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' });
  }

  const { trailerId } = req.query;

  if (!trailerId) {
    return res.status(400).json({ error: 'Missing trailerId' });
  }

  try {
    const result = await exportBundleForTrailer(trailerId);
    console.log('✅ Email sent. Details:', result);
    return res.status(200).json(result);
  } catch (err) {
    console.error('❌ Export error:', err);
    return res.status(500).json({ error: err.message });
  }
}
