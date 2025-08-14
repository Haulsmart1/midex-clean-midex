import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';

export default function ManufacturersPage() {
  const manufacturers = [
    { id: 1, name: 'Midnight Components Ltd.', location: 'London, UK', contact: 'midnight@manufacture.com' },
    { id: 2, name: 'FastBuild Industries', location: 'Manchester, UK', contact: 'hello@fastbuild.com' },
  ];

  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>Manufacturers | Super Admin</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="mb-4 fw-bold">🏭 Manage Manufacturers</h1>
        <div className="card shadow-lg border border-light">
          <div className="card-body">
            <table className="table table-dark table-hover align-middle">
              <thead className="table-light text-dark">
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Contact Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {manufacturers.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.location}</td>
                    <td>{m.contact}</td>
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
