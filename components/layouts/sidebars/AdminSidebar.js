'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import styles from '@/styles/AdminSidebar.module.css';

export default function AdminSidebar() {
  const router = useRouter();

  const isActive = (path) => router.pathname === path ? styles.activeLink : '';

  return (
    <nav className={styles.sidebar}>
      {/* ✅ Back to Dashboard */}
      <div className={styles.dashboardLinkWrapper}>
        <Link href="/dashboard" className={styles.dashboardLink}>
          ← Back to Dashboard
        </Link>
      </div>

      <div>
        <h4 className={styles.title}>🛠️ Admin Panel</h4>
        <ul className="nav flex-column">
          <li><Link href="/dashboard/admin/overview" className={`${styles.navItem} ${isActive("/dashboard/admin/overview")}`}>📊 Overview</Link></li>
          <li><Link href="/dashboard/admin/bookings" className={`${styles.navItem} ${isActive("/dashboard/admin/bookings")}`}>📦 Bookings</Link></li>
          <li><Link href="/dashboard/admin/registrations" className={`${styles.navItem} ${isActive("/dashboard/admin/registrations")}`}>📝 Registrations</Link></li>
          <li><Link href="/dashboard/admin/commissions" className={`${styles.navItem} ${isActive("/dashboard/admin/commissions")}`}>💸 Commissions</Link></li>
          <li><Link href="/dashboard/admin/finance" className={`${styles.navItem} ${isActive("/dashboard/admin/finance")}`}>💰 Finance</Link></li>
          <li><Link href="/dashboard/admin/invoices" className={`${styles.navItem} ${isActive("/dashboard/admin/invoices")}`}>🧾 Invoices</Link></li>
          <li><Link href="/dashboard/admin/payments" className={`${styles.navItem} ${isActive("/dashboard/admin/payments")}`}>💳 Payments</Link></li>
          <li><Link href="/dashboard/admin/forwarders" className={`${styles.navItem} ${isActive("/dashboard/admin/forwarders")}`}>🚚 Forwarders</Link></li>
          <li><Link href="/dashboard/admin/users" className={`${styles.navItem} ${isActive("/dashboard/admin/users")}`}>👥 Users</Link></li>
          <li><Link href="/dashboard/admin/reports" className={`${styles.navItem} ${isActive("/dashboard/admin/reports")}`}>📋 Reports</Link></li>
          <li><Link href="/dashboard/admin/support" className={`${styles.navItem} ${isActive("/dashboard/admin/support")}`}>🛠️ Support</Link></li>
          <li><Link href="/dashboard/admin/settings" className={`${styles.navItem} ${isActive("/dashboard/admin/settings")}`}>⚙️ Settings</Link></li>
        </ul>
      </div>

      {/* ✅ Logout Button */}
      <button
        className={styles.logout}
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        🚪 Logout
      </button>
    </nav>
  );
}
