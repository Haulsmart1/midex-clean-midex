// Retired: this legacy route called a nonexistent admin method and accepted arbitrary email addresses.
export default function handler(req, res) {
  return res.status(410).json({ error: 'Legacy account reset route retired. Use the sign-in password reset flow.' });
}
