import { createClient } from '@supabase/supabase-js';
import { requireSuperAdmin } from '@/lib/server/requireSuperAdmin';

const roles = new Set(['admin', 'super_admin', 'partner', 'forwarder', 'distributor', 'manufacturer', 'supplier']);
const accountTypes = new Set(['cash', 'credit', 'supplier']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!await requireSuperAdmin(req, res)) return;
  const { email, role, account_type, invoice_company_id = null } = req.body || {};
  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || !roles.has(role) || !accountTypes.has(account_type)) return res.status(400).json({ error: 'Invalid invitation details' });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXTAUTH_URL) return res.status(503).json({ error: 'Invitation service is not configured' });
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  try {
    const { data, error } = await client.auth.admin.inviteUserByEmail(email.trim().toLowerCase(), { redirectTo: new URL('/set-password', process.env.NEXTAUTH_URL).href });
    if (error || !data?.user) return res.status(400).json({ error: 'Unable to invite this user' });
    const { error: profileError } = await client.from('users').upsert({ id: data.user.id, email: data.user.email, role, roles: [role], account_type, invoice_company_id }, { onConflict: 'id' });
    if (profileError) return res.status(502).json({ error: 'Invitation sent, but account details could not be saved. Contact an administrator before retrying.' });
    return res.status(200).json({ success: true });
  } catch {
    return res.status(502).json({ error: 'Invitation service unavailable' });
  }
}
