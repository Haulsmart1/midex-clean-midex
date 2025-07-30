import { createClient } from '@supabase/supabase-js';
import argon2 from 'argon2';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const run = async () => {
  const email = 'stuart@adrcarriers.net';
  const newPassword = 'Alexander12!'; // or whatever password you want
  const hash = await argon2.hash(newPassword);

  const { error } = await supabase
    .from('employees')
    .update({ password: hash })
    .eq('email', email);

  if (error) {
    console.error('❌ Update failed:', error);
  } else {
    console.log('✅ Super Admin password updated successfully');
  }
};

run();
