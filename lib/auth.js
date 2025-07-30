// 📁 File: /lib/auth.js

import { getSession } from 'next-auth/react';

export async function requireRole(ctx, role) {
  const session = await getSession(ctx);
  if (!session || session.user.role !== role) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    };
  }
  return { props: {} };
}

export async function getUserRole(ctx) {
  const session = await getSession(ctx);
  return session?.user?.role || null;
}

export async function getUser(ctx) {
  const session = await getSession(ctx);
  return session?.user || null;
}
