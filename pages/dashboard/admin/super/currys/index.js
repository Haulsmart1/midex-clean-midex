import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';

export default function CurrysPage() {
  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>Currys | Midnight Express</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="display-6 fw-bold mb-4">🚛 Currys</h1>
        <p>Manage Currys courier integrations, schedules, and data here.</p>
      </div>
    </SuperAdminLayout>
  );
}
