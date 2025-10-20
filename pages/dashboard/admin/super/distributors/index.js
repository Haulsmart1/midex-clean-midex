'use client';

import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import styles from '@/styles/SuperAdminDistributors.module.css';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DistributorsPage() {
  const [list, setList] = useState([]);

  useEffect(() => {
    fetchDistributors();
  }, []);

  const fetchDistributors = async () => {
    const { data, error } = await supabase
      .from('distributors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching distributors:', error.message);
    } else {
      setList(data || []);
    }
  };

  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>📦 Distributors | Super Admin</title>
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>📦 Distributors</h1>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Region</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {list.length > 0 ? (
                list.map((d) => (
                  <tr key={d.id}>
                    <td>{d.id.slice(0, 8)}...</td>
                    <td>{d.name || '—'}</td>
                    <td>{d.region || '—'}</td>
                    <td>{new Date(d.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className={styles.emptyText}>
                    No distributors found.
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
