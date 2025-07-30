import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const ORSLeafletMap = ({ from, to, routeLine }) => {
  if (!from || !to || !routeLine?.length) return null;

  const center = {
    lat: (from[0] + to[0]) / 2,
    lng: (from[1] + to[1]) / 2,
  };

  return (
    <MapContainer
      center={center}
      zoom={6}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={from}><Popup>📍 Start</Popup></Marker>
      <Marker position={to}><Popup>🏁 End</Popup></Marker>
      <Polyline
        positions={routeLine.map(([lat, lng]) => [lat, lng])}
        color="blue"
        weight={4}
      />
    </MapContainer>
  );
};

export default ORSLeafletMap;
