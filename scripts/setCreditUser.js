// pages/api/set-credit-account.js

import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || req.method !== 'POST') return res.status(403).end();

  const { userId, is_credit_account } = JSON.parse(req.body);

  const { data, error } = await supabase
    .from('users')
    .update({ is_credit_account })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Supabase update error:', error);
    return res.status(500).json({ error: 'Failed to update credit account' });
  }

  res.json(data);
}
