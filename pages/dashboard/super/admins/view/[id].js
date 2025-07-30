import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabaseClient';
import SuperAdminLayout from '../../../../../components/layouts/SuperAdminLayout';

export default function ViewAdminPage() {
  const router = useRouter();
  const { id } = router.query;

  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    if (id) fetchAdmin();
  }, [id]);

  const fetchAdmin = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*, admins(role)')
      .eq('id', id)
      .single();

    if (!error) {
      setAdmin(data);
    }
  };

  if (!admin) return <SuperAdminLayout><p className="text-white p-4">Loading...</p></SuperAdminLayout>;

  return (
    <SuperAdminLayout>
      <div className="container py-4 text-white">
        <h1 className="display-6 fw-bold mb-4">View Admin</h1>

        <div className="bg-dark p-4 border rounded shadow-sm">
          <p><strong>Name:</strong> {admin.name}</p>
          <p><strong>Email:</strong> {admin.email}</p>
          <p><strong>Phone:</strong> {admin.phone}</p>
          <p><strong>Position:</strong> {admin.position}</p>
          <p><strong>Role:</strong> {admin.admins?.role}</p>
          <p><strong>Created:</strong> {new Date(admin.created_at).toLocaleString()}</p>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
