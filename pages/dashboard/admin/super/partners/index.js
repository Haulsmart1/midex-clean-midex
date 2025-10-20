'use client';

import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import styles from '@/styles/SuperAdminPartners.module.css';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PartnersPage() {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    const { data, error } = await supabase
      .from('transport_partners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading partners:', error.message);
    } else {
      setPartners(data || []);
    }
  };

  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>Partners | Midnight Express</title>
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>🤝 Transport Partners</h1>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Country</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {partners.length > 0 ? (
                partners.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id.slice(0, 8)}...</td>
                    <td>{p.name || '—'}</td>
                    <td>{p.country || '—'}</td>
                    <td>
                      <span className={styles.badge}>
                        {p.status || 'active'}
                      </span>
                    </td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={styles.emptyText}>No partners found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
