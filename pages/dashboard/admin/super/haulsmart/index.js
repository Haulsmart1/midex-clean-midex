import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';

export default function HaulSmartPage() {
  const data = [
    { id: 1, shipment: "HSX-1023", status: "Delivered", date: "2025-08-12" },
    { id: 2, shipment: "HSX-1044", status: "In Transit", date: "2025-08-13" },
    { id: 3, shipment: "HSX-1067", status: "Delayed", date: "2025-08-14" },
  ];

  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>🚚 HaulSmart | Super Admin</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="mb-4 fw-bold">🚚 HaulSmart Shipments</h1>

        <div className="card bg-dark shadow border-0">
          <div className="card-body">
            <table className="table table-hover table-dark align-middle">
              <thead className="table-primary text-dark">
                <tr>
                  <th>Shipment ID</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id}>
                    <td>{row.shipment}</td>
                    <td>
                      <span
                        className={`badge px-3 py-2 fw-bold ${
                          row.status === "Delivered"
                            ? "bg-success"
                            : row.status === "In Transit"
                            ? "bg-warning text-dark"
                            : "bg-danger"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td>{row.date}</td>
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
