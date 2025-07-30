// components/map/SolidRouteMap.js
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icon issues in Leaflet (common in Next.js/React)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

export default function SolidRouteMap({ coords = [] }) {
  const mapRef = useRef();

  useEffect(() => {
    if (mapRef.current && coords.length >= 2) {
      const bounds = L.latLngBounds(coords);
      mapRef.current.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [coords]);

  if (!coords.length) {
    return <p className="text-warning">⚠️ No coordinates to show route.</p>;
  }

  return (
    <div style={{ height: '400px' }} className="my-3 border rounded overflow-hidden">
      <MapContainer
        center={coords[0]}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {coords.map((point, index) => (
          <Marker key={index} position={point}>
            <Popup>
              {index === 0 ? '📦 Collection Point' : index === coords.length - 1 ? '📍 Delivery Point' : '🔁 Waypoint'}
              <br />
              Lat: {point[0].toFixed(4)}<br />
              Lng: {point[1].toFixed(4)}
            </Popup>
          </Marker>
        ))}

        <Polyline positions={coords} color="blue" weight={4} />
      </MapContainer>
    </div>
  );
}
