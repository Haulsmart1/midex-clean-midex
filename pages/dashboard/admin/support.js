// File: pages/dashboard/admin/support.js

import dynamic from 'next/dynamic';

const AdminLayout = dynamic(() => import('@/components/layouts/AdminLayout'), {
  ssr: false, // prevents SSR crash
});

export default function SupportPage() {
  return (
    <div className="text-white p-4">
      <h1>Support Admin Dashboard</h1>
      <p>This is the support page for admins.</p>
    </div>
  );
}

SupportPage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
