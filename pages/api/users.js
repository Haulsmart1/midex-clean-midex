// pages/api/users.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { data, error } = await supabase.from('users').select('id, name, email');

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }

  res.status(200).json({ users: data });
}
