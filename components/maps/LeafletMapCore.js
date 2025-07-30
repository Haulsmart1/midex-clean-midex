import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const LeafletMapCore = ({ from, to, routeLine }) => {
  const center = [(from.lat + to.lat) / 2, (from.lng + to.lng) / 2];

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer center={center} zoom={6} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={[from.lat, from.lng]}>
          <Popup>From</Popup>
        </Marker>
        <Marker position={[to.lat, to.lng]}>
          <Popup>To</Popup>
        </Marker>
        {routeLine && (
          <Polyline
            positions={routeLine.map(([lng, lat]) => [lat, lng])}
            color="blue"
            weight={4}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default LeafletMapCore;
