// Updating an employee-table hash does not change the Supabase Auth password.
export default function handler(req, res) {
  return res.status(410).json({ error: 'Legacy employee password route retired. Use the sign-in password reset flow.' });
}
