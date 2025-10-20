import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const StableRouteMap = ({ fromCoords, toCoords, routeLine }) => {
  const center = useMemo(() => {
    if (!fromCoords || !toCoords) return [53.35, -6.26];
    return [(fromCoords[0] + toCoords[0]) / 2, (fromCoords[1] + toCoords[1]) / 2];
  }, [fromCoords, toCoords]);

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: '400px', width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {fromCoords && (
        <Marker position={fromCoords}>
          <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
            📦 Collection
          </Tooltip>
        </Marker>
      )}

      {toCoords && (
        <Marker position={toCoords}>
          <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
            📍 Delivery
          </Tooltip>
        </Marker>
      )}

      {routeLine?.length > 0 && (
        <Polyline positions={routeLine} pathOptions={{ color: 'blue', weight: 4 }} />
      )}
    </MapContainer>
  );
};

export default StableRouteMap;
