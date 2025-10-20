'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import styles from '@/styles/ManageBookings.module.css';

export default function CrossBorderBookingHome() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('customs_required', true)
        .in('status', ['draft', 'confirmed'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching cross-border bookings:', error);
      } else {
        setBookings(data || []);
      }

      setLoading(false);
    };

    fetchBookings();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
      alert('❌ Delete failed: ' + error.message);
    } else {
      setBookings((prev) => prev.filter((b) => b.id !== id));
      alert('✅ Booking deleted');
    }
  };

  return (
    <SuperAdminLayout>
      <div className={styles.container}>
        <h1>🌍 Cross Border Bookings</h1>

        {loading ? (
          <p>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p>No cross-border bookings found.</p>
        ) : (
          <div className={styles.grid}>
            {bookings.map((b) => {
              const title = b.consignment_ref || 'Untitled';
              const status = b.status || 'Unknown';
              const customer = b.customer || 'N/A';

              return (
                <div key={b.id} className={styles.card}>
                  <h3>{title}</h3>
                  <p><strong>Status:</strong> {status}</p>
                  <p><strong>Customer:</strong> {customer}</p>

                  <div className={styles.actions}>
                    <button onClick={() => router.push(`/dashboard/admin/super/booking/cross-border/edit/${b.id}`)}>
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => b.pod_file_url && window.open(b.pod_file_url, '_blank')}
                      disabled={!b.pod_file_url}
                    >
                      📄 POD
                    </button>

                    <button
                      onClick={() => b.document_file_url && window.open(b.document_file_url, '_blank')}
                      disabled={!b.document_file_url}
                    >
                      📁 Docs
                    </button>

                    <button onClick={() => handleDelete(b.id)}>
                      🗑 Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <Link href="/dashboard/admin/super/booking">← Back to All Bookings</Link>
        </div>
      </div>
    </SuperAdminLayout>
  );
}

