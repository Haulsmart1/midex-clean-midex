'use client';

import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import styles from '@/styles/SuperAdminManufacturers.module.css';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ManufacturersPage() {
  const [list, setList] = useState([]);

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const fetchManufacturers = async () => {
    const { data, error } = await supabase
      .from('manufacturers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching manufacturers:', error.message);
    } else {
      setList(data || []);
    }
  };

  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>🏭 Manufacturers | Super Admin</title>
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>🏭 Manufacturers</h1>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Country</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {list.length > 0 ? (
                list.map((m) => (
                  <tr key={m.id}>
                    <td>{m.id.slice(0, 8)}...</td>
                    <td>{m.name || '—'}</td>
                    <td>{m.country || '—'}</td>
                    <td>{new Date(m.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className={styles.emptyText}>
                    No manufacturers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
