'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import ForwarderLayout from '@/components/layouts/ForwarderLayout';
import styles from '@/styles/ForwarderDashboard.module.css';

export default function ForwarderDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const roles = Array.isArray(session?.user?.roles)
    ? session.user.roles
    : [session?.user?.role].filter(Boolean);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) return router.replace('/login');
    if (!roles.includes('forwarder')) return router.replace('/dashboard');
  }, [session, status, router, roles]);

  if (status === 'loading' || !session) return <div>Loading...</div>;
  if (!roles.includes('forwarder')) return <div>Redirecting...</div>;

  const forwarderLinks = [
    { href: '/dashboard/forwarder/bookings/create', label: '➕ Create Booking' },
    { href: '/dashboard/forwarder/bookings', label: '📦 View Bookings' },
    { href: '/dashboard/forwarder/invoices', label: '🧾 View Invoices' },
    { href: '/dashboard/forwarder/commission', label: '💰 Commission Report' },
    { href: '/dashboard/forwarder/settings', label: '⚙️ Settings' },
  ];

  return (
    <ForwarderLayout>
      <Head>
        <title>🚚 Forwarder Dashboard</title>
      </Head>

      <div className={styles.dashboardWrapper}>
        <h1 className={styles.title}>🚚 Forwarder Dashboard</h1>

        <div className={styles.cardGrid}>
          {forwarderLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={styles.navCard}>
              {label}
            </Link>
          ))}
        </div>

        <div className={styles.tipBox}>
          <h4>📌 Helpful Tips</h4>
          <ul>
            <li>✅ Easily create bookings using the plus button.</li>
            <li>✅ Track your bookings in one place.</li>
            <li>✅ Download invoices & view commissions anytime.</li>
            <li>✅ Manage your profile & preferences under Settings.</li>
          </ul>
        </div>
      </div>
    </ForwarderLayout>
  );
}
