// components/maps/ORSRouteMap.client.js

import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 👇 Set custom marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
  iconUrl: '/leaflet/images/marker-icon.png',
  shadowUrl: '/leaflet/images/marker-shadow.png',
});

export default function ORSRouteMap({ coords, routeLine }) {
  if (!coords?.from || !coords?.to) return null;

  const center = [
    (coords.from[1] + coords.to[1]) / 2,
    (coords.from[0] + coords.to[0]) / 2,
  ];

  return (
    <MapContainer center={center} zoom={6} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={[coords.from[1], coords.from[0]]}>
        <Popup>Collection Point</Popup>
      </Marker>
      <Marker position={[coords.to[1], coords.to[0]]}>
        <Popup>Delivery Point</Popup>
      </Marker>
      {routeLine && (
        <Polyline
          positions={routeLine.coordinates.map(([lng, lat]) => [lat, lng])}
          color="#0cf"
        />
      )}
    </MapContainer>
  );
}
