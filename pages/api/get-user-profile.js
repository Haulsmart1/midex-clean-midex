import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { sessionIsCurrent } from '@/lib/server/sessionPolicy.cjs';

// The server-issued session is canonical; arbitrary-email profile enumeration is retired.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!sessionIsCurrent(session)) return res.status(401).json({ error: 'Sign in again to view your profile' });
    const { email } = req.body || {};
    if (email !== undefined && (typeof email !== 'string' || email.trim().toLowerCase() !== session.user.email?.toLowerCase())) {
      return res.status(403).json({ error: 'Cannot access another account profile' });
    }
    return res.status(200).json({ role: session.user.role || null, roles: session.user.roles || [], partner_type: session.user.partner_type || null });
  } catch {
    return res.status(503).json({ error: 'Profile service unavailable' });
  }
}
