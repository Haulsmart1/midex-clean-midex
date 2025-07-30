import Link from 'next/link';

const SuperAdminLayout = ({ children }) => {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#111',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <aside
        style={{
          width: '220px',
          backgroundColor: '#1e1e1e',
          padding: '20px',
          borderRight: '1px solid #333',
        }}
      >
        <h3 style={{ marginBottom: '20px', color: '#0f0' }}>Super Admin</h3>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/dashboard/super" style={{ color: '#fff', textDecoration: 'none' }}>
                Dashboard
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/dashboard/super/admins" style={{ color: '#fff', textDecoration: 'none' }}>
                Admins
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/dashboard/super/forwarders" style={{ color: '#fff', textDecoration: 'none' }}>
                Forwarders
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/dashboard/super/users" style={{ color: '#fff', textDecoration: 'none' }}>
                Users
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/dashboard/super/exports" style={{ color: '#fff', textDecoration: 'none' }}>
                Exports
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/dashboard/super/reports" style={{ color: '#fff', textDecoration: 'none' }}>
                Reports
              </Link>
            </li>
            <li>
              <Link href="/dashboard/super/settings" style={{ color: '#fff', textDecoration: 'none' }}>
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main style={{ flex: 1, backgroundColor: '#222', padding: '20px' }}>
        {children}
      </main>
    </div>
  );
};

export default SuperAdminLayout;

