import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id } = req.body;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 1. Delete from Supabase Auth
  const { error: authError } = await supabase.auth.admin.deleteUser(id);
  if (authError) return res.status(400).json({ error: authError.message });

  // 2. Delete from your users table
  const { error: dbError } = await supabase.from('users').delete().eq('id', id);
  if (dbError) return res.status(400).json({ error: dbError.message });

  res.status(200).json({ success: true });
}
