'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import config from '@/components/partners/fastFreightConfig'; // ✅ Static import

export default function PartnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const partnerSlug = "fastfreight";
  const [hydrated, setHydrated] = useState(false);

  // Hydration-safe: Don't render UI until client ready
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || status === 'loading') return;

    // Not logged in? Boot to login
    if (!session) {
      router.replace('/login');
      return;
    }
    // Extract roles (array or string)
    const roles = Array.isArray(session?.user?.roles)
      ? session.user.roles.map((r) => r && r.toLowerCase())
      : [session?.user?.role?.toLowerCase()].filter(Boolean);

    // Not a partner? Boot to main dashboard
    if (!roles.includes('partner')) {
      router.replace('/dashboard');
      return;
    }
  }, [session, status, hydrated, router]);

  // Hydration or session loading: render nothing to prevent SSR/CSR mismatch
  if (!hydrated || status === 'loading') return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, #0c1628 0%, ${config.brandColor} 100%)`,
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
              background: config.brandColor,
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

        <div style={{
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap',
          marginBottom: 32
        }}>
          <Card title="Bookings" href={`/dashboard/partner/${partnerSlug}/bookings`} color="#1f9aff" />
          <Card title="Finance" href={`/dashboard/partner/${partnerSlug}/finance`} color="#ffc600" />
          <Card title="Settings" href={`/dashboard/partner/${partnerSlug}/settings`} color="#00ff88" />
          <Card
            title="Coverage"
            content={
              config.coverageAreas?.length
                ? config.coverageAreas.map((code, i) => (
                    <span key={i} style={{
                      display: 'inline-block',
                      background: '#1e2b40',
                      border: '1px solid #3b4e66',
                      borderRadius: 6,
                      padding: '4px 8px',
                      marginRight: 8,
                      marginBottom: 4,
                      fontSize: 13
                    }}>{code}</span>
                  ))
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
    borderRadius: 12,
    background: '#15263e',
    color: '#fff',
    fontWeight: 600,
    fontSize: 18,
    minHeight: 100,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    cursor: isLink ? 'pointer' : 'default',
    transition: '0.3s',
    border: `2px solid ${color || '#2c3e50'}`
  };

  return isLink ? (
    <a href={href} style={baseStyle}><strong>{title}</strong></a>
  ) : (
    <div style={baseStyle}>
      <strong style={{ marginBottom: 8 }}>{title}</strong>
      <div>{content}</div>
    </div>
  );
}
