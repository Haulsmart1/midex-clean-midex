'use client';

import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import styles from '@/styles/SuperAdminManageUsers.module.css';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error.message);
    } else {
      setUsers(data || []);
    }
  };

  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>Manage Users | Midnight Express</title>
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>👥 Manage Users</h1>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id.slice(0, 8)}...</td>
                    <td>{user.email || '—'}</td>
                    <td>
                      <span className={styles.badge}>
                        {user.role || 'standard'}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: '#ccc' }}>
                    No users found.
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
