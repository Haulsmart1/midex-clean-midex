'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import supabase from '@/lib/supabaseClient';

export default function InternalBookings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const partner = params?.partner?.toLowerCase();

  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);

  // Load config dynamically from /components/partners/<partner>Config.js
  useEffect(() => {
    const loadConfig = async () => {
      if (!partner) return;

      try {
        const mod = await import(`@/components/partners/${partner}Config`);
        setConfig(mod.default || null);
      } catch (err) {
        console.warn('Partner config not found:', partner);
        setConfig(null);
      }
    };

    loadConfig();
  }, [partner]);

  // Fetch and filter bookings
  useEffect(() => {
    if (status === 'loading' || !config) return;
    if (!session) {
      router.replace('/login');
      return;
    }

    const fetchAndFilter = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('bookings_internal')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        setBookings([]);
        setFiltered([]);
        setLoading(false);
        return;
      }

      const normalize = (pc) => pc?.toUpperCase().replace(/\s/g, '') || '';

      const validBookings = (data || []).filter((b) => {
        const normalizedPostcode = normalize(b.collection_postcode);
        return config.filterLeg?.({ postcode: normalizedPostcode });
      });

      setBookings(validBookings);
      setFiltered(validBookings);
      setLoading(false);
    };

    fetchAndFilter();
  }, [status, session, config]);

  return (
    <div className="container py-5" style={{ backgroundColor: '#1a1831', minHeight: '100vh', color: '#fff' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          className="btn btn-warning"
          onClick={() => router.push(`/dashboard/partner/${partner}`)}
        >
          ← Back to Dashboard
        </button>
        <button
          className="btn btn-danger"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          Log Out
        </button>
      </div>

      <h2 style={{ color: '#ffc600', fontWeight: 'bold' }}>
        🚚 Internal Bookings - {partner?.toUpperCase()}
      </h2>

      {loading ? (
        <p className="mt-4">Loading bookings...</p>
      ) : filtered.length === 0 ? (
        <p className="mt-4">No bookings found for your collection region.</p>
      ) : (
        <div className="row mt-4">
          {filtered.map((booking) => (
            <div className="col-md-6 col-lg-4 mb-4" key={booking.id}>
              <div className="card h-100 shadow-sm" style={{ backgroundColor: '#2b254a', color: '#fff' }}>
                <div className="card-body">
                  <h5 className="card-title fw-bold">{booking.internal_ref}</h5>
                  <p className="card-text mb-1"><strong>Collection:</strong> {booking.collection_postcode}</p>
                  <p className="card-text mb-1"><strong>Address:</strong> {booking.collection_address || 'No address'}</p>
                  <p className="card-text mb-1"><strong>Notes:</strong> {booking.notes || '—'}</p>
                  <p className="card-text mb-1"><strong>Status:</strong> {booking.status || 'Unknown'}</p>
                  <p className="card-text mb-1"><strong>Created:</strong> {new Date(booking.created_at).toLocaleString()}</p>
                  <Link
                    href={`/dashboard/partner/${partner}/bookings/internal/${booking.id}`}
                    className="btn btn-outline-light btn-sm mt-3"
                  >
                    ✏️ Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
