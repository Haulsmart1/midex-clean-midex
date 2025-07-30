// components/admin/RouteTogglePanel.js

import { useState } from 'react';
import { routes } from '../../utils/routesConfig';

export default function RouteTogglePanel() {
  const [routeStatuses, setRouteStatuses] = useState(
    routes.reduce((acc, route) => {
      acc[route.slug] = route.status === 'open';
      return acc;
    }, {})
  );

  const toggleRoute = (slug) => {
    setRouteStatuses((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
    // Here, you'd also update the backend or context to persist changes
  };

  return (
    <div>
      <h2>Route Management</h2>
      <ul>
        {routes.map((route) => (
          <li key={route.slug}>
            {route.from} to {route.to}:{' '}
            <button onClick={() => toggleRoute(route.slug)}>
              {routeStatuses[route.slug] ? 'Disable' : 'Enable'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
