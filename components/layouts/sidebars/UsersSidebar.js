'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function UsersSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const email = session?.user?.email || 'No Email';
  const companyNumber = session?.user?.company_number || 'N/A';

  const links = [
    { href: '/dashboard/user', label: '🏠 Dashboard' },
    { href: '/dashboard/user/bookings', label: '📦 My Bookings' },
    { href: '/dashboard/user/invoices', label: '🧾 Invoices' },
    { href: '/dashboard/user/settings', label: '⚙️ Settings' },
  ];

  return (
    <aside
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a192f',
        color: '#fff',
        width: '240px',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        {/* User Info */}
        <div
          style={{
            marginBottom: '2rem',
            padding: '1rem',
            backgroundColor: '#112240',
            borderRadius: '8px',
            fontSize: '0.9rem',
            lineHeight: '1.5',
          }}
        >
          <strong>User</strong>
          <br />
          <span>Email:</span> <br />
          <span style={{ fontSize: '0.85rem', color: '#ccc' }}>{email}</span>
          <br />
          <span>Company #:</span> <br />
          <span style={{ fontSize: '0.85rem', color: '#ccc' }}>{companyNumber}</span>
        </div>

        {/* Navigation Links */}
        <nav className="d-flex flex-column gap-2" aria-label="Sidebar navigation">
          {links.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-label={`Go to ${label}`}
                className="w-100"
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: isActive ? '#1f9aff' : 'transparent',
                  color: isActive ? '#fff' : '#ccc',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'background 0.2s ease',
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="btn btn-danger w-100 mt-4"
          style={{
            padding: '0.6rem 1rem',
            borderRadius: '6px',
            fontWeight: 'bold',
          }}
          aria-label="Logout"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
