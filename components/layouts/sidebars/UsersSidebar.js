// components/layouts/sidebars/UsersSidebar.js

import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';

export default function UsersSidebar() {
  const router = useRouter();

  const links = [
    { href: '/dashboard/users', label: 'Dashboard' },
    { href: '/dashboard/users/bookings/create', label: 'My Bookings' },
    { href: '/dashboard/users/routes', label: 'Routes' },
    { href: '/dashboard/users/invoices', label: 'Invoices' },
    { href: '/dashboard/users/settings', label: 'Settings' },
  ];

  return (
    <aside
      style={{
        minHeight: '100vh',
        backgroundColor: '#1e1e1e',
        padding: '2rem 1rem',
        color: '#fff',
        width: '220px',
      }}
    >
      <h5 className="text-white mb-4">User Panel</h5>
      <nav className="d-flex flex-column gap-2">
        {links.map(({ href, label }) => (
          <Link key={href} href={href} legacyBehavior>
            <a
              className={`btn ${router.pathname === href ? 'btn-success' : 'btn-outline-light'} w-100 text-start`}
              style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}
            >
              {label}
            </a>
          </Link>
        ))}

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="btn btn-danger w-100 mt-4"
          style={{ minHeight: '40px' }}
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
