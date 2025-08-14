import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import styles from '@/styles/Admin.module.css'; // Customize as needed

export default function ManageAdminsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // 🔐 RBAC check
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/login');
    } else {
      const roles = session.user.roles || [session.user.role];
      if (!roles.includes('super admin')) {
        router.replace('/dashboard');
      }
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetchAdmins();
  }, [status]);

  const fetchAdmins = async () => {
    const { data, error } = await supabase
      .from('admins')
      .select('id, role, created_at, employee:employee_id ( name, email, phone, position )');

    if (!error) setAdmins(data);
    setLoading(false);
  };

  const filteredAdmins = admins.filter((admin) => {
    const name = admin.employee?.name || '';
    const email = admin.employee?.email || '';
    return name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>Manage Admins | Midnight Express</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>👑 Manage Admins</h1>
          <Link href="/dashboard/admin/super/admins/create" className={styles.addButton}>
            + Add Admin
          </Link>
        </div>

        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />

        {loading ? (
          <div className={styles.alertInfo}>Loading admins...</div>
        ) : filteredAdmins.length === 0 ? (
          <div className={styles.alertWarning}>No admins found.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
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
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id}>
                    <td>{admin.employee?.name}</td>
                    <td>{admin.employee?.email}</td>
                    <td>{admin.employee?.phone}</td>
                    <td>{admin.employee?.position}</td>
                    <td>{admin.role}</td>
                    <td>
                      <Link href={`/dashboard/admin/super/admins/${admin.id}`} className={styles.editBtn}>
                        ✏️ Edit
                      </Link>
                      <Link href={`/dashboard/admin/super/admins/view/${admin.id}`} className={styles.viewBtn}>
                        👁 View
                      </Link>
                    </td>
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

export async function getServerSideProps() {
  return { props: {} };
}
