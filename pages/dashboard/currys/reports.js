'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const currysYellow = '#ffc600';
const currysPurple = '#6a37a3';
const bgColor = '#241a33';

export default function CurrysReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace('/login');
      return;
    }
    if (!session.user.roles?.includes('currys_admin')) {
      router.replace('/dashboard/currys'); // <<--- Fix here
      return;
    }
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
        paddingTop: '6vh',
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
            width: 112,
            height: 112,
            borderRadius: 26,
            background: '#fff',
            marginBottom: 10,
            boxShadow: `0 0 32px 15px ${currysYellow}77, 0 0 0 7px #fff`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}>
            <img
              src="/brand-currys-logo.svg"
              alt="Currys Logo"
              style={{
                width: 75,
                height: 75,
                objectFit: "contain",
                borderRadius: 16,
                boxShadow: "0 2px 12px #552e8c66"
              }}
            />
          </div>
        </div>
        <h1 style={{
          color: currysYellow,
          fontWeight: 900,
          fontSize: '2.2rem',
          letterSpacing: 0.7,
          textAlign: 'center',
          marginBottom: 7,
          textShadow: '0 2px 8px #fff8, 0 1px 0 #ffc60077',
        }}>
          Currys Reports
        </h1>
        <div style={{
          fontSize: 19,
          color: "#dfd0fa",
          marginBottom: 36,
          textAlign: "center",
        }}>
          Download battery collection & disposal reports, stats, and exports.
        </div>

        {/* Reports Content Panel */}
        <div style={{
          background: currysPurple,
          borderRadius: 22,
          width: 540,
          minHeight: 210,
          boxShadow: `0 0 44px #ffc60055, 0 1.5px 10px #552e8c44`,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '38px 38px 28px 38px',
        }}>
          <h2 style={{
            color: currysYellow,
            fontWeight: 800,
            fontSize: 26,
            marginBottom: 18,
            textShadow: "0 2px 6px #fff4"
          }}>
            📄 Reports & Downloads
          </h2>
          <div style={{ color: "#fff", fontSize: 17, marginBottom: 22 }}>
            Download your latest booking reports, disposal logs, and more.
          </div>
          {/* Download links/buttons (dummy/placeholder for now) */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            width: "100%",
            alignItems: "center",
          }}>
            <button style={reportBtnStyle}>Download All Bookings (CSV)</button>
            <button style={reportBtnStyle}>Download Disposal Report (PDF)</button>
            <button style={reportBtnStyle}>Export Stats (XLSX)</button>
          </div>
          <div style={{
            marginTop: 28, color: "#ffc600bb", fontSize: 15, fontStyle: "italic",
          }}>
            Want more? Let us know what stats you need.
          </div>
        </div>
        {/* Back to Dashboard */}
        <Link href="/dashboard/currys/admin" style={{
          color: currysYellow,
          textDecoration: "underline",
          marginTop: 38,
          fontWeight: 600,
          fontSize: 17,
          display: "inline-block"
        }}>
          ← Back to admin dashboard
        </Link>
      </div>
    </div>
  );
}

const reportBtnStyle = {
  background: '#fff',
  color: '#6a37a3',
  fontWeight: 800,
  fontSize: 17,
  padding: "13px 32px",
  borderRadius: 12,
  border: 'none',
  cursor: 'pointer',
  marginBottom: 0,
  boxShadow: "0 2px 24px #ffc6004a, 0 1.5px 10px #552e8c28",
  transition: 'background .15s, color .13s',
};
