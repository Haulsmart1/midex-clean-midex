import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '@/components/layouts/AdminLayout';
import styles from '@/styles/AdminDashboard.module.css';

export default function AdminDashboard() {
  const links = [
    { href: '/dashboard/admin/overview', label: '📊 Overview' },
    { href: '/dashboard/admin/bookings', label: '📦 Bookings' },
    { href: '/dashboard/admin/registrations', label: '📝 Registrations' },
    { href: '/dashboard/admin/commissions', label: '💸 Commissions' },
    { href: '/dashboard/admin/finance', label: '💰 Finance' },
    { href: '/dashboard/admin/invoices', label: '🧾 Invoices' },
    { href: '/dashboard/admin/payments', label: '💳 Payments' },
    { href: '/dashboard/admin/forwarders', label: '🚚 Forwarders' },
    { href: '/dashboard/admin/users', label: '👥 Users' },
    { href: '/dashboard/admin/reports', label: '📋 Reports' },
    { href: '/dashboard/admin/support', label: '🛠 Support' },
    { href: '/dashboard/admin/settings', label: '⚙️ Settings' },
  ];

  return (
    <AdminLayout>
      <Head>
        <title>Admin Dashboard | Midnight Express</title>
      </Head>
      <h1 className={styles.title}>🛠️ Admin Control Panel</h1>
      <div className={styles.cardGrid}>
        {links.map(({ href, label }) => (
          <Link key={href} href={href} className={styles.navCard}>
            {label}
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}
