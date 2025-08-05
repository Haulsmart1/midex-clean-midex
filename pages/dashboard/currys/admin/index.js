'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CurrysAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace('/login');
      return;
    }
    if (!session.user.roles?.includes('currys_admin')) {
      router.replace('/dashboard/currys');
      return;
    }
  }, [session, status, router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#23183a',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      padding: 0
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '2rem 2rem 0 0' }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            background: '#ff006d',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 22px',
            fontWeight: 700,
            fontSize: 18,
            cursor: 'pointer'
          }}
        >
          Log Out
        </button>
      </div>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 2rem 0 2rem', textAlign: 'center' }}>
        <img
          src="/brand-currys-logo.svg"
          alt="Currys Logo"
          style={{
            width: 100,
            height: 100,
            margin: '0 auto 18px auto',
            borderRadius: 22,
            boxShadow: '0 0 44px 16px #ffc60060'
          }}
        />
        <h1 style={{
          color: '#ffc600',
          fontWeight: 800,
          marginBottom: 10,
          letterSpacing: 1.3,
          fontSize: 36,
          textShadow: '0 4px 32px #ffc60040'
        }}>
          Currys Admin Dashboard
        </h1>
        <p style={{ color: '#ede8fc', fontSize: 18, marginBottom: 32 }}>
          Admin tools for Currys bookings, reports, and settings.
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2.5rem',
          flexWrap: 'wrap',
          marginTop: 16
        }}>
          <Link href="/dashboard/currys/bookings">
            <div style={tileStyle}><span style={tileIcon}>📦</span><div>
              <b>View All Bookings</b>
              <p style={tileDesc}>Browse, update or manage all bookings.</p>
            </div></div>
          </Link>
          <Link href="/dashboard/currys/admin/settings">
            <div style={tileStyle}><span style={tileIcon}>⚙️</span><div>
              <b>Settings</b>
              <p style={tileDesc}>Manage admin & integration settings.</p>
            </div></div>
          </Link>
          <Link href="/dashboard/currys/reports">
            <div style={tileStyle}><span style={tileIcon}>📊</span><div>
              <b>Reports</b>
              <p style={tileDesc}>Stats, download data, export reports.</p>
            </div></div>
          </Link>
        </div>
      </div>
    </div>
  );
}

const tileStyle = {
  background: '#652bb5',
  borderRadius: 18,
  padding: '28px 34px',
  color: '#fff',
  minWidth: 210,
  minHeight: 120,
  cursor: 'pointer',
  boxShadow: '0 6px 40px #ffc60038, 0 1px 8px #652bb580',
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  marginBottom: 20,
  transition: 'transform 0.12s, box-shadow 0.12s'
};

const tileIcon = {
  fontSize: 38,
  marginRight: 18,
  filter: 'drop-shadow(0 0 16px #ffc60077)'
};

const tileDesc = {
  color: '#f4e5ff',
  margin: 0,
  fontSize: 14.5,
  fontWeight: 400
};
