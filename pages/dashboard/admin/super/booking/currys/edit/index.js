'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import supabase from '@/lib/supabaseClient';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import styles from '@/styles/BookingWizard.module.css';

function safeParseArray(input, label = '') {
  try {
    if (typeof input === 'string') {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [];
    }
    if (Array.isArray(input)) return input;
    return [];
  } catch (e) {
    console.error(`❌ Failed to parse ${label}:`, input, e);
    return [];
  }
}

export default function CurrysBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings_currys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching Currys bookings:', error);
      } else {
        setBookings(data || []);
      }

      setLoading(false);
    };

    fetchBookings();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    const { error } = await supabase
      .from('bookings_currys')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting Currys booking:', error);
      alert('❌ Delete failed');
    } else {
      alert('✅ Booking deleted');
      setBookings((prev) => prev.filter((b) => b.id !== id));
    }
  };

  return (
    <SuperAdminLayout>
      <div className={styles.pageWrap}>
        <h2 className={styles.pageTitle}>🛒 Currys Bookings</h2>

        {loading ? (
          <p>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p>No Currys bookings found.</p>
        ) : (
          <div className={styles.cardList}>
            {bookings.map((b) => {
              const collections = safeParseArray(b.collectionpoints, 'collectionpoints');
              const deliveries = safeParseArray(b.deliverypoints, 'deliverypoints');

              const origin = collections[0]?.postcode || b.postcode || 'N/A';
              const destination = deliveries[0]?.postcode || b.deliverypostcode || 'N/A';
              const total = b.total_inc_vat ? `£${b.total_inc_vat.toFixed(2)}` : '£0.00';

              return (
                <div key={b.id} className={styles.card}>
                  <h3>{origin} → {destination}</h3>
                  <p>
                    <strong>Total:</strong> {total}
                  </p>

                  <div className={styles.cardActions}>
                    <Link
                      href={`/dashboard/admin/super/booking/currys/edit/${b.id}`}
                      className={styles.editBtn}
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className={styles.deleteBtn}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
