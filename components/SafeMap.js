'use client';
import React, { useEffect, useRef } from 'react';

// legs: Array of { points: [[lat, lon], ...], isFerry: true/false }
export default function SafeMap({ legs }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.tt || !Array.isArray(legs) || legs.length === 0) return;

    const map = tt.map({
      key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY,
      container: mapRef.current,
      center: legs[0].points[0] ? [legs[0].points[0][1], legs[0].points[0][0]] : [0, 0],
      zoom: 6,
    });

    map.on('load', () => {
      legs.forEach((leg, idx) => {
        const geojson = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: leg.points.map(([lat, lon]) => [lon, lat]),
          },
        };
        map.addLayer({
          id: `route-${idx}`,
          type: 'line',
          source: { type: 'geojson', data: geojson },
          paint: {
            'line-color': leg.isFerry ? '#888' : '#00f',
            'line-width': 5,
            ...(leg.isFerry
              ? { 'line-dasharray': [2, 6] } // dashed for ferry
              : {}),
          },
        });
      });
    });

    return () => map.remove();
  }, [legs]);

  return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
}
