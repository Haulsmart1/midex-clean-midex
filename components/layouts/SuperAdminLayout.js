import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';

export default function SuperAdminLayout({ children }) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: '250px',
        background: '#1c1c1c',
        padding: '20px',
        color: '#fff',
        borderRight: '2px solid #333',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3 style={{ color: '#0f0', marginBottom: '20px' }}>⚙️ Super Admin</h3>
          <nav>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                ['Dashboard', '/dashboard/super'],
                ['Admins', '/dashboard/super/admins'],
                ['Forwarders', '/dashboard/super/forwarders'],
                ['Users', '/dashboard/super/users'],
                ['Exports', '/dashboard/super/exports'],
                ['Reports', '/dashboard/super/reports'],
                ['Settings', '/dashboard/super/settings']
              ].map(([label, path]) => (
                <li key={path} style={{ marginBottom: '12px' }}>
                  <Link
                    href={path}
                    style={{
                      display: 'block',
                      padding: '10px 15px',
                      borderRadius: '6px',
                      backgroundColor: router.pathname === path ? '#28a745' : 'transparent',
                      color: router.pathname === path ? '#fff' : '#ccc',
                      fontWeight: router.pathname === path ? 'bold' : 'normal',
                      textDecoration: 'none'
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          style={{
            marginTop: '30px',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            padding: '10px',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100%',
            fontWeight: 'bold'
          }}
        >
          🔓 Logout
        </button>
      </aside>

      <main style={{ flex: 1, backgroundColor: '#222', padding: '30px', color: '#fff' }}>
        {children}
      </main>
    </div>
  );
}
