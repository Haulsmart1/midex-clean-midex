// 📄 components/Sidebar.js
import Link from 'next/link';
import { useRouter } from 'next/router';

const Sidebar = () => {
  const { pathname } = useRouter();

  const links = [
    { href: '/dashboard', label: 'Home' },
    { href: '/dashboard/admin/routes', label: 'Admin Routes' },
    { href: '/dashboard/users/routes', label: 'User Routes' },
  ];

  return (
    <div className="sidebar bg-dark text-white p-4" style={{ width: 250, minHeight: '100vh' }}>
      <h2 className="text-light mb-4">Dashboard</h2>
      <ul className="list-unstyled">
        {links.map(({ href, label }) => (
          <li key={href} className="mb-2">
            <Link href={href} legacyBehavior passHref>
              <a
                className={`d-block px-3 py-2 rounded text-decoration-none ${
                  pathname === href ? 'bg-light text-dark fw-bold' : 'text-light'
                }`}
              >
                {label}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
