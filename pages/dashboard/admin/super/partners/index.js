import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';

export default function PartnersPage() {
  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>Partners | Midnight Express</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="display-6 fw-bold mb-4">🤝 Partners</h1>
        <p>Manage partnerships and affiliations.</p>
      </div>
    </SuperAdminLayout>
  );
}
