import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

export default function ForwarderLayout({ children }) {
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
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #2c1e38, #4a2c57, #5b2c73)',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          background: 'linear-gradient(to bottom, #3a1d4d, #2d1a3a)',
          padding: '20px',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          boxShadow: '4px 0 20px rgba(0,0,0,0.6)',
        }}
      >
        <div>
          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
            <FaUserCircle size={28} style={{ marginRight: '10px', color: '#fff' }} />
            <div>
              <strong style={{ fontSize: '16px' }}>Forwarder</strong>
              <br />
              <small>{session?.user?.name || 'User'}</small>
            </div>
          </div>

          {/* Nav Links */}
          <nav>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {navLinks.map(({ href, label }) => {
                const isActive = router.pathname === href;

                return (
                  <li key={href} style={{ marginBottom: '12px' }}>
                    <Link
                      href={href}
                      style={{
                        display: 'block',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        backgroundColor: isActive ? '#5a2d6d' : '#2d1f3a',
                        color: isActive ? '#ffb3ec' : '#d0b8ff',
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: isActive
                          ? '0 0 8px #ff7ee2, 0 0 15px #ff7ee244'
                          : 'none',
                        border: isActive ? '1px solid #ff7ee2' : '1px solid transparent',
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

        {/* Logout Button - placed higher for visibility */}
        <div style={{ marginTop: '40px' }}>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              background: 'linear-gradient(to right, #ff7ee2, #a987ff)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              width: '100%',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(255, 126, 226, 0.5)',
            }}
          >
            <FaSignOutAlt style={{ marginRight: '8px' }} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          padding: '30px',
          background: 'linear-gradient(to bottom right, #2c2237, #3c2a4f, #432d5c)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {children}
      </main>
    </div>
  );
}
