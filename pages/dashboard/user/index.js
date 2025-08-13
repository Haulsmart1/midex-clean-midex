'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UsersLayout from '@/components/layouts/UsersLayout';
import Link from 'next/link';
import { useSupabaseRole } from '@/lib/useSupabaseRole'; // ✅ secure role hook
import { hasRole } from '@/lib/hasRole';

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const email = session?.user?.email || null;
  const { role, loading } = useSupabaseRole(email);
  const router = useRouter();

  // Show loading while session or role is loading
  if (status === 'loading' || loading) return null;

  // Redirect if not logged in
  if (!email) {
    router.replace('/login');
    return null;
  }

  // Redirect if role is not 'user'
  if (role !== 'user') {
    router.replace('/dashboard');
    return null;
  }

  // ✅ Authorized content
  return (
    <UsersLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 32 }}>
          User Dashboard
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}
        >
          <Card title="Bookings" href="/dashboard/user/bookings" color="#1f9aff" />
          <Card title="Invoices" href="/dashboard/user/invoices" color="#ffaa00" />
          <Card title="Settings" href="/dashboard/user/settings" color="#ff4fd8" />
        </div>
      </div>
    </UsersLayout>
  );
}

function Card({ title, href, color }) {
  return (
    <Link
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
    </Link>
  );
}

