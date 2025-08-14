import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';

export default function InternalBookingsPage() {
  const bookings = [
    { id: 'INT-1001', customer: 'Acme Ltd', status: 'Confirmed', date: '2025-08-10' },
    { id: 'INT-1002', customer: 'Globex Inc', status: 'Pending', date: '2025-08-11' },
    { id: 'INT-1003', customer: 'Umbrella Corp', status: 'Completed', date: '2025-08-12' },
  ];

  return (
    <SuperAdminLayout>
      <Head>
        <title>Internal Bookings | Super Admin</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="mb-4 fw-bold">📦 Internal Bookings</h1>
        <div className="card bg-dark shadow border-0">
          <div className="card-body">
            <table className="table table-hover table-dark">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.customer}</td>
                    <td>
                      <span className={`badge ${
                        b.status === "Confirmed" ? "bg-success" :
                        b.status === "Pending" ? "bg-warning text-dark" :
                        "bg-secondary"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td>{b.date}</td>
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
