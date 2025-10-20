'use client';

import React, { useEffect, useRef, useState } from 'react';
import tt from '@tomtom-international/web-sdk-maps';

export default function TomTomRouteMap({ routeKey, route }) {
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  // ✅ Initialize map ONCE
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    try {
      const mapInstance = tt.map({
        key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY,
        container: containerRef.current,
        center: [-6.26, 53.35], // Default Dublin
        zoom: 6,
      });

      mapRef.current = mapInstance;
    } catch (err) {
      console.error('[TomTomRouteMap init error]', err);
      setError('Failed to load TomTom map.');
    }

    return () => {
      if (mapRef.current && typeof mapRef.current.remove === 'function') {
        mapRef.current.remove();
      }
      mapRef.current = null;
    };
  }, []);

  // ✅ Update route line when `route` changes
  useEffect(() => {
    if (!route || !Array.isArray(route.points) || route.points.length === 0) {
      setError(`❌ Unknown route: ${routeKey}`);
      return;
    }
    if (!mapRef.current) return;

    const mapInstance = mapRef.current;
    const sourceId = 'route';

    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: route.points.map(([lat, lon]) => [lon, lat]),
      },
    };

    // Update or add source
    if (mapInstance.getSource(sourceId)) {
      mapInstance.getSource(sourceId).setData(geojson);
    } else {
      mapInstance.addSource(sourceId, { type: 'geojson', data: geojson });
      mapInstance.addLayer({
        id: sourceId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#0066cc',
          'line-width': 4,
        },
      });
    }

    // Fit bounds to new route
    const bounds = new tt.LngLatBounds();
    route.points.forEach(([lat, lon]) => bounds.extend([lon, lat]));
    mapInstance.fitBounds(bounds, { padding: 40 });

  }, [routeKey, route]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!route) return <div>❌ Unknown route: {routeKey}</div>;

  return (
    <div
      ref={containerRef}
      style={{
        height: '400px',
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
      aria-label="TomTom route map"
    />
  );
}
