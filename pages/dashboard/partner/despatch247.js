'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PartnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const partnerSlug = 'despatch247';

  // Hydration guard: only run on client
  useEffect(() => {
    setHydrated(true);
  }, []);

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
      return;
    }

    import(`@/components/partners/${partnerSlug}Config`)
      .then(mod => setConfig(mod.default))
      .catch(() =>
        setConfig({
          name: 'Partner',
          primaryColor: '#4ecdc4',
          coverageAreas: [],
        })
      );
  }, [session, status, hydrated, router]);

  // Loading: prevents SSR/CSR mismatch
  if (!hydrated || status === 'loading' || !config) {
    return <div style={{ padding: 30, color: '#fff' }}>Loading dashboard…</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(120deg, #0c1628 60%, ${config.primaryColor} 100%)`,
      color: '#fff',
      fontFamily: 'Poppins, Arial, sans-serif',
      padding: 32
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <h1 style={{ fontSize: 34, fontWeight: 800 }}>{config.name} Dashboard</h1>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              background: config.primaryColor,
              color: '#000',
              padding: '10px 22px',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              cursor: 'pointer'
            }}
            aria-label="Sign out"
          >
            Log Out
          </button>
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 32 }}>
          <Card title="Bookings" href={`/dashboard/partner/${partnerSlug}/bookings`} color="#1f9aff" />
          <Card title="Finance" href={`/dashboard/partner/${partnerSlug}/finance`} color="#ffc600" />
          <Card title="Settings" href={`/dashboard/partner/${partnerSlug}/settings`} color="#00ff88" />
          <Card title="Coverage" content={
            <div style={{ maxHeight: 180, overflowY: 'auto', paddingRight: 6 }}>
              {config.coverageAreas?.length
                ? config.coverageAreas.map((code, i) => (
                    <span key={i} style={{
                      display: 'inline-block',
                      background: '#1e2b40',
                      border: '1px solid #3b4e66',
                      borderRadius: 6,
                      padding: '4px 8px',
                      marginRight: 8,
                      marginBottom: 6,
                      fontSize: 13
                    }}>{code}</span>
                  ))
                : 'N/A'}
            </div>
          } />
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
    borderRadius: 12,
    background: '#15263e',
    color: '#fff',
    fontWeight: 600,
    fontSize: 18,
    minHeight: 120,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    cursor: isLink ? 'pointer' : 'default',
    border: `2px solid ${color || '#2c3e50'}`,
    transition: 'all 0.25s ease'
  };

  return isLink ? (
    <a href={href} style={baseStyle}>
      <strong>{title}</strong>
    </a>
  ) : (
    <div style={baseStyle}>
      <strong style={{ marginBottom: 8 }}>{title}</strong>
      <div>{content}</div>
    </div>
  );
}
