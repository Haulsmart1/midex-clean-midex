'use client';

import Head from 'next/head';
import Link from 'next/link';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import styles from '@/styles/SuperAdminDashboard.module.css';

export default function SuperAdminDashboard() {
  const user = { role: 'super admin' };

  const links = [
    { href: "/dashboard/admin/super/booking/create", label: "➕ Create Booking" },
    { href: "/dashboard/admin/super/booking/internal", label: "🏠 Internal Bookings" },
    { href: "/dashboard/admin/super/booking/cross-border", label: "🌍 Border Bookings" },
    { href: "/dashboard/admin/super/haulsmart", label: "🚚 HaulSmart" },
    { href: "/dashboard/admin/super/exports", label: "📦 Exports" },
    { href: "/dashboard/admin/super/currys", label: "🚛 Currys" },
    { href: "/dashboard/admin/super/distributors", label: "📦 Distributors" },
    { href: "/dashboard/admin/super/manufacturers", label: "🏭 Manufacturers" },
    { href: "/dashboard/admin/super/reports", label: "📋 Reports" },
    { href: "/dashboard/admin/super/finances", label: "💰 Finances" },
    { href: "/dashboard/admin/super/admins", label: "👑 Manage Admins" },
    { href: "/dashboard/admin/super/forwarders", label: "🚚 Forwarders" },
    { href: "/dashboard/admin/super/users", label: "👥 Users" },
    { href: "/dashboard/admin/super/customs", label: "🛃 Customs" },
    { href: "/dashboard/admin/super/partners", label: "🤝 Partners" },
    { href: "/dashboard/admin/super/settings", label: "⚙️ Settings" },
  ];

  return (
    <SuperAdminLayout user={user}>
      <Head>
        <title>Super Admin Dashboard | Midnight Express</title>
      </Head>

      <div className={styles.superadminMain}>
        <h1 className={styles.gradientTitle}>
          <span style={{ fontSize: '2rem' }}>🟦</span> Super Admin <span style={{ color: '#ff00ff' }}>Control Panel</span>
        </h1>

        <div className={styles.cardGrid}>
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className={styles.navCard}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
}
