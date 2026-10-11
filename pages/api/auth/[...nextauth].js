import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export { authOptions };

export default function authHandler(req, res) {
  if (!process.env.NEXTAUTH_SECRET) {
    return res.status(503).json({ error: 'Authentication is not configured' });
  }
  return NextAuth(req, res, authOptions);
}
