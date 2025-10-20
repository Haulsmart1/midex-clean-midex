'use client';

import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import styles from '@/styles/SuperAdminCurrys.module.css';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function CurrysPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchCurrysBookings();
  }, []);

  const fetchCurrysBookings = async () => {
    const { data, error } = await supabase
      .from('bookings_currys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load Currys bookings:', error.message);
    } else {
      setBookings(data || []);
    }
  };

  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>Currys | Midnight Express</title>
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>🚛 Currys Courier Integrations</h1>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Consignment</th>
                <th>Status</th>
                <th>Courier</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id.slice(0, 8)}...</td>
                    <td>{b.consignment_ref || '—'}</td>
                    <td>
                      <span className={styles.badge}>{b.status || 'pending'}</span>
                    </td>
                    <td>{b.courier || 'Currys'}</td>
                    <td>{new Date(b.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={styles.emptyText}>No Currys bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
