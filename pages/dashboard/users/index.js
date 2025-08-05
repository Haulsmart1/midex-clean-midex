'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) return router.replace('/login');

    async function verify() {
      try {
        const res = await fetch(`/api/subscription-status?userId=${session.user.id}`);
        const { active } = await res.json();
        if (!active) return router.replace('/paywall');
        setIsSubscribed(true);
      } catch (err) {
        console.error('Subscription check failed:', err);
        router.replace('/paywall');
      }
    }

    verify();
  }, [session, status]);

  if (!isSubscribed) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #10002b, #240046, #3c096c)',
      color: '#fff',
      fontFamily: 'Poppins, sans-serif',
      padding: '40px 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
        }}>
          <h1 style={{ fontSize: 36, fontWeight: 800 }}>User Dashboard</h1>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              background: '#fff',
              color: '#000',
              padding: '10px 24px',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            }}
          >
            Log Out
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
        }}>
          <Card title="Bookings" href="/dashboard/users/bookings" color="#1f9aff" />
          <Card title="Invoices" href="/dashboard/users/invoices" color="#ffaa00" />
          <Card title="Settings" href="/dashboard/users/settings" color="#ff4fd8" />
        </div>
      </div>
    </div>
  );
}

function Card({ title, href, color }) {
  return (
    <a
      href={href}
      style={{
        padding: 24,
        borderRadius: 14,
        background: '#0a192f',
        color: '#fff',
        fontWeight: 600,
        fontSize: 18,
        textDecoration: 'none',
        textAlign: 'center',
        border: `2px solid ${color}`,
        transition: 'all 0.25s ease',
      }}
    >
      {title}
    </a>
  );
}
