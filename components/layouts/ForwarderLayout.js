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
    { href: '/dashboard/forwarder/settings', label: 'Settings' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0d0d0d' }}>
      <aside style={{
        width: '240px',
        backgroundColor: '#0d0d2b',
        padding: '20px',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '4px 0 20px rgba(0,0,0,0.8)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
            <FaUserCircle size={28} style={{ marginRight: '10px', color: '#fff' }} />
            <div>
              <strong style={{ fontSize: '16px' }}>Forwarder</strong><br />
              <small>{session?.user?.name || 'User'}</small>
            </div>
          </div>

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
                        backgroundColor: isActive ? '#1f1f40' : '#12123b',
                        color: isActive ? '#00f0ff' : '#d0d8ff',
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: isActive
                          ? '0 0 8px #00f0ff, 0 0 15px #00f0ff44'
                          : 'none',
                        border: isActive ? '1px solid #00f0ff' : '1px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1c1c50';
                        e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 217, 255, 0.3)';
                        e.currentTarget.style.border = '1px solid #00f0ff';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isActive ? '#1f1f40' : '#12123b';
                        e.currentTarget.style.boxShadow = isActive
                          ? '0 0 8px #00f0ff'
                          : 'none';
                        e.currentTarget.style.border = isActive
                          ? '1px solid #00f0ff'
                          : '1px solid transparent';
                        e.currentTarget.style.color = isActive ? '#00f0ff' : '#d0d8ff';
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
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            backgroundColor: '#1e1e3a',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '12px',
            width: '100%',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s',
            boxShadow: '0 0 5px rgba(255, 0, 0, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ff0040';
            e.currentTarget.style.color = '#000';
            e.currentTarget.style.boxShadow = '0 0 10px #ff0040, 0 0 15px #ff0040aa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1e1e3a';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.boxShadow = '0 0 5px rgba(255, 0, 0, 0.3)';
          }}
        >
          <FaSignOutAlt style={{ marginRight: '8px' }} />
          Logout
        </button>
      </aside>

      <main style={{ flex: 1, backgroundColor: '#0d0d0d', padding: '30px' }}>
        {children}
      </main>
    </div>
  );
}
