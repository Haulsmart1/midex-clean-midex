'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function LeafletMapCore({ from, to, routeLine }) {
  if (!from || !to) {
    return <p style={{ color: '#ccc' }}>Loading map…</p>;
  }

  // ✅ Defensive: ensure numbers
  const fromLat = Number(from.lat);
  const fromLng = Number(from.lng);
  const toLat = Number(to.lat);
  const toLng = Number(to.lng);

  if (isNaN(fromLat) || isNaN(fromLng) || isNaN(toLat) || isNaN(toLng)) {
    return <p style={{ color: 'red' }}>❌ Invalid coordinates provided</p>;
  }

  // ✅ Center between points
  const center = [(fromLat + toLat) / 2, (fromLng + toLng) / 2];

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '10px', overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom={false} // ✅ prevent accidental zoom chaos
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Collection marker */}
        <Marker position={[fromLat, fromLng]}>
          <Popup>🏭 Collection Point</Popup>
        </Marker>

        {/* Delivery marker */}
        <Marker position={[toLat, toLng]}>
          <Popup>📦 Delivery Point</Popup>
        </Marker>

        {/* Optional route polyline */}
        {Array.isArray(routeLine) && routeLine.length > 0 && (
          <Polyline
            positions={routeLine.map(([lng, lat]) => [lat, lng])}
            color="blue"
            weight={4}
          />
        )}
      </MapContainer>
    </div>
  );
}
