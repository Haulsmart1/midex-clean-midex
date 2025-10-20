import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import Link from 'next/link';
import { CSVLink } from 'react-csv';
import styles from '@/styles/Admin.module.css';

export default function AdminsIndexPage() {
  const [admins, setAdmins] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*, admins(role)')
      .order('created_at', { ascending: false });

    if (data) {
      setAdmins(data);
      setFiltered(data);
    }
  };

  const handleSearch = (term) => {
    setSearch(term);
    if (!term) return setFiltered(admins);

    const filteredData = admins.filter((admin) =>
      admin.name.toLowerCase().includes(term.toLowerCase()) ||
      admin.email.toLowerCase().includes(term.toLowerCase())
    );

    setFiltered(filteredData);
  };

  return (
    <SuperAdminLayout>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>👑 Admin Management</h1>
            <CSVLink
              data={filtered}
              filename="admins_export.csv"
              className={styles.exportBtn}
            >
              📥 Export CSV
            </CSVLink>
          </div>

          <input
            className={styles.searchInput}
            placeholder="🔍 Search by name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Phone</th>
                  <th className={styles.th}>Position</th>
                  <th className={styles.th}>Role</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((admin) => (
                  <tr key={admin.id} className={styles.tr}>
                    <td className={styles.td}>{admin.name}</td>
                    <td className={styles.td}>{admin.email}</td>
                    <td className={styles.td}>{admin.phone}</td>
                    <td className={styles.td}>{admin.position}</td>
                    <td className={styles.td}>{admin.admins?.role || 'admin'}</td>
                    <td className={styles.td}>
                      <Link
                        href={`/dashboard/super/admins/${admin.id}`}
                        className={styles.editBtn}
                      >
                        ✏️ Edit
                      </Link>
                      <Link
                        href={`/dashboard/super/admins/view/${admin.id}`}
                        className={styles.viewBtn}
                      >
                        👁 View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
