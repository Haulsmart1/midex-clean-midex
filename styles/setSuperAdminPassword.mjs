import { createClient } from '@supabase/supabase-js';
import argon2 from 'argon2';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const email = 'stuart@adrcarriers.net'; // your super admin email
const password = 'Alexander12!'; // your new password

const run = async () => {
  const hash = await argon2.hash(password);

  const { data, error } = await supabase
    .from('employees')
    .update({ password: hash })
    .eq('email', email);

  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Password set for super admin');
  }
};

run();
