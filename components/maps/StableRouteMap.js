// components/maps/StableRouteMap.js
import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon (optional)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const StableRouteMap = ({ fromCoords, toCoords, routeLine }) => {
  const isValidCoords = (coords) =>
    Array.isArray(coords) &&
    coords.length === 2 &&
    typeof coords[0] === 'number' &&
    typeof coords[1] === 'number';

  if (!isValidCoords(fromCoords) || !isValidCoords(toCoords)) {
    return <div className="alert alert-danger">❌ Invalid coordinates provided</div>;
  }

  if (!Array.isArray(routeLine) || routeLine.length === 0) {
    return <div className="alert alert-danger">❌ Missing or invalid route line</div>;
  }

  const center = [
    (fromCoords[0] + toCoords[0]) / 2,
    (fromCoords[1] + toCoords[1]) / 2,
  ];

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: '400px', width: '100%', marginTop: '1rem' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={fromCoords}>
        <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
          📦 Collection
        </Tooltip>
      </Marker>

      <Marker position={toCoords}>
        <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
          📍 Delivery
        </Tooltip>
      </Marker>

      <Polyline
        positions={routeLine}
        pathOptions={{ color: 'blue', weight: 4 }}
      />
    </MapContainer>
  );
};

export default StableRouteMap;
