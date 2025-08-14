import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';

export default function CustomsPage() {
  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>Customs | Midnight Express</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="display-6 fw-bold mb-4">🛃 Customs</h1>
        <p>Manage customs operations and configurations here.</p>
      </div>
    </SuperAdminLayout>
  );
}
