import AdminLayout from '../../../components/layouts/AdminLayout';
import styles from '../../../styles/AdminSidebar.module.css';

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <h1 className={styles.heading}>Manage Users</h1>
      <p className={styles.subheading}>View, onboard, and manage customer accounts.</p>

      {/* Placeholder for user table or management interface */}
      <div style={{ marginTop: '2rem' }}>
        <p>No user data loaded. Connect to Supabase or API to manage accounts here.</p>
      </div>
    </AdminLayout>
  );
}
