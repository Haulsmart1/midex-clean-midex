import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';

export default function SuperAdminSidebar() {
  const router = useRouter();

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const links = [
    { href: '/dashboard/super', label: '📊 Dashboard' },
    { href: '/dashboard/super/admins', label: '👨‍💼 Edit Admins' },
    { href: '/dashboard/super/forwarders', label: '🚚 Edit Forwarders' }, // <-- Updated here
    { href: '/dashboard/super/users', label: '👥 Edit Users' },
    { href: '/dashboard/super/reports', label: '📋 View Reports' },
    { href: '/dashboard/super/settings', label: '⚙️ System Settings' },
  ];

  return (
    <aside style={{ minHeight: '100vh', backgroundColor: '#111', padding: '2rem 1rem', color: '#fff', width: '220px' }}>
      <h5 className="text-white mb-4">Super Admin Panel</h5>

      <nav className="d-flex flex-column gap-2">
        {links.map(({ href, label }) => (
          <Link key={href} href={href} legacyBehavior>
            <a
              className="btn btn-outline-light w-100 text-start"
              style={{
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {label}
            </a>
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="btn btn-danger w-100 mt-4"
          style={{
            minHeight: '40px',
          }}
        >
          🚪 Logout
        </button>
      </nav>
    </aside>
  );
}
