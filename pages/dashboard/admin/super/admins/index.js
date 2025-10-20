'use client';

import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-toastify';
import styles from '@/styles/SuperAdminManageAdmins.module.css';

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const { data, error } = await supabase
      .from('admins')
      .select('*');

    if (error) {
      console.error('Supabase Error:', error.message);
      toast.error('Failed to fetch admins');
    } else {
      setAdmins(data || []);
    }

    setLoading(false);
  };

  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>Manage Admins | Midnight Express</title>
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>👑 Manage Admins</h1>

        {loading ? (
          <p>Loading admins...</p>
        ) : admins.length === 0 ? (
          <p>No admins found.</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee ID</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td>{admin.id.slice(0, 8)}...</td>
                    <td>{admin.employee_id || '—'}</td>
                    <td>
                      <span className={styles.badge}>{admin.role}</span>
                    </td>
                    <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
