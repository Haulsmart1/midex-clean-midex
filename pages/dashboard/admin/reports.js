'use client';

import AdminLayout from '@/components/layouts/AdminLayout';

export default function AdminReports() {
  const reports = [
    { id: 1, title: 'Monthly Revenue', date: '2025-08-01', status: 'Completed' },
    { id: 2, title: 'User Registrations', date: '2025-08-05', status: 'In Progress' },
    { id: 3, title: 'Shipment Summary', date: '2025-08-10', status: 'Completed' },
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            📊 Admin Reports
          </h1>
          <button className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-500 transition">
            ➕ Generate Report
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-gray-500 text-sm">Total Reports</h2>
            <p className="text-2xl font-bold text-blue-700">{reports.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-gray-500 text-sm">Completed</h2>
            <p className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.status === 'Completed').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-gray-500 text-sm">In Progress</h2>
            <p className="text-2xl font-bold text-yellow-600">
              {reports.filter(r => r.status === 'In Progress').length}
            </p>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border-b p-3">Report Title</th>
                <th className="border-b p-3">Date</th>
                <th className="border-b p-3">Status</th>
                <th className="border-b p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-100 transition">
                  <td className="p-3">{report.title}</td>
                  <td className="p-3">{report.date}</td>
                  <td
                    className={`p-3 font-bold ${
                      report.status === 'Completed'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {report.status}
                  </td>
                  <td className="p-3">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

