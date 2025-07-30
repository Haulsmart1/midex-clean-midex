import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';

export default function PublicRoutes() {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    supabase
      .from('routes')
      .select('*')
      .eq('status', 'active')
      .then(({ data }) => setRoutes(data));
  }, []);

  return (
    <>
      <Head>
        <title>Freight Routes | Midnight Express</title>
      </Head>

      <div className="container py-5">
        <h1 className="display-5 fw-bold mb-4">Our Active Routes</h1>
        <div className="row g-4">
          {routes.map((route) => (
            <div key={route.id} className="col-md-6 col-lg-4">
              <div className="card bg-black text-white border-light p-4 shadow-sm h-100">
                <h5 className="fw-bold">{route.origin} → {route.destination}</h5>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
