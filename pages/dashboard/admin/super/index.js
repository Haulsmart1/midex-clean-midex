import Head from 'next/head';
import Link from 'next/link';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import styles from '@/styles/SuperAdminDashboard.module.css';

export default function SuperAdminDashboard() {
  const user = { role: 'super admin' }; // Replace with real session later

  const links = [
    
    { href: "/dashboard/admin/super/bookings/internal", label: "🏠 Internal Bookings" },
    { href: "/dashboard/admin/super/bookings/crossborder", label: "🌍 Cross Border Bookings" },
    { href: '/dashboard/admin/super/haulsmart', label: '🚚 HaulSmart' },
    { href: '/dashboard/admin/super/exports', label: '📦 Exports' },
    { href: '/dashboard/admin/super/reports', label: '📋 Reports' },
    { href: "/dashboard/admin/super/finances", label: "💰 Finances" },
    { href: '/dashboard/admin/super/settings', label: '⚙️ Settings' },
    { href: '/dashboard/admin/super/admins', label: '👑 Manage Admins' },
    { href: '/dashboard/admin/super/forwarders', label: '🚚 Manage Forwarders' },
    { href: '/dashboard/admin/super/users', label: '👥 Manage Users' },
    { href: '/dashboard/admin/super/customs', label: '🛃 Customs' },
    { href: '/dashboard/admin/super/partners', label: '🤝 Partners' },
    { href: '/dashboard/admin/super/distributors', label: '📦 Distributors' },
    { href: '/dashboard/admin/super/manufacturers', label: '🏭 Manufacturers' },
    { href: '/dashboard/admin/super/currys', label: '🚛 Currys' },
  ];

  return (
    <SuperAdminLayout user={user}>
      <Head>
        <title>Super Admin Dashboard | Midnight Express</title>
      </Head>

      <div className={styles.dashboardWrapper}>
        <h1 className={styles.title}>🌌 Super Admin Control Panel</h1>
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
