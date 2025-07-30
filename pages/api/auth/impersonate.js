// pages/api/impersonate.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { userId } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Here you would return a token or session object for the impersonated user
  return res.status(200).json({
    message: `Impersonating user: ${user.email}`,
    user,
  });
}
