import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';

export default function ManageUsersPage() {
  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>Manage Users | Midnight Express</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="display-6 fw-bold mb-4">Manage Users</h1>
        <p>This is the Manage Users page for Super Admins.</p>
      </div>
    </SuperAdminLayout>
  );
}
