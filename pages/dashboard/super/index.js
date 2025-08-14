// File: pages/dashboard/super/index.js

import { useState } from 'react';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import styles from '@/styles/SuperAdminDashboard.module.css';

// Section: Mocked users (replace with actual API or props if needed)
const initialUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', disabled: false },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', disabled: true },
  { id: 3, name: 'Charlie Lee', email: 'charlie@example.com', disabled: false },
];

export default function SuperAdminDashboard() {
  const user = { role: 'super admin' }; // Replace with actual session user
  const [users, setUsers] = useState(initialUsers);

  // Section: Toggle user status (enabled/disabled)
  const toggleUserStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, disabled: !u.disabled } : u
      )
    );
  };

  return (
    <SuperAdminLayout user={user}>
      <div className={styles.dashboardWrapper}>
        <h1 className={styles.title}>🌟 Super Admin Dashboard</h1>
        <p className={styles.subtitle}>
          Welcome to the super admin area. Manage all user access below.
        </p>

        {/* Section: User Management Table */}
        <div className={styles.userTable}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Toggle</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.disabled ? 'Disabled' : 'Enabled'}</td>
                  <td>
                    <button onClick={() => toggleUserStatus(u.id)}>
                      {u.disabled ? 'Enable' : 'Disable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
