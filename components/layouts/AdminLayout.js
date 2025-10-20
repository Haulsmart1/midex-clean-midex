// components/layouts/AdminLayout.js
import AdminSidebar from '@/components/layouts/sidebars/AdminSidebar';
import styles from '@/styles/AdminLayout.module.css';

export default function AdminLayout({ children }) {
  return (
    <div className={styles.container}>
      <AdminSidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
