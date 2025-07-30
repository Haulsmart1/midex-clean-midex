// pages/dashboard/super/forwarders/index.js

import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabaseClient';
import SuperAdminLayout from '../../../../components/layouts/SuperAdminLayout';
import Link from 'next/link';
import { CSVLink } from 'react-csv';

export default function ForwardersIndexPage() {
  const [forwarders, setForwarders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchForwarders();
  }, []);

  const fetchForwarders = async () => {
    const { data, error } = await supabase
      .from('forwarders')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setForwarders(data);
      setFiltered(data);
    }
  };

  const handleSearch = (term) => {
    setSearch(term);
    if (!term) return setFiltered(forwarders);

    const filteredData = forwarders.filter((f) =>
      f.name.toLowerCase().includes(term.toLowerCase()) ||
      f.contact_email.toLowerCase().includes(term.toLowerCase())
    );

    setFiltered(filteredData);
  };

  return (
    <SuperAdminLayout>
      <div className="container py-4 text-white">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-6 fw-bold">Forwarders</h1>
          <CSVLink
            data={filtered}
            filename="forwarders_export.csv"
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
              <th>Contact Email</th>
              <th>Phone</th>
              <th>Company Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id}>
                <td>{f.name}</td>
                <td>{f.contact_email}</td>
                <td>{f.phone}</td>
                <td>{f.company_name}</td>
                <td>
                  <Link href={`/dashboard/super/forwarders/${f.id}`} className="btn btn-sm btn-warning me-2">
                    Edit
                  </Link>
                  <Link href={`/dashboard/super/forwarders/view/${f.id}`} className="btn btn-sm btn-outline-info">
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
