'use client';

import React, { useEffect, useRef } from 'react';

export default function SafeMap({ legs }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let map;
    async function initMap() {
      if (typeof window === 'undefined') return;
      const tt = (await import('@tomtom-international/web-sdk-maps')).default;

      if (!containerRef.current || !Array.isArray(legs) || legs.length === 0) return;

      // ✅ flip [lat,lon] → [lon,lat] only for TomTom
      const firstPoint = legs[0]?.points?.[0];
      const center = firstPoint ? [firstPoint[1], firstPoint[0]] : [0, 0];

      map = tt.map({
        key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY,
        container: containerRef.current,
        center,
        zoom: 6,
      });

      mapRef.current = map;

      map.on('load', () => {
        legs.forEach((leg, idx) => {
          const coords = (leg.points || []).map(([lat, lon]) => [lon, lat]); // flip each point

          const geojson = {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: coords },
          };

          map.addSource(`route-${idx}`, { type: 'geojson', data: geojson });
          map.addLayer({
            id: `route-${idx}`,
            type: 'line',
            source: `route-${idx}`,
            paint: {
              'line-color': leg.isFerry ? '#888' : '#00f',
              'line-width': 5,
              ...(leg.isFerry ? { 'line-dasharray': [2, 6] } : {}),
            },
          });
        });
      });
    }
    initMap();

    return () => {
      try { mapRef.current?.remove?.(); } catch {}
      mapRef.current = null;
    };
  }, [legs]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '400px' }} />
  );
}
