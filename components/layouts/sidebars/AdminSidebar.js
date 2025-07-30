// components/sidebars/AdminSidebar.js
import Link from 'next/link';

export default function AdminSidebar() {
  return (
    <nav className="bg-dark text-light vh-100 p-3" style={{ width: '240px' }}>
      <h4 className="mb-4">Admin Panel</h4>
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link href="/dashboard/admin" className="nav-link text-light">Dashboard</Link>
        </li>
        <li className="nav-item">
          <Link href="/dashboard/admin/bookings" className="nav-link text-light">Bookings</Link>
        </li>
        <li className="nav-item">
          <Link href="/dashboard/admin/support" className="nav-link text-light">Support</Link>
        </li>
        <li className="nav-item">
          <Link href="/dashboard/super/reports" className="nav-link text-light">Reports</Link>
        </li>
      </ul>
    </nav>
  );
}
