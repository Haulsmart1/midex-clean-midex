// pages/dashboard/super/users/index.js

import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabaseClient';
import SuperAdminLayout from '../../../../components/layouts/SuperAdminLayout';
import Link from 'next/link';
import { CSVLink } from 'react-csv';

export default function UsersIndexPage() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setUsers(data);
      setFiltered(data);
    }
  };

  const handleSearch = (term) => {
    setSearch(term);
    if (!term) return setFiltered(users);

    const filteredData = users.filter((u) =>
      u.name.toLowerCase().includes(term.toLowerCase()) ||
      u.email.toLowerCase().includes(term.toLowerCase())
    );

    setFiltered(filteredData);
  };

  return (
    <SuperAdminLayout>
      <div className="container py-4 text-white">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-6 fw-bold">Users</h1>
          <CSVLink
            data={filtered}
            filename="users_export.csv"
            className="btn btn-outline-light"
          >
            Export CSV
          </CSVLink>
        </div>

        <div className="mb-3">
          <input
            className="form-control"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <table className="table table-dark table-bordered align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.company_name}</td>
                <td>
                  <Link href={`/dashboard/super/users/${u.id}`} className="btn btn-sm btn-warning me-2">
                    Edit
                  </Link>
                  <Link href={`/dashboard/super/users/view/${u.id}`} className="btn btn-sm btn-outline-info">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SuperAdminLayout>
  );
}
