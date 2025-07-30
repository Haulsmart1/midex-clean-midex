// pages/dashboard/admin/admins/index.js

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function AdminListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- RBAC: Secure the page ---
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace('/login');
    } else {
      // Check roles (accept array or string)
      const roles = session.user.roles || [session.user.role];
      if (!roles?.includes('admin') && !roles?.includes('super_admin')) {
        router.replace('/dashboard');
      }
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchAdmins();
  }, [status]);

  const fetchAdmins = async () => {
    const { data, error } = await supabase
      .from('admins')
      .select('id, role, created_at, employee:employee_id ( name, email, phone, position )');
    if (!error) setAdmins(data);
    setLoading(false);
  };

  return (
    <AdminLayout>
      <Head>
        <title>Manage Admins | Midnight Express</title>
      </Head>

      <div className="container py-4 text-white">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-6 fw-bold">Manage Admins</h1>
          <Link href="/dashboard/admin/admins/create" className="btn btn-primary">
            + Add Admin
          </Link>
        </div>

        {loading ? (
          <div className="alert alert-info">Loading admins...</div>
        ) : admins.length === 0 ? (
          <div className="alert alert-warning">No admins found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Position</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td>{admin.employee?.name}</td>
                    <td>{admin.employee?.email}</td>
                    <td>{admin.employee?.phone}</td>
                    <td>{admin.employee?.position}</td>
                    <td>{admin.role}</td>
                    <td>
                      <Link
                        href={`/dashboard/admin/admins/${admin.id}`}
                        className="btn btn-sm btn-outline-light"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// ✅ Prevent SSG error due to Supabase usage on client
export async function getServerSideProps() {
  return { props: {} };
}
