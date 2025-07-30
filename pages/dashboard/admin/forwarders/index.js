// pages/dashboard/admin/forwarders/index.js

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '/lib/supabaseClient';
import AdminLayout from '../../../../components/layouts/AdminLayout';

export default function AdminForwarders() {
  const [forwarders, setForwarders] = useState([]);

  useEffect(() => {
    fetchForwarders();
  }, []);

  const fetchForwarders = async () => {
    const { data, error } = await supabase
      .from('forwarders')
      .select('*')
      .order('name');

    if (error) console.error(error);
    else setForwarders(data);
  };

  return (
    <AdminLayout>
      <div className="container py-4 text-white">
        <h1 className="display-6 fw-bold mb-4">Manage Forwarders</h1>
        <Link href="/dashboard/admin/forwarders/create" className="btn btn-primary mb-4">
          + Add Forwarder
        </Link>

        {forwarders.length === 0 ? (
          <div className="alert alert-info">No forwarders yet.</div>
        ) : (
          <div className="list-group">
            {forwarders.map((fwd) => (
              <Link
                key={fwd.id}
                href={`/dashboard/admin/forwarders/${fwd.id}`}
                className="list-group-item list-group-item-action bg-dark text-white"
              >
                {fwd.name} - {fwd.contact_email}
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// ✅ Prevents Next.js from statically rendering this page at build time
export async function getServerSideProps() {
  return { props: {} };
}
