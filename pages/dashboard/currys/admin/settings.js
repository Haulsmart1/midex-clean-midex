'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const currysYellow = '#ffc600';
const currysPurple = '#6a37a3';
const bgColor = '#23183a';

export default function CurrysAdminSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Example state for settings (these would really come from your backend/API)
  const [settings, setSettings] = useState({
    notificationEmail: 'admin@currys.co.uk',
    autoApproveBookings: false,
    enableReportsExport: true,
  });

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

  // Handler for toggling boolean settings
  const handleToggle = key => {
    setSettings(s => ({ ...s, [key]: !s[key] }));
    // Here you’d call your API to save the change
  };

  const handleChange = e => {
    setSettings(s => ({ ...s, [e.target.name]: e.target.value }));
    // Save to API here
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: bgColor,
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      width: '100vw',
      overflowX: 'hidden',
    }}>
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
        maxWidth: 560,
        margin: '0 auto',
        padding: '3.5rem 1.5rem 1.5rem 1.5rem',
        textAlign: 'center'
      }}>
        <img
          src="/brand-currys-logo.svg"
          alt="Currys Logo"
          style={{
            width: 88,
            height: 88,
            margin: '0 auto 10px auto',
            borderRadius: 20,
            boxShadow: '0 0 44px 14px #ffc60060'
          }}
        />
        <h1 style={{
          color: currysYellow,
          fontWeight: 900,
          fontSize: 32,
          margin: '0 0 20px 0'
        }}>
          Currys Admin Settings
        </h1>
        <div style={{
          background: currysPurple,
          borderRadius: 20,
          boxShadow: '0 2px 36px #ffc60033, 0 1px 8px #652bb590',
          padding: '38px 32px',
          marginBottom: 20,
        }}>
          <form>
            {/* Notification Email */}
            <div style={{ marginBottom: 32, textAlign: 'left' }}>
              <label style={{ fontWeight: 700, color: currysYellow, fontSize: 16 }}>
                Notification Email
              </label>
              <input
                type="email"
                name="notificationEmail"
                value={settings.notificationEmail}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  marginTop: 6,
                  fontSize: 16,
                  borderRadius: 7,
                  border: 'none',
                  marginBottom: 0,
                  background: '#fff',
                  color: currysPurple,
                  fontWeight: 600,
                  boxShadow: '0 1.5px 12px #ffc6001a'
                }}
              />
            </div>
            {/* Auto-Approve Bookings */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 24,
              justifyContent: 'space-between',
            }}>
              <span style={{ fontWeight: 700, color: currysYellow, fontSize: 16 }}>
                Auto-approve New Bookings
              </span>
              <input
                type="checkbox"
                checked={settings.autoApproveBookings}
                onChange={() => handleToggle('autoApproveBookings')}
                style={{ width: 22, height: 22, accentColor: currysYellow }}
              />
            </div>
            {/* Enable Reports Export */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 30,
              justifyContent: 'space-between',
            }}>
              <span style={{ fontWeight: 700, color: currysYellow, fontSize: 16 }}>
                Enable Reports Export
              </span>
              <input
                type="checkbox"
                checked={settings.enableReportsExport}
                onChange={() => handleToggle('enableReportsExport')}
                style={{ width: 22, height: 22, accentColor: currysYellow }}
              />
            </div>
            {/* Save Button (does nothing for now) */}
            <button type="button"
              style={{
                background: currysYellow,
                color: currysPurple,
                fontWeight: 900,
                fontSize: 17,
                padding: "14px 30px",
                borderRadius: 11,
                border: 'none',
                cursor: 'pointer',
                marginTop: 8,
                marginBottom: 0,
                boxShadow: "0 2px 20px #fff4",
                transition: 'background .15s, color .13s',
              }}>
              Save Settings
            </button>
          </form>
        </div>
        <Link href="/dashboard/currys/admin" style={{
          color: currysYellow,
          textDecoration: "underline",
          fontWeight: 600,
          fontSize: 17,
          display: "inline-block"
        }}>
          ← Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}
