import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Case-insensitive helper query
    const tryTable = async (table, selectFields = 'role, partner_type') => {
      const { data, error } = await supabase
        .from(table)
        .select(selectFields)
        .ilike('email', email)
        .maybeSingle();
      if (error) console.warn(`Query error on ${table}:`, error.message);
      return data || null;
    };

    // 1️⃣ Check `users` table
    let profile = await tryTable('users');
    if (profile) return res.status(200).json(profile);

    // 2️⃣ Check `employees` table
    profile = await tryTable('employees');
    if (profile) return res.status(200).json(profile);

    // 3️⃣ Check `admins` table (join with employees for email + partner_type)
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select(`
        role,
        employees!inner(email, partner_type)
      `)
      .eq('role', 'super_admin')
      .ilike('employees.email', email)
      .maybeSingle();

    if (adminError) {
      console.warn('Query error on admins:', adminError.message);
    }

    if (adminData) {
      return res.status(200).json({
        role: adminData.role,
        partner_type: adminData.employees?.partner_type || null,
      });
    }

    // ❌ No match found
    return res.status(404).json({ error: 'User not found' });

  } catch (err) {
    console.error('Unexpected API error:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}

