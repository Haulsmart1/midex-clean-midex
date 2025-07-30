import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabaseClient';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';

export default function SuperDashboardHome() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- RBAC: Super Admin Only ---
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace('/login');
      return;
    }
    const roles = Array.isArray(session.user?.roles)
      ? session.user.roles
      : [session.user?.role].filter(Boolean);
    if (!roles.includes('super_admin')) {
      router.replace('/login');
      return;
    }
    // Once RBAC passes, fetch data
    fetchDashboardData();
    // eslint-disable-next-line
  }, [session, status]);

  // --- Fetch data (replace table name/columns as needed) ---
  const fetchDashboardData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('some_table') // <--- REPLACE with your real table name!
      .select('*');
    if (!error && data) setItems(data);
    setLoading(false);
  };

  return (
    <SuperAdminLayout>
      <Head>
        <title>Super Admin Dashboard</title>
      </Head>
      <div className="container py-4 text-white">
        <h1 className="fw-bold mb-4">Super Admin Dashboard</h1>
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <div className="alert alert-warning">No data available.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-bordered">
              <thead>
                <tr>
                  {/* Adjust columns here */}
                  <th>ID</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
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

// Prevent SSG for Supabase (Next.js SSR safety)
export async function getServerSideProps() {
  return { props: {} };
}
