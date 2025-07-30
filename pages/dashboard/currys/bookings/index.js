'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
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
      router.replace('/dashboard/admin');
      return;
    }
  }, [session, status, router]);

  return (
    <div style={{
      background: '#111',
      minHeight: '100vh',
      color: '#fff',
      padding: '0',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '2rem 2rem 0 0' }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="btn btn-danger"
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
      <div style={{ maxWidth: 950, margin: '0 auto', padding: '1rem 2rem' }}>
        <h1 style={{ color: '#ffc600', fontWeight: 800, marginBottom: 12, letterSpacing: 0.5 }}>
          Currys Admin Dashboard
        </h1>
        <p style={{ color: '#ccc', fontSize: 19 }}>
          This is your Currys admin dashboard. Use the quick links below to manage battery bookings and users.
        </p>
        <div style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          marginTop: 40
        }}>
          {/* Dashboard Tile: Bookings */}
          <Link href="/dashboard/currys/bookings">
            <div style={tileStyle}>
              <div style={tileIcon}>📦</div>
              <div>
                <b>View All Bookings</b>
                <p style={tileDesc}>See all battery jobs, update status, triage, and more.</p>
              </div>
            </div>
          </Link>
          {/* Dashboard Tile: Create */}
          <Link href="/dashboard/currys/bookings/create">
            <div style={tileStyle}>
              <div style={tileIcon}>➕</div>
              <div>
                <b>New Booking</b>
                <p style={tileDesc}>Create a new battery collection or disposal job.</p>
              </div>
            </div>
          </Link>
          {/* Dashboard Tile: Users */}
          <Link href="/dashboard/currys/users">
            <div style={tileStyle}>
              <div style={tileIcon}>👥</div>
              <div>
                <b>Manage Users</b>
                <p style={tileDesc}>Invite, remove, or update Currys booking users.</p>
              </div>
            </div>
          </Link>
          {/* Dashboard Tile: Reports */}
          <Link href="/dashboard/currys/reports">
            <div style={tileStyle}>
              <div style={tileIcon}>📊</div>
              <div>
                <b>Reports</b>
                <p style={tileDesc}>View stats and download booking & disposal reports.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const tileStyle = {
  background: '#181e26',
  borderRadius: 14,
  padding: '22px 28px',
  color: '#fff',
  minWidth: 250,
  minHeight: 110,
  flex: '1 0 220px',
  cursor: 'pointer',
  boxShadow: '0 4px 24px #0004, 0 0px 0 #0cf3 inset',
  display: 'flex',
  gap: 18,
  alignItems: 'center',
  transition: 'transform 0.1s',
};

const tileIcon = {
  fontSize: 38,
  background: 'linear-gradient(135deg, #ffda47 60%, #0cf 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const tileDesc = {
  color: '#e0e0e0',
  margin: 0,
  fontSize: 14.5,
  fontWeight: 400,
};

