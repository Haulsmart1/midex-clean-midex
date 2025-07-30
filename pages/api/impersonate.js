import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]'; // ✅ Corrected path

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { user } = req.body;

  if (!user || !user.id || !user.role) {
    return res.status(400).json({ message: 'Invalid user data' });
  }

  const impersonationToken = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    impersonated: true,
  };

  return res.status(200).json({ token: impersonationToken });
}
