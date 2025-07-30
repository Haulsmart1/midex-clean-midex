import React, { useEffect, useState } from 'react';

/**
 * UserTable component
 * @param {Object[]} data - Array of user objects
 */
export default function UserTable({ data = [] }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (Array.isArray(data)) {
      setUsers(data);
    } else {
      console.warn('⚠️ Invalid user data provided to UserTable:', data);
      setUsers([]);
    }
  }, [data]);

  if (!Array.isArray(users)) {
    return (
      <div className="alert alert-danger">
        ❌ Error: User data is not available.
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="alert alert-warning">
        🚫 No users to display.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-dark table-bordered table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={user.id || idx}>
              <td>{idx + 1}</td>
              <td>{user.fullName || 'N/A'}</td>
              <td>{user.email || 'N/A'}</td>
              <td>{user.role || 'User'}</td>
              <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

