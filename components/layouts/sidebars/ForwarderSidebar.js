import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

export default function ForwarderSidebar() {
  const router = useRouter();
  const { data: session } = useSession();

  const navLinks = [
    { href: '/dashboard/forwarder', label: 'Dashboard' },
    { href: '/dashboard/forwarder/bookings', label: 'Bookings' },
    { href: '/dashboard/forwarder/invoices', label: 'Invoices' },
    { href: '/dashboard/forwarder/commission', label: 'Commission' },
    { href: '/dashboard/forwarder/settings', label: 'Settings' },
  ];

  return (
    <aside
      style={{
        minHeight: '100vh',
        backgroundColor: '#0d0d2b',
        padding: '2rem 1rem',
        color: '#fff',
        width: '220px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <FaUserCircle size={28} style={{ marginRight: '10px', color: '#fff' }} />
          <div>
            <strong style={{ fontSize: '16px' }}>Forwarder</strong><br />
            <small>{session?.user?.name || 'User'}</small>
          </div>
        </div>

        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {navLinks.map(({ href, label }) => {
              const isActive = router.pathname === href;

              return (
                <li key={href} style={{ marginBottom: '12px' }}>
                  <Link
                    href={href}
                    className={`btn ${isActive ? 'btn-success' : 'btn-outline-light'} w-100 text-start`}
                    style={{
                      minHeight: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: '0.3s ease',
                    }}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="btn btn-danger w-100 mt-4"
        style={{ minHeight: '40px' }}
      >
        <FaSignOutAlt style={{ marginRight: '8px' }} />
        Logout
      </button>
    </aside>
  );
}
