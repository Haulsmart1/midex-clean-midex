import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import AdminLayout from '../../../components/layouts/AdminLayout';

export default function AdminDashboard() {
  const router = useRouter();

  const handleNavigation = useCallback((path) => {
    router.push(path);
  }, [router]);

  return (
    <>
      <Head>
        <title>Admin Dashboard | Midnight Express</title>
      </Head>

      <h1 className="display-5 fw-bold mb-3">Admin Dashboard</h1>
      <p className="text-muted mb-4">Welcome to the main admin panel.</p>

      <div className="row g-4">
        <div className="col-md-6 col-lg-4">
          <DashboardCard
            title="Sub Dashboard"
            description="Access detailed administrative views"
            actionLabel="Open Sub-Dashboard"
            actionPath="/dashboard/admin/sub"
            onNavigate={handleNavigation}
          />
        </div>
        <div className="col-md-6 col-lg-4">
          <DashboardCard
            title="Bookings"
            description="Manage and view all client bookings"
            actionLabel="Manage Bookings"
            actionPath="/dashboard/admin/bookings"
            onNavigate={handleNavigation}
          />
        </div>
      </div>
    </>
  );
}

function DashboardCard({ title, description, actionLabel, actionPath, onNavigate }) {
  return (
    <div className="p-4 bg-dark border rounded text-white shadow-sm h-100 d-flex flex-column justify-content-between">
      <div>
        <h5 className="fw-bold mb-2">{title}</h5>
        <p className="text-muted">{description}</p>
      </div>
      <button
        className="btn btn-outline-light mt-3"
        onClick={() => onNavigate(actionPath)}
      >
        {actionLabel}
      </button>
    </div>
  );
}

// ✅ FIXED! Use synchronous layout
AdminDashboard.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
