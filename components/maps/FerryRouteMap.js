'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function FerryRouteMap({ routeKey, route }) {
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!route || !Array.isArray(route.points) || route.points.length === 0) {
      setError(`❌ Unknown route: ${routeKey}`);
      return;
    }

    let map;

    const loadMap = async () => {
      const tt = await import('@tomtom-international/web-sdk-maps');

      map = tt.map({
        key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY,
        container: containerRef.current,
        center: [route.points[0][1], route.points[0][0]], // [lon, lat]
        zoom: 6,
      });

      mapRef.current = map;

      map.on('load', () => {
        const geojson = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: route.points.map(([lat, lon]) => [lon, lat]),
          },
        };

        map.addSource('ferry-route', { type: 'geojson', data: geojson });
        map.addLayer({
          id: 'ferry-route',
          type: 'line',
          source: 'ferry-route',
          paint: {
            'line-color': '#888',
            'line-width': 4,
            'line-dasharray': [2, 6],
          },
        });

        const bounds = new tt.LngLatBounds();
        route.points.forEach(([lat, lon]) => bounds.extend([lon, lat]));
        map.fitBounds(bounds, { padding: 40 });
      });
    };

    loadMap().catch((err) => {
      console.error('[Map error]', err);
      setError('Failed to load map.');
    });

    return () => {
      if (mapRef.current && typeof mapRef.current.remove === 'function') {
        mapRef.current.remove();
      }
      mapRef.current = null;
    };
  }, [routeKey, route]);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return <div ref={containerRef} style={{ height: 400, width: '100%' }} />;
}
