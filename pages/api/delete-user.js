import { createClient } from '@supabase/supabase-js';
import { requireSuperAdmin } from '@/lib/server/requireSuperAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const session = await requireSuperAdmin(req, res);
  if (!session) return;
  const { id } = req.body || {};
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return res.status(400).json({ error: 'Valid account ID required' });
  if (id.toLowerCase() === session.user.id.toLowerCase()) return res.status(409).json({ error: 'Cannot delete your own account' });
  let authenticationDeleted = false;
  try {

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // 1. Delete from Supabase Auth
  const { error: authError } = await supabase.auth.admin.deleteUser(id);
  if (authError) return res.status(502).json({ error: 'Unable to delete authentication account' });
  authenticationDeleted = true;

  // 2. Delete from your users table
  const { error: dbError } = await supabase.from('users').delete().eq('id', id);
  if (dbError) return res.status(500).json({ error: 'Authentication account deleted; profile cleanup requires review', partial: true });

  res.status(200).json({ success: true });
  } catch {
    if (authenticationDeleted) return res.status(500).json({ error: 'Authentication account deleted; profile cleanup requires review', partial: true });
    return res.status(503).json({ error: 'Account deletion service unavailable' });
  }
}
