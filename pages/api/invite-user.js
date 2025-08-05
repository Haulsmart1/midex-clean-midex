import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, name, role, partner_type } = req.body;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 1. Invite user and trigger SMTP email
  const { data: user, error: userError } = await supabase.auth.admin.inviteUserByEmail({
    email,
    options: {
      data: { name, role, partner_type }
    }
  });

  if (userError) return res.status(400).json({ error: userError.message });

  // 2. Insert user into your table
  const { error: dbError } = await supabase
    .from('users')
    .insert([{ 
      id: user.user.id, // Auth UID
      email, 
      name, 
      role, 
      partner_type
    }]);

  if (dbError) return res.status(400).json({ error: dbError.message });

  res.status(200).json({ success: true });
}
