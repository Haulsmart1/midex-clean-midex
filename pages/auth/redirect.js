import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function AuthRedirect() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === 'loading') return;
    if (status !== 'authenticated' || !session?.user) {
      setFailed(true);
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
    const destination = destinations.find(([role]) => roles.includes(role))?.[1];
    if (destination) router.replace(destination);
    else setFailed(true);
  }, [status, session, router]);

  return <main role="status" aria-live="polite" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#07111f', color: '#fff', padding: 24 }}>
    {failed ? <div style={{ maxWidth: 440, lineHeight: 1.7, textAlign: 'center' }}><h1>Sign-in could not be completed</h1><p>Your email link may have been verified, but Midnight Express could not establish your website session or approved access. Please do not repeatedly request another email.</p><Link href="/login" style={{ color: '#c6eaff' }}>Return to login</Link></div> : 'Completing Midnight Express sign-in…'}
  </main>;
}
