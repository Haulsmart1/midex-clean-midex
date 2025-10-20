'use client';

import React, { useEffect, useRef } from 'react';
import tt from '@tomtom-international/web-sdk-maps';

export default function SolidRouteMap({ points }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const mapInstance = tt.map({
      key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY,
      container: containerRef.current,
      center: [-6.26, 53.35],
      zoom: 5,
    });

    mapRef.current = mapInstance;

    return () => {
      if (mapRef.current?.remove) {
        mapRef.current.remove();
      }
      mapRef.current = null;
    };
  }, []);

  // Update line only
  useEffect(() => {
    if (!points?.length || !mapRef.current) return;

    const map = mapRef.current;
    const sourceId = 'solid-route';
    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: points.map(([lat, lon]) => [lon, lat]),
      },
    };

    if (map.getSource(sourceId)) {
      map.getSource(sourceId).setData(geojson);
    } else {
      map.addSource(sourceId, { type: 'geojson', data: geojson });
      map.addLayer({
        id: sourceId,
        type: 'line',
        source: sourceId,
        paint: { 'line-color': '#ff0000', 'line-width': 5 },
      });
    }

    const bounds = new tt.LngLatBounds();
    points.forEach(([lat, lon]) => bounds.extend([lon, lat]));
    map.fitBounds(bounds, { padding: 40 });
  }, [points]);

  return <div ref={containerRef} style={{ height: '400px', width: '100%' }} />;
}
