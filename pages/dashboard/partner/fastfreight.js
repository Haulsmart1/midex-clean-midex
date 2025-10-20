'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import config from '@/components/partners/fastfreightConfig';

export default function PartnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const partnerSlug = "fastfreight";
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated || status === 'loading') return;

    if (!session) {
      router.replace('/login');
      return;
    }

    const roles = Array.isArray(session?.user?.roles)
      ? session.user.roles.map(r => r?.toLowerCase())
      : [session?.user?.role?.toLowerCase()].filter(Boolean);

    if (!roles.includes('partner')) {
      router.replace('/dashboard');
    }
  }, [session, status, hydrated, router]);

  if (!hydrated || status === 'loading') return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(145deg, #002b5c 0%, #003e7e 100%)`,
      color: '#ffffff',
      fontFamily: 'Poppins, Arial, sans-serif',
      padding: 32
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 28
        }}>
          <h1 style={{
            fontSize: 38,
            fontWeight: 800,
            background: `linear-gradient(to right, #dcefff, #ffffff)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: 1
          }}>
            {config.name} Dashboard
          </h1>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              background: '#ffffff',
              color: '#002b5c',
              padding: '10px 22px',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              transition: '0.3s ease',
              fontSize: 14
            }}
            aria-label="Log out"
          >
            Log Out
          </button>
        </div>

        <div style={{
          display: 'flex',
          gap: 24,
          flexWrap: 'wrap',
          marginBottom: 32
        }}>
          <Card title="Bookings" href={`/dashboard/partner/${partnerSlug}/bookings`} color="#5eb3f3" />
          <Card title="Finance" href={`/dashboard/partner/${partnerSlug}/finance`} color="#9d7eff" />
          <Card title="Settings" href={`/dashboard/partner/${partnerSlug}/settings`} color="#00c2b2" />
          <Card
            title="Coverage"
            content={
              config.coverageAreas?.length
                ? (
                  <div style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 6 }}>
                    {config.coverageAreas.map((code, i) => (
                      <span key={i} style={{
                        display: 'inline-block',
                        background: '#021e3f',
                        border: '1px solid #84baf2',
                        borderRadius: 6,
                        padding: '4px 10px',
                        marginRight: 6,
                        marginBottom: 6,
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#d4eaff',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                      }}>{code}</span>
                    ))}
                  </div>
                )
                : 'N/A'
            }
          />
        </div>
      </div>
    </div>
  );
}

function Card({ title, content, href, color }) {
  const isLink = !!href;

  const baseStyle = {
    flex: '1 1 260px',
    padding: 24,
    borderRadius: 14,
    background: `linear-gradient(160deg, #0a2a53, #1d447a)`,
    color: '#ffffff',
    fontWeight: 600,
    fontSize: 18,
    minHeight: 120,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    cursor: isLink ? 'pointer' : 'default',
    transition: 'all 0.3s ease',
    boxShadow: `0 4px 18px ${color || '#00000040'}`,
    border: `2px solid ${color || '#ffffff44'}`,
    textDecoration: 'none'
  };

  return isLink ? (
    <a href={href} style={baseStyle}>
      <strong>{title}</strong>
    </a>
  ) : (
    <div style={baseStyle}>
      <strong style={{ marginBottom: 10 }}>{title}</strong>
      <div>{content}</div>
    </div>
  );
}
