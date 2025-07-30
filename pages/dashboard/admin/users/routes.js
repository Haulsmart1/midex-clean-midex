import { useEffect, useState } from 'react';
import Head from 'next/head';
import UserLayout from '../../../../components/layouts/UsersLayout';
import { supabase } from '/lib/supabaseClient';

export default function UserRoutes() {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('status', 'open')
        .order('from');

      if (!error) {
        const uniqueRoutes = Array.from(
          new Map(data.map(item => [`${item.from}-${item.to}`, item])).values()
        );
        setRoutes(uniqueRoutes);
      }
    };

    fetchRoutes();
  }, []);

  return (
    <UserLayout>
      <Head>
        <title>Available Routes | User Dashboard</title>
      </Head>

      <div className="container py-4">
        <h1 className="text-white mb-2">Freight Route Finder</h1>
        <p className="text-muted mb-4">These routes are customs cleared and user-available.</p>

        {routes.length === 0 ? (
          <div className="alert alert-warning">No routes available currently.</div>
        ) : (
          <div className="row g-4">
            {routes.map(route => (
              <div key={route.id} className="col-12 col-md-6 col-lg-4">
                <div className="card bg-dark text-white border-light shadow-sm p-3 h-100">
                  <h5 className="fw-bold">{route.from} ⇄ {route.to}</h5>
                  <p className="text-muted small">{route.description}</p>

                  <div style={{ height: '150px', overflow: 'hidden', borderRadius: '0.5rem' }}>
                    <img
                      src={`https://maps.googleapis.com/maps/api/staticmap?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&size=400x150&markers=${encodeURIComponent(route.from)}&markers=${encodeURIComponent(route.to)}&path=color:blue|weight:3|${encodeURIComponent(route.from)}|${encodeURIComponent(route.to)}`}
                      alt={`Route from ${route.from} to ${route.to}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <span className="badge bg-success mt-2">Status: {route.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
