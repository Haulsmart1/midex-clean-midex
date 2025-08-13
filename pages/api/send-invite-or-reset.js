import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required.' });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 1. Look up user meta
  const { data: userRow } = await supabase
    .from('users')
    .select('name, role, partner_type')
    .eq('email', email)
    .single();

  if (!userRow) return res.status(200).json({ ok: false, error: "not_found" }); // Don't leak info

  // 2. Re-send invite (may be rate-limited)
  const { error } = await supabase.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        name: userRow.name,
        role: userRow.role,
        partner_type: userRow.partner_type,
      },
      redirectTo: 'https://www.midnight-xpress.com/set-password'
    }
  );
  if (error) return res.status(200).json({ ok: false, error: error.message });
  res.status(200).json({ ok: true });
}

