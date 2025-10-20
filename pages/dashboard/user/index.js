'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UsersLayout from '@/components/layouts/UsersLayout';
import Link from 'next/link';
import { useSupabaseRole } from '@/lib/useSupabaseRole';

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const email = session?.user?.email;
  const companyNumber = session?.user?.company_number || 'Not Provided';

  const { role, loading: roleLoading } = useSupabaseRole(email ?? '');

  const loading = status === 'loading' || roleLoading || !email;

  // Redirect logic
  useEffect(() => {
    if (loading) return;

    if (!session?.user?.email) {
      router.replace('/login');
    } else if (!role) {
      router.replace('/unauthorized');
    } else if (role !== 'user') {
      router.replace('/dashboard');
    }
  }, [loading, session, role, router]);

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          height: '100vh',
          backgroundColor: '#000',
          color: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: 20,
        }}
      >
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  if (!session?.user?.email || !role || role !== 'user') return null;

  return (
    <UsersLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
        <h1
          style={{
            fontSize: 40,
            fontWeight: 900,
            marginBottom: 20,
            background: 'linear-gradient(to right, #00f2fe, #4facfe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          tabIndex="0"
          aria-label="User Dashboard heading"
        >
          Welcome to your Dashboard
        </h1>

        <p
          style={{
            fontSize: 18,
            fontWeight: 500,
            marginBottom: 32,
            color: '#ccc',
          }}
        >
          <strong>Email:</strong> {email} <br />
          <strong>Company Number:</strong> {companyNumber}
        </p>

        <div
          role="navigation"
          aria-label="User dashboard navigation cards"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
          }}
        >
          <Card
            title="📦 Bookings"
            href="/dashboard/user/bookings"
            bg="linear-gradient(135deg, #1f9aff, #00d2ff)"
            ariaLabel="Go to Bookings page"
          />
          <Card
            title="🧾 Invoices"
            href="/dashboard/user/invoices"
            bg="linear-gradient(135deg, #ffaa00, #ff8800)"
            ariaLabel="Go to Invoices page"
          />
          <Card
            title="⚙️ Settings"
            href="/dashboard/user/settings"
            bg="linear-gradient(135deg, #ff4fd8, #c43aff)"
            ariaLabel="Go to Settings page"
          />
        </div>
      </div>
    </UsersLayout>
  );
}

function Card({ title, href, bg, ariaLabel }) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      style={{
        padding: 24,
        borderRadius: 16,
        background: bg,
        color: '#fff',
        fontWeight: 700,
        fontSize: 20,
        textDecoration: 'none',
        textAlign: 'center',
        boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
        transition: 'transform 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 120,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
    >
      <span>{title}</span>
    </Link>
  );
}
