// components/maps/ORSRouteMap.js (FULL – Leaflet map with Polyline)

import React from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function ORSRouteMap({ routeLine }) {
  if (!routeLine || !routeLine.coordinates?.length) {
    return <div style={{ color: '#ccc' }}>Map unavailable — no route data.</div>;
  }

  const positions = routeLine.coordinates.map(([lng, lat]) => [lat, lng]);
  const bounds = positions.length > 0 ? positions : [[51.505, -0.09]];

  return (
    <MapContainer
      bounds={bounds}
      style={{ height: '400px', width: '100%', borderRadius: '8px', marginTop: '1rem' }}
      scrollWheelZoom={false}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={positions} color="#00ffff" weight={4} />
    </MapContainer>
  );
}
