// pages/api/subscription-status.js

import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const userId = req.query.userId || session?.user?.id;

  if (!userId) {
    return res.status(401).json({ active: false });
  }

  const { data: user, error } = await supabase
    .from('users') // make sure this matches your table
    .select('subscription, is_credit_account')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return res.status(404).json({ active: false });
  }

  const active =
    user.subscription?.status === 'active' || user.is_credit_account === true;

  return res.json({ active });
}
