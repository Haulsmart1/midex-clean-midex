'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminLayout from '@/components/layouts/AdminLayout';
import Head from 'next/head';
import { toast } from 'react-toastify';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch reports');
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const generateReport = async () => {
    const { error } = await supabase.from('reports').insert([
      {
        title: 'New Report',
        status: 'In Progress',
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      toast.error('Failed to generate report');
    } else {
      toast.success('Report started!');
      fetchReports();
    }
  };

  const deleteReport = async (id) => {
    if (!confirm('Delete this report?')) return;
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (error) toast.error('Failed to delete report');
    else {
      toast.success('Report deleted');
      fetchReports();
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <AdminLayout>
      <Head>
        <title>Reports | Admin | Midnight Express</title>
      </Head>

      <div className="container py-4 text-white">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-6 fw-bold">📊 Reports</h1>
          <button
            onClick={generateReport}
            className="btn btn-success shadow-sm"
          >
            ➕ Generate Report
          </button>
        </div>

        {/* Quick Stats */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card bg-dark border-light text-center shadow-sm p-3">
              <h5>Total Reports</h5>
              <h2 className="text-primary">{reports.length}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-dark border-light text-center shadow-sm p-3">
              <h5>Completed</h5>
              <h2 className="text-success">
                {reports.filter((r) => r.status === 'Completed').length}
              </h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-dark border-light text-center shadow-sm p-3">
              <h5>In Progress</h5>
              <h2 className="text-warning">
                {reports.filter((r) => r.status === 'In Progress').length}
              </h2>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="table-responsive">
          {loading ? (
            <div className="alert alert-info">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="alert alert-warning">No reports found.</div>
          ) : (
            <table className="table table-dark table-striped table-bordered align-middle">
              <thead>
                <tr>
                  <th>Report Title</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.title}</td>
                    <td>{new Date(report.created_at).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`badge ${
                          report.status === 'Completed'
                            ? 'bg-success'
                            : 'bg-warning text-dark'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2">
                        View
                      </button>
                      <button
                        onClick={() => deleteReport(report.id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}


