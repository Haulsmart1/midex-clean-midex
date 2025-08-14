import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';

export default function CrossBorderBookingsPage() {
  const bookings = [
    { id: 'CB-2001', origin: 'UK', destination: 'Spain', status: 'In Transit', date: '2025-08-10' },
    { id: 'CB-2002', origin: 'Germany', destination: 'Italy', status: 'Delayed', date: '2025-08-11' },
    { id: 'CB-2003', origin: 'France', destination: 'Netherlands', status: 'Delivered', date: '2025-08-12' },
  ];

  return (
    <SuperAdminLayout>
      <Head>
        <title>Cross Border Bookings | Super Admin</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="mb-4 fw-bold">🌍 Cross Border Bookings</h1>
        <div className="card bg-dark shadow border-0">
          <div className="card-body">
            <table className="table table-hover table-dark">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.origin}</td>
                    <td>{b.destination}</td>
                    <td>
                      <span className={`badge ${
                        b.status === "Delivered" ? "bg-success" :
                        b.status === "In Transit" ? "bg-warning text-dark" :
                        "bg-danger"
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
