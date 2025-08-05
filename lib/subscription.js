import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function checkStripeSubscription(userId) {
  const { data: user, error } = await supabase
    .from('users')
    .select('subscription(status), is_credit_account')
    .eq('id', userId)
    .single();

  if (error || !user) return false;

  const hasActiveStripeSub = user.subscription?.status === 'active';
  const hasCreditAccount = user.is_credit_account === true;

  return hasActiveStripeSub || hasCreditAccount;
}
