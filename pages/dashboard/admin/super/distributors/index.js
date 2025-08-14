import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';

export default function DistributorsPage() {
  const distributors = [
    { id: 1, name: 'Global Distribution Co.', contact: 'global@dist.com', status: 'Active' },
    { id: 2, name: 'Tech Distributors UK', contact: 'support@techdist.uk', status: 'Inactive' },
  ];

  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>Distributors | Super Admin</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="mb-4 fw-bold">🏢 Manage Distributors</h1>
        <div className="card shadow-lg border border-light">
          <div className="card-body">
            <table className="table table-dark table-hover align-middle">
              <thead className="table-light text-dark">
                <tr>
                  <th>Name</th>
                  <th>Contact Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {distributors.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.contact}</td>
                    <td>
                      <span className={`badge ${d.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary">Edit</button>
                    </td>
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
