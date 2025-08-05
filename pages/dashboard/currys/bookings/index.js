'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const currysYellow = '#ffc600';
const currysPurple = '#6a37a3';
const bgColor = '#241a33';

export default function CurrysBookingsIndex() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace('/login');
      return;
    }
    // If you want to restrict only to admins, uncomment the next block:
    // if (!session.user.roles?.includes('currys_admin')) {
    //   router.replace('/dashboard/currys');
    //   return;
    // }
  }, [session, status, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bgColor,
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        width: '100vw',
        overflowX: 'hidden',
      }}
    >
      {/* Logout */}
      <div style={{
        position: 'fixed',
        top: 32,
        right: 36,
        zIndex: 3,
      }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            background: '#ff006d',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 30px',
            fontWeight: 700,
            fontSize: 20,
            boxShadow: '0 2px 8px #a0a',
            cursor: 'pointer'
          }}
        >
          Log Out
        </button>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        paddingTop: '7vh',
        zIndex: 2,
        position: 'relative',
      }}>
        {/* Logo and Title */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 18,
        }}>
          <div style={{
            width: 90,
            height: 90,
            borderRadius: 22,
            background: '#fff',
            marginBottom: 10,
            boxShadow: `0 0 38px 16px ${currysYellow}77, 0 0 0 7px #fff`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}>
            <img
              src="/brand-currys-logo.svg"
              alt="Currys Logo"
              style={{
                width: 60,
                height: 60,
                objectFit: "contain",
                borderRadius: 14,
                boxShadow: "0 2px 10px #552e8c33"
              }}
            />
          </div>
        </div>
        <h1 style={{
          color: currysYellow,
          fontWeight: 900,
          fontSize: '2rem',
          letterSpacing: 0.5,
          textAlign: 'center',
          marginBottom: 6,
          textShadow: '0 2px 10px #fff6, 0 1px 0 #ffc60044',
        }}>
          Currys Bookings
        </h1>
        <div style={{
          fontSize: 18,
          color: "#dfd0fa",
          marginBottom: 34,
          textAlign: "center",
        }}>
          Manage, review, and create new battery bookings for Currys clients.
        </div>

        {/* Tiles */}
        <div style={{
          display: 'flex',
          gap: '2.2rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 34
        }}>
          {/* View All Bookings */}
          <Link href="/dashboard/currys/bookings/all">
            <div style={tileStyle}>
              <div style={tileIcon}>📦</div>
              <div>
                <b>View All Bookings</b>
                <p style={tileDesc}>See all battery jobs, update status, triage, and more.</p>
              </div>
            </div>
          </Link>
          {/* New Booking */}
          <Link href="/dashboard/currys/bookings/create">
            <div style={tileStyle}>
              <div style={tileIcon}>➕</div>
              <div>
                <b>New Booking</b>
                <p style={tileDesc}>Create a new battery collection or disposal job.</p>
              </div>
            </div>
          </Link>
          {/* Reports */}
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
        {/* You can render booking tables/lists/components below this if needed */}
      </div>
    </div>
  );
}

// --- Styles ---
const tileStyle = {
  background: '#6a37a3',
  borderRadius: 18,
  padding: '24px 32px',
  color: '#fff',
  minWidth: 260,
  minHeight: 120,
  flex: '1 0 220px',
  cursor: 'pointer',
  boxShadow: '0 6px 32px #ffc60044, 0 0px 0 #552e8c44 inset',
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  transition: 'transform 0.13s, box-shadow 0.16s',
  fontSize: 18,
};

const tileIcon = {
  fontSize: 40,
  background: 'linear-gradient(135deg, #ffc600 60%, #6a37a3 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginRight: 12,
};

const tileDesc = {
  color: '#fff9',
  margin: 0,
  fontSize: 14.5,
  fontWeight: 400,
};
