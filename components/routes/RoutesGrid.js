// components/routes/RoutesGrid.js
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

function SafeMapImage({ from, to, apiKey }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div style={{
        height: '200px',
        backgroundColor: '#1e1e1e',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#999',
        fontSize: '0.9rem'
      }}>
        Map Unavailable
      </div>
    );
  }

  const fromEncoded = encodeURIComponent(from);
  const toEncoded = encodeURIComponent(to);
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?key=${apiKey}&size=400x200&markers=${fromEncoded}&markers=${toEncoded}&path=color:blue|weight:3|${fromEncoded}|${toEncoded}`;

  return (
    <img
      src={mapUrl}
      alt={`Map from ${from} to ${to}`}
      style={{
        height: '200px',
        objectFit: 'cover',
        borderBottomLeftRadius: '6px',
        borderBottomRightRadius: '6px',
      }}
      onError={() => setError(true)}
    />
  );
}

export default function RoutesGrid({ apiKey }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchRoutes = async () => {
      const { data, error } = await supabase.from('routes').select('*').order('from');
      if (error) {
        console.error('Supabase Error:', error);
      } else if (!ignore) {
        const unique = Array.from(
          new Map(data.map(item => [`${item.from}-${item.to}`, item])).values()
        );
        setRoutes(unique);
      }
      if (!ignore) setLoading(false);
    };

    fetchRoutes();
    return () => { ignore = true };
  }, []);

  if (loading) return <p className="text-secondary">Loading Routes...</p>;

  if (!routes.length) {
    return <div className="alert alert-warning text-dark">No routes available right now.</div>;
  }

  return (
    <div className="row g-4">
      {routes.map((route, idx) => (
        <div key={route.id || idx} className="col-md-6 col-lg-4">
          <div className="card bg-dark text-light shadow-sm border-light h-100">
            <div className="card-body">
              <h5 className="card-title text-success">{route.from} ⇄ {route.to}</h5>
              <p className="card-text small">{route.description}</p>
            </div>
            <SafeMapImage from={route.from} to={route.to} apiKey={apiKey} />
          </div>
        </div>
      ))}
    </div>
  );
}
