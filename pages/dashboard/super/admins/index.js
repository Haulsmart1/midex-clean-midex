import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import Link from 'next/link';
import { CSVLink } from 'react-csv';

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
      <div className="container py-4 text-white">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-6 fw-bold">Admins</h1>
          <CSVLink
            data={filtered}
            filename="admins_export.csv"
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
              <th>Position</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.name}</td>
                <td>{admin.email}</td>
                <td>{admin.phone}</td>
                <td>{admin.position}</td>
                <td>{admin.admins?.role || 'admin'}</td>
                <td>
                  <Link
                    href={`/dashboard/super/admins/${admin.id}`}
                    className="btn btn-sm btn-warning me-2"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/dashboard/super/admins/view/${admin.id}`}
                    className="btn btn-sm btn-outline-info"
                  >
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
