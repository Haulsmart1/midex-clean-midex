// pages/api/reset-user-password.js

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, email } = req.body;

  if (!id || !email) return res.status(400).json({ error: "Missing user ID or email." });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // This will send a password reset email to the user
  const { error } = await supabase.auth.admin.resetPasswordForEmail(email, {
    redirectTo: 'https://www.midnight-xpress.com/reset-password'
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}

