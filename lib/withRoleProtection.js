'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSupabaseRole } from '@/lib/useSupabaseRole';

export function withRoleProtection(PageComponent, allowedRoles = []) {
  return function ProtectedPage(props) {
    const { data: session, status } = useSession();
    const email = session?.user?.email || null;
    const { role, loading } = useSupabaseRole(email);
    const router = useRouter();

    // Loading state
    if (status === 'loading' || loading) {
      return <div>Loading...</div>;
    }

    // Redirect if not logged in
    if (!email) {
      router.push('/login');
      return null;
    }

    // Redirect if role not allowed
    if (!allowedRoles.includes(role)) {
      router.push('/access-denied');
      return null;
    }

    return <PageComponent {...props} role={role} />;
  };
}

