import { supabase } from '@/lib/supabaseClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Legacy booking collection. Reads are restricted to the verified session owner.
// Writes are disabled until a server-authoritative quotation and booking approval
// workflow has been built. Use the separate Midnight Commercial enquiry process.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let session;
  try {
    session = await getServerSession(req, res, authOptions);
  } catch {
    return res.status(503).json({ error: 'Authentication cannot be verified.' });
  }
  const userId = session?.user?.id;
  if (!userId || typeof userId !== 'string') {
    return res.status(401).json({ error: 'Sign in to access your bookings.' });
  }

  if (req.method === 'POST') {
    return res.status(410).json({
      error: 'Automated booking is disabled until operations approves a server-verified quotation. No booking has been created.',
    });
  }

  // Do not allow callers to choose another account through user_id.
  const requestedUserId = req.query?.user_id;
  if (requestedUserId !== undefined && requestedUserId !== userId) {
    return res.status(403).json({ error: 'Booking access denied.' });
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) return res.status(503).json({ error: 'Bookings are temporarily unavailable.' });
    return res.status(200).json(data || []);
  } catch {
    return res.status(503).json({ error: 'Bookings are temporarily unavailable.' });
  }
}
