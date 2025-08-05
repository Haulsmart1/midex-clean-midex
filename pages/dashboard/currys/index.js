'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const currysYellow = '#ffc600';
const currysPurple = '#6a37a3';
const bgColor = '#241a33';

export default function CurrysDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If you want only Currys users allowed, add checks here.
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace('/login');
      return;
    }
    // If you want to lock to certain roles only:
    // if (!session.user.roles?.some(r => ["currys_admin", "currys_user"].includes(r))) {
    //   router.replace('/dashboard');
    //   return;
    // }
  }, [session, status, router]);

  const isCurrysAdmin = session?.user?.roles?.includes('currys_admin');

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
      {/* Main content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        paddingTop: '7vh',
        zIndex: 2,
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 18,
        }}>
          <div style={{
            width: 140,
            height: 140,
            borderRadius: 34,
            background: '#fff',
            marginBottom: 8,
            boxShadow: `0 0 44px 18px ${currysYellow}77, 0 0 0 7px #fff`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}>
            <img
              src="/brand-currys-logo.svg"
              alt="Currys Logo"
              style={{
                width: 100,
                height: 100,
                objectFit: "contain",
                borderRadius: 20,
                boxShadow: "0 2px 10px #552e8c33"
              }}
            />
          </div>
        </div>
        {/* Title */}
        <h1 style={{
          color: currysYellow,
          fontWeight: 900,
          fontSize: '2.3rem',
          letterSpacing: 0.6,
          textAlign: 'center',
          marginBottom: 4,
          textShadow: '0 2px 14px #fff8, 0 1px 0 #ffc60077',
        }}>
          Currys Dashboard
        </h1>
        {/* Subtitle */}
        <div style={{
          fontSize: 19,
          color: "#f5eaff",
          marginBottom: 4,
          textAlign: "center",
        }}>
          Welcome to the Currys booking platform.
        </div>
        <div style={{
          fontSize: 17,
          color: "#dfd0fa",
          marginBottom: 34,
          textAlign: "center",
        }}>
          Use the quick links below to manage bookings, reports, and more.
        </div>
        {/* --- Yellow Panel Background (behind grid) --- */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: "350px",
          transform: "translateX(-50%)",
          width: "640px",
          height: "285px",
          background: currysYellow,
          opacity: 0.21,
          borderRadius: "38px",
          filter: "blur(13px)",
          boxShadow: `0 0 80px 0 ${currysYellow}`,
          zIndex: 1,
          pointerEvents: "none",
        }}></div>
        {/* --- Dashboard Tile Grid --- */}
        <div style={{
          display: 'flex',
          gap: '2.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: 0,
          marginBottom: 16,
          zIndex: 2,
        }}>
          <DashboardTile
            href="/dashboard/currys/bookings"
            icon={<TileIconYellow />}
            title="View Bookings"
            desc="See and manage all battery bookings."
          />
          <DashboardTile
            href="/dashboard/currys/reports"
            icon={<TileIconSheet />}
            title="Reports"
            desc="View stats and download booking & disposal reports."
          />
          {isCurrysAdmin && (
            <DashboardTile
              href="/dashboard/currys/admin"
              icon={<TileIconAdmin />}
              title="Admin"
              desc="Currys admin dashboard and settings."
            />
          )}
        </div>
      </div>
    </div>
  );
}

// --- Dashboard Tile Component ---
function DashboardTile({ href, icon, title, desc, style }) {
  return (
    <Link href={href} legacyBehavior>
      <a style={{
        background: currysPurple,
        borderRadius: 20,
        width: 240,
        height: 145,
        boxShadow: `0 0 24px #ffc60066, 0 1.5px 8px #552e8c44`,
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        padding: '20px 18px 16px 22px',
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 0.12s, box-shadow 0.14s',
        overflow: 'hidden',
        ...style,
      }}
        tabIndex={0}
        aria-label={title}
        onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.033)'; e.currentTarget.style.boxShadow = `0 0 40px #ffc60099, 0 10px 32px #552e8c44`; }}
        onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 0 24px #ffc60066, 0 1.5px 8px #552e8c44`; }}
      >
        <span style={{
          fontSize: 32,
          marginBottom: 9,
        }}>{icon}</span>
        <b style={{
          color: currysYellow,
          fontSize: 16.5,
          fontWeight: 800,
          letterSpacing: '.01em',
          marginBottom: 4,
          textShadow: "0 1px 2px #221",
        }}>{title}</b>
        <span style={{
          color: "#fff",
          fontSize: 13.5,
          fontWeight: 400,
          lineHeight: 1.28,
          opacity: 0.94,
        }}>{desc}</span>
      </a>
    </Link>
  );
}

// --- SVG ICONS (Currys Yellow style) ---
function TileIconYellow() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32">
      <polygon fill="#ffc600" points="16,5 27,12 27,24 16,29 5,24 5,12" />
    </svg>
  );
}
function TileIconSheet() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32">
      <rect x="7" y="6" width="18" height="22" rx="3" fill="#ffc600" />
      <rect x="10" y="12" width="12" height="2.2" fill="#fff" opacity=".5"/>
      <rect x="10" y="16" width="12" height="2.2" fill="#fff" opacity=".5"/>
      <rect x="10" y="20" width="7" height="2.2" fill="#fff" opacity=".5"/>
    </svg>
  );
}
function TileIconAdmin() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="12" fill="#ffc600" />
      <rect x="14" y="9" width="4" height="14" fill="#fff" opacity=".5"/>
      <rect x="9" y="14" width="14" height="4" fill="#fff" opacity=".5"/>
    </svg>
  );
}
