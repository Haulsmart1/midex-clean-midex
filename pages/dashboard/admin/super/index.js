import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout'; // ✅ Correct import!

export default function SuperAdminDashboard() {
  return (
    <SuperAdminLayout>
      <Head>
        <title>Super Admin Dashboard | Midnight Express</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="display-5 fw-bold mb-4 text-center">Super Admin Control Panel</h1>

        <div className="row g-4">
          {/* Add User */}
          <div className="col-md-4">
            <h4>Add User</h4>
            <input type="text" placeholder="Name" className="form-control mb-2" />
            <input type="text" placeholder="Company Name" className="form-control mb-2" />
            <input type="email" placeholder="Email" className="form-control mb-2" />
            <input type="text" placeholder="Phone" className="form-control mb-2" />
            <input type="text" placeholder="Address" className="form-control mb-2" />
            <input type="text" placeholder="Postcode" className="form-control mb-2" />
            <input type="text" placeholder="EORI/XORI" className="form-control mb-3" />
            <button className="btn btn-primary w-100">Add User</button>
          </div>

          {/* Add Forwarder */}
          <div className="col-md-4">
            <h4>Add Forwarder</h4>
            <input type="text" placeholder="Name" className="form-control mb-2" />
            <input type="email" placeholder="Email" className="form-control mb-2" />
            <input type="text" placeholder="Phone" className="form-control mb-2" />
            <input type="text" placeholder="Address" className="form-control mb-3" />
            <button className="btn btn-dark w-100">Add Forwarder</button>
          </div>

          {/* Add Admin */}
          <div className="col-md-4">
            <h4>Add Admin</h4>
            <input type="text" placeholder="Full Name" className="form-control mb-2" />
            <input type="email" placeholder="Email" className="form-control mb-3" />
            <button className="btn btn-warning w-100">Add Admin</button>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
