// components/layouts/SuperAdminLayout.js
import SuperAdminSidebar from '@/components/layouts/sidebars/SuperAdminSidebar';
import styles from '@/styles/SuperAdminDashboard.module.css';


export default function SuperAdminLayout({ children, user }) {
  return (
    <div className={styles.superadminWrapper}>
      <SuperAdminSidebar user={user} />
      <main className={styles.superadminMain}>
        {children}
      </main>
    </div>
  );
}
