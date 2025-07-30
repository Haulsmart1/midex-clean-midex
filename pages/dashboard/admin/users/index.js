// pages/dashboard/admin/users/index.js

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '@/lib/supabaseClient';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');

    if (!error) setUsers(data);
    setLoading(false);
  };

  return (
    <AdminLayout>
      <Head>
        <title>Manage Users | Midnight Express</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="display-6 fw-bold mb-4">Manage Users</h1>

        {loading ? (
          <div className="alert alert-info">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="alert alert-warning">No users found.</div>
        ) : (
          <div className="list-group">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/dashboard/admin/users/${user.id}`}
                className="list-group-item list-group-item-action bg-dark text-white"
              >
                {user.name} ({user.email}) — <strong>{user.role}</strong>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// ✅ SSR-safe export to prevent window error during build
export async function getServerSideProps() {
  return { props: {} };
}
