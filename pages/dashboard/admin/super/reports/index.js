import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';

export default function ReportsPage() {
  const reports = [
    { id: 1, title: "Monthly Revenue", date: "2025-08-01", status: "Completed" },
    { id: 2, title: "User Registrations", date: "2025-08-05", status: "In Progress" },
    { id: 3, title: "Shipment Summary", date: "2025-08-10", status: "Completed" },
  ];

  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>Reports | Super Admin</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="fw-bold mb-4">📋 Reports</h1>

        <div className="bg-dark p-4 rounded shadow-lg border border-light" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <table className="table table-dark table-hover align-middle mb-0">
            <thead className="table-light text-dark">
              <tr>
                <th>Report Title</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.title}</td>
                  <td>{report.date}</td>
                  <td>
                    <span className={`badge ${report.status === "Completed" ? "bg-success" : "bg-warning text-dark"}`}>
                      {report.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-info">
                      View
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
