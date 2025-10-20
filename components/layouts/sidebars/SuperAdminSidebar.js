'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import styles from '@/styles/SuperAdminDashboard.module.css';

export default function SuperAdminSidebar({ user }) {
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState({
    bookings: true,
    logistics: false,
    admin: false,
  });

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isActive = (path) => (pathname === path ? styles.activeLink : '');

  return (
    <aside className={styles.sidebar}>
      {/* ✅ Back to Dashboard */}
      <div className={styles.dashboardLinkWrapper}>
        <Link href="/dashboard" className={styles.dashboardLink}>
          ← Back to Dashboard
        </Link>
      </div>

      <h3>{user?.role === 'super admin' ? 'Super Admin' : 'Admin'} Panel</h3>

      <nav>
        <ul>
          {/* BOOKINGS GROUP */}
          <li
            onClick={() => toggleMenu('bookings')}
            className={styles.dropdownToggle}
          >
            📦 Bookings {openMenus.bookings ? '▲' : '▼'}
          </li>
          {openMenus.bookings && (
            <>
              <li>
                <Link
                  href="/dashboard/admin/super/booking/create"
                  className={isActive('/dashboard/admin/super/booking/create')}
                >
                  ➕ Create Booking
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/super/booking/manage"
                  className={isActive('/dashboard/admin/super/booking/manage')}
                >
                  📋 Manage Bookings
                </Link>
              </li>
            </>
          )}

          {/* LOGISTICS GROUP */}
          <li
            onClick={() => toggleMenu('logistics')}
            className={styles.dropdownToggle}
          >
            🚚 Logistics {openMenus.logistics ? '▲' : '▼'}
          </li>
          {openMenus.logistics && (
            <>
              <li>
                <Link
                  href="/dashboard/admin/super/haulsmart"
                  className={isActive('/dashboard/admin/super/haulsmart')}
                >
                  🚚 HaulSmart
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/super/exports"
                  className={isActive('/dashboard/admin/super/exports')}
                >
                  📦 Exports
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/super/currys"
                  className={isActive('/dashboard/admin/super/currys')}
                >
                  🚛 Currys
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/super/distributors"
                  className={isActive('/dashboard/admin/super/distributors')}
                >
                  📦 Distributors
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/super/manufacturers"
                  className={isActive('/dashboard/admin/super/manufacturers')}
                >
                  🏭 Manufacturers
                </Link>
              </li>
            </>
          )}

          {/* ADMIN TOOLS GROUP */}
          <li
            onClick={() => toggleMenu('admin')}
            className={styles.dropdownToggle}
          >
            👤 Admin Tools {openMenus.admin ? '▲' : '▼'}
          </li>
          {openMenus.admin && (
            <>
              <li>
                <Link
                  href="/dashboard/admin/super/reports"
                  className={isActive('/dashboard/admin/super/reports')}
                >
                  📋 Reports
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/super/finances"
                  className={isActive('/dashboard/admin/super/finances')}
                >
                  💰 Finances
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/super/admins"
                  className={isActive('/dashboard/admin/super/admins')}
                >
                  👑 Manage Admins
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/super/forwarders"
                  className={isActive('/dashboard/admin/super/forwarders')}
                >
                  🚚 Forwarders
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/super/users"
                  className={isActive('/dashboard/admin/super/users')}
                >
                  👥 Users
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/super/customs"
                  className={isActive('/dashboard/admin/super/customs')}
                >
                  🛃 Customs
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/super/partners"
                  className={isActive('/dashboard/admin/super/partners')}
                >
                  🤝 Partners
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/super/settings"
                  className={isActive('/dashboard/admin/super/settings')}
                >
                  ⚙️ Settings
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* ✅ Logout Button */}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/login' })}
        className={styles.logoutButton}
      >
        🚪 Logout
      </button>
    </aside>
  );
}
