'use client';

import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import styles from '@/styles/SuperAdminManageForwarders.module.css';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ManageForwardersPage() {
  const [forwarders, setForwarders] = useState([]);

  useEffect(() => {
    fetchForwarders();
  }, []);

  const fetchForwarders = async () => {
    const { data, error } = await supabase.from('forwarders').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching forwarders:', error.message);
    } else {
      setForwarders(data || []);
    }
  };

  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>Manage Forwarders | Midnight Express</title>
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>🚚 Manage Forwarders</h1>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Company Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {forwarders.map((fwd) => (
                <tr key={fwd.id}>
                  <td>{fwd.id.slice(0, 8)}...</td>
                  <td>{fwd.company_name || '—'}</td>
                  <td>{fwd.email || '—'}</td>
                  <td><span className={styles.badge}>{fwd.status || 'active'}</span></td>
                  <td>{new Date(fwd.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {forwarders.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '1rem', color: '#ccc' }}>No forwarders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
