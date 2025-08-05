'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

export default function PartnerBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const partner = router.query.partner;
  const partnerSlug = partner?.toLowerCase() || "fastfreight"; // ♿ fallback for safety

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [config, setConfig] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredBookings = bookings.filter(b =>
    filterStatus === "all" ? true : b.status?.toLowerCase() === filterStatus
  );

  useEffect(() => {
    if (!partnerSlug) return;
    import(`@/components/partners/${partnerSlug}Config`)
      .then((mod) => setConfig(mod.default))
      .catch(() =>
        setConfig({ name: 'Partner', primaryColor: '#66e3e8', coverage: '' })
      );
  }, [partnerSlug]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) return router.replace('/login');

    const roles = Array.isArray(session?.user?.roles)
      ? session.user.roles.map((r) => r && r.toLowerCase())
      : [session?.user?.role?.toLowerCase()].filter(Boolean);
    const partnerType = session?.user?.partner_type?.toLowerCase();

    if (!roles.includes('partner') || partnerType !== partnerSlug) {
      return router.replace('/dashboard');
    }

    supabase
      .from('bookings')
      .select('*')
      .eq('transport_partner', partnerSlug)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setBookings(data || []);
        setLoading(false);
      });
  }, [session, status, router, partnerSlug]);

  const exportCSV = () => {
    const headers = ['Booking ID', 'Status', 'Collection Postcodes', 'Delivery Postcodes'];
    const rows = filteredBookings.map((b) => [
      b.id,
      b.status,
      (b.collections || []).map((c) => c.postcode).join('; '),
      (b.deliveries || []).map((d) => d.postcode).join('; ')
    ]);
    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${partnerSlug}-bookings.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!config) return <div style={{ padding: 30 }}>Loading config…</div>;

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(120deg, #0c1628 60%, ${config.primaryColor} 100%)`,
      color: '#fff',
      fontFamily: 'Poppins, Arial, sans-serif',
      padding: 32,
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <h1 style={{ fontSize: 30, fontWeight: 800 }}>{config.name} Bookings</h1>
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
          >
            Log Out
          </button>
        </div>

        {/* --- Back to partner dashboard button --- */}
        <button
          type="button"
          onClick={() => router.push(`/dashboard/partner/${partnerSlug}`)}
          style={{
            background: '#15263e',
            color: config.primaryColor,
            border: `2px solid ${config.primaryColor}`,
            borderRadius: 8,
            padding: '8px 20px',
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 24,
            cursor: 'pointer',
            marginRight: 12,
            transition: 'background 0.18s'
          }}
        >
          ← Back to partner dashboard
        </button>

        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: 15,
              borderRadius: 6,
              background: '#fff',
              color: '#000',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">🕓 Pending</option>
            <option value="completed">✅ Completed</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>

          <button onClick={exportCSV} style={{
            background: '#fff',
            color: '#000',
            fontWeight: 700,
            border: 'none',
            padding: '10px 20px',
            borderRadius: 10,
            cursor: 'pointer'
          }}>
            ⬇️ Download CSV
          </button>
        </div>

        {loading ? (
          <div style={{ color: '#ffc600' }}>Loading bookings...</div>
        ) : error ? (
          <div style={{ color: '#fb4141' }}>{error}</div>
        ) : (
          <table style={{
            width: '100%',
            background: '#15263e',
            borderRadius: 12,
            overflow: 'hidden',
            fontSize: 16
          }}>
            <thead>
              <tr>
                <th style={thStyle}>Booking ID</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Collections</th>
                <th style={thStyle}>Deliveries</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id}>
                  <td style={tdStyle}>{b.id}</td>
                  <td style={tdStyle}>
                    {b.status === 'completed' && '✅ Completed'}
                    {b.status === 'pending' && '🕓 Pending'}
                    {b.status === 'cancelled' && '❌ Cancelled'}
                    {!['completed', 'pending', 'cancelled'].includes(b.status) && b.status}
                  </td>
                  <td style={tdStyle}>
                    {(b.collections || []).map((c, i) => <div key={i}>{c.postcode}</div>)}
                  </td>
                  <td style={tdStyle}>
                    {(b.deliveries || []).map((d, i) => <div key={i}>{d.postcode}</div>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  background: '#29486b',
  padding: '10px 16px',
  color: '#ffc600',
  fontWeight: 700
};

const tdStyle = {
  padding: '10px 12px',
  color: '#fff'
};
