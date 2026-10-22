import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function AuthRedirect() {
  const router = useRouter();
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === 'loading') return;
    if (status !== 'authenticated' || !session?.user) {
      router.replace('/login');
      return;
    }
    const roles = [session.user.role, ...(Array.isArray(session.user.roles) ? session.user.roles : [])]
      .filter(Boolean).map(value => String(value).toLowerCase());
    const destinations = [
      ['super_admin', '/dashboard/admin/super'],
      ['admin', '/dashboard/admin'],
      ['currys_admin', '/dashboard/currys'],
      ['forwarder', '/dashboard/forwarder'],
      ['customs_agent', '/dashboard/customs'],
      ['user', '/dashboard/user'],
      ['partner', '/dashboard/partner'],
    ];
    const destination = destinations.find(([role]) => roles.includes(role))?.[1] || '/login';
    router.replace(destination);
  }, [status, session, router]);

  return <main role="status" aria-live="polite" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
    Completing Midnight Express sign-in…
  </main>;
}
