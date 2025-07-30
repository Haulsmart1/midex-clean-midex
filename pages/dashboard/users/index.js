// --- FILE: pages/dashboard/users/index.js ---
// User dashboard, for role "user". Others get redirected.

import { useSession } from "next-auth/react";
import { useRouter } from "next/router"; // ← Use this for /pages directory
import { useEffect } from "react";
import UsersLayout from '../../../components/layouts/UsersLayout';

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Always treat roles as array
  const roles = Array.isArray(session?.user?.roles)
    ? session.user.roles
    : [session?.user?.role].filter(Boolean);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || !roles.includes('user')) {
      // Redirect by most privileged role present:
      if (roles.includes('super_admin')) router.replace('/dashboard/admin/super');
      else if (roles.includes('admin')) router.replace('/dashboard/admin');
      else if (roles.includes('forwarder')) router.replace('/dashboard/forwarder');
      else if (roles.includes('partner')) router.replace('/dashboard/partner/fastfreight');
      else router.replace('/login');
    }
    // eslint-disable-next-line
  }, [session, status, router, roles]);

  // While checking, show loading text
  if (status === 'loading' || !session?.user || !roles.includes('user')) {
    return <div className="container text-center mt-5">Checking access...</div>;
  }

  // For troubleshooting: print the session to devtools
  if (process.env.NODE_ENV !== 'production') {
    console.log("DEBUG SESSION USER:", session.user);
  }

  return (
    <UsersLayout>
      <h1 className="display-5 fw-bold mb-4">
        Welcome, {session.user.name ? session.user.name : "User"} 👋
      </h1>
      <div className="mb-4">
        <a href="/dashboard/users/bookings" className="btn btn-primary me-2">📦 My Bookings</a>
        <a href="/dashboard/users/settings" className="btn btn-secondary">⚙️ Settings</a>
      </div>
      <div className="bg-dark p-4 rounded">
        <h2 className="h5 mb-3 text-white">📋 Recent Bookings</h2>
        <p className="text-muted">No recent bookings to show.</p>
      </div>
    </UsersLayout>
  );
}
