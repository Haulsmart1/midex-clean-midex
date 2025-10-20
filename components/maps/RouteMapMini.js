'use client';

import { useEffect, useRef } from 'react';
import tt from '@tomtom-international/web-sdk-maps';

export default function RouteMapMini({ fromCoords, toCoords, apiKey }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!fromCoords || !toCoords || !apiKey || !containerRef.current) return;

    const map = tt.map({
      key: apiKey,
      container: containerRef.current,
      center: [fromCoords.lon, fromCoords.lat],
      zoom: 5,
    });
    mapRef.current = map;

    const handleLoad = () => {
      const route = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [fromCoords.lon, fromCoords.lat],
            [toCoords.lon, toCoords.lat],
          ],
        },
      };

      if (!map.getSource('mini-route')) {
        map.addSource('mini-route', { type: 'geojson', data: route });
        map.addLayer({
          id: 'mini-route',
          type: 'line',
          source: 'mini-route',
          paint: { 'line-color': '#ff6600', 'line-width': 4 },
        });
      }

      const bounds = new tt.LngLatBounds();
      bounds.extend([fromCoords.lon, fromCoords.lat]);
      bounds.extend([toCoords.lon, toCoords.lat]);
      map.fitBounds(bounds, { padding: 40 });
    };

    map.on('load', handleLoad);

    // ✅ Always return a function
    return () => {
      try {
        map.off('load', handleLoad);
        if (typeof map.remove === 'function') {
          map.remove();
        }
      } catch (err) {
        console.warn('RouteMapMini cleanup failed:', err);
      } finally {
        mapRef.current = null;
      }
    };
  }, [fromCoords, toCoords, apiKey]);

  return (
    <div
      ref={containerRef}
      style={{
        height: '200px',
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
      aria-label="TomTom mini route map"
    />
  );
}

