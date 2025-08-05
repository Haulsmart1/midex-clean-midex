'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// PartnerDashboard for alptrans with hydration guard & dynamic config import
export default function PartnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const partnerSlug = 'alptrans';

  // Hydration-safe: Render only after client mounts
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
          coverageAreas: []
        })
      );
  }, [session, status, hydrated, router]);

  // Hydration & config loading: prevent SSR/CSR mismatch
  if (!hydrated || status === 'loading' || !config) {
    return <div style={{ padding: 40, color: '#fff' }}>Loading...</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(120deg, #0c1628 50%, ${config.primaryColor} 100%)`,
      color: '#fff',
      fontFamily: 'Poppins, Arial, sans-serif',
      padding: '40px 24px'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32
        }}>
          <h1 style={{ fontSize: 36, fontWeight: 800 }}>
            {config.name} Dashboard
          </h1>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              background: config.primaryColor,
              color: '#000',
              padding: '10px 24px',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
            }}
            aria-label="Sign out"
          >
            Log Out
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          marginBottom: 40
        }}>
          <Card title="Bookings" href={`/dashboard/partner/${partnerSlug}/bookings`} color="#1f9aff" />
          <Card title="Finance" href={`/dashboard/partner/${partnerSlug}/finance`} color="#ffc600" />
          <Card title="Settings" href={`/dashboard/partner/${partnerSlug}/settings`} color="#ff4fd8" />
          <Card
            title="Coverage"
            content={
              <div style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 6 }}>
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
            }
          />
        </div>
      </div>
    </div>
  );
}

// Card component with hover effect, hydration-safe
function Card({ title, content, href, color }) {
  const [hovered, setHovered] = useState(false);

  const isLink = !!href;
  const baseStyle = {
    padding: '24px 20px',
    borderRadius: 14,
    background: '#15263e',
    color: '#fff',
    fontWeight: 600,
    fontSize: 18,
    minHeight: 120,
    border: `2px solid ${color || '#2c3e50'}`,
    cursor: isLink ? 'pointer' : 'default',
    transition: 'all 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    overflowWrap: 'break-word',
    ...(hovered && isLink ? {
      boxShadow: `0 0 10px ${color}`,
      transform: 'translateY(-2px)',
    } : {})
  };

  return isLink ? (
    <a
      href={href}
      style={baseStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <strong>{title}</strong>
    </a>
  ) : (
    <div style={baseStyle}>
      <strong style={{ marginBottom: 10 }}>{title}</strong>
      <div>{content}</div>
    </div>
  );
}
