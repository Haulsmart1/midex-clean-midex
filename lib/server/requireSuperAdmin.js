import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { sessionIsCurrent } from './sessionPolicy.cjs';

// Global account operations require the server-issued super_admin role.
// Tenant administrators must wait for an authoritative membership model.
export async function requireSuperAdmin(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!sessionIsCurrent(session)) {
      res.status(401).json({ error: 'Sign in again to manage accounts' });
      return null;
    }
    const roles = Array.isArray(session.user.roles) ? session.user.roles : [];
    if (![...roles, session.user.role].some((role) => role === 'super_admin')) {
      res.status(403).json({ error: 'Super administrator access required' });
      return null;
    }
    return session;
  } catch {
    res.status(503).json({ error: 'Account authorization unavailable' });
    return null;
  }
}
