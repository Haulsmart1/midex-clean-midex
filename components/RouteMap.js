'use client';

import React, { useEffect, useRef } from 'react';

export default function RouteMap({ legs = [], polyline = [] }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  const key = process.env.NEXT_PUBLIC_TOMTOM_API_KEY || '';

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!containerRef.current || !key) return;

      try {
        const mod = await import('@tomtom-international/web-sdk-maps');
        if (cancelled) return;
        const tt = mod.default;

        const map = tt.map({
          key,
          container: containerRef.current,
          zoom: 5.2,
          center: [-4, 54.2],
        });

        mapRef.current = map;

        map.on('load', () => {
          const isValidCoord = ([lat, lon]) =>
            isFinite(lat) && isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;

          const coords = Array.isArray(polyline)
            ? polyline.filter(isValidCoord).map(([lat, lon]) => [lon, lat])
            : [];

          const geojson = {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: coords },
          };

          if (coords.length >= 2) {
            map.addSource('route', { type: 'geojson', data: geojson });
            map.addLayer({
              id: 'route-line',
              type: 'line',
              source: 'route',
              paint: {
                'line-width': 4,
                'line-color': '#21D4FD',
                'line-opacity': 0.9,
              },
            });

            const bounds = new tt.LngLatBounds();
            coords.forEach(c => bounds.extend(c));
            map.fitBounds(bounds, { padding: 30, maxZoom: 9 });

            // Start and end markers
            const addDot = (lngLat, color) => {
              const el = document.createElement('div');
              el.style.width = '10px';
              el.style.height = '10px';
              el.style.borderRadius = '50%';
              el.style.background = color;
              el.style.boxShadow = '0 0 0 2px rgba(0,0,0,.25)';
              new tt.Marker({ element: el }).setLngLat(lngLat).addTo(map);
            };

            addDot(coords[0], '#FF4D5A');
            addDot(coords[coords.length - 1], '#00E6A7');
          }
        });
      } catch (err) {
        console.error('TomTom init failed:', err);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [key, JSON.stringify(polyline)]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: 250,
        borderRadius: 12,
        overflow: 'hidden',
        background: '#0f1525',
      }}
    />
  );
}
