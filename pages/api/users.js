// pages/api/users.js

import { createClient } from '@supabase/supabase-js';
import { requireSuperAdmin } from '@/lib/server/requireSuperAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!await requireSuperAdmin(req, res)) return;
  try {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.from('users').select('id, name, email');

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }

  res.status(200).json({ users: data });
  } catch {
    return res.status(503).json({ error: 'Account service unavailable' });
  }
}
