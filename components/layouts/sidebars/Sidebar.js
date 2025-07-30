import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';

export default function SuperAdminSidebar() {
  const router = useRouter();

  const links = [
    { href: '/dashboard/superadmin', label: 'Dashboard' },
    { href: '/dashboard/superadmin/users', label: 'Users' },
    { href: '/dashboard/superadmin/forwarders', label: 'Forwarders' },
    { href: '/dashboard/superadmin/reports', label: 'Reports' },
    { href: '/dashboard/superadmin/settings', label: 'Settings' },
  ];

  return (
    <aside className="bg-dark text-white p-3" style={{ width: '240px', minHeight: '100vh' }}>
      <h5 className="mb-4">Super Admin</h5>
      <nav className="d-flex flex-column gap-2">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`btn ${
              router.pathname === href ? 'btn-success' : 'btn-outline-light'
            } w-100 text-start`}
          >
            {label}
          </Link>
        ))}
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn btn-danger mt-4">
          Logout
        </button>
      </nav>
    </aside>
  );
}
