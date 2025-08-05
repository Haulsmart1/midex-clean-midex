// /pages/api/add-user.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, name, role, partner_type, password } = req.body;

  // Use the service role key (never expose to client!)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { error } = await supabaseAdmin
    .from('users')
    .insert([{ email, name, role, partner_type, password }]);

  if (error) return res.status(400).json({ error: error.message });
  return res.status(200).json({ success: true });
}
