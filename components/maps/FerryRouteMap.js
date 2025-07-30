// components/map/FerryRouteMap.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const ferryRoutes = {
  'liverpool-dublin': {
    title: 'Liverpool to Dublin',
    coords: [
      [53.4084, -2.9916], // Liverpool
      [53.3498, -6.2603], // Dublin
    ],
    customs: 'Full import declaration required for hazardous freight.',
    freight: {
      pallets: 12,
      totalWeight: '3.2t',
      adr: true,
    },
  },
  'cairnryan-larne': {
    title: 'Cairnryan to Larne',
    coords: [
      [54.9733, -5.0306], // Cairnryan
      [54.8579, -5.8099], // Larne
    ],
    customs: 'NI protocol applies — simplified declaration.',
    freight: {
      pallets: 8,
      totalWeight: '2.1t',
      adr: false,
    },
  },
};

export default function FerryRouteMap({ routeKey = 'liverpool-dublin' }) {
  const route = ferryRoutes[routeKey];
  const [map, setMap] = useState(null);

  if (!route) return <div>❌ Unknown route: {routeKey}</div>;

  const center = route.coords[0];

  return (
    <div className="my-3 border rounded" style={{ height: '400px' }}>
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMap}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        {route.coords.map((coord, i) => (
          <Marker position={coord} key={i}>
            <Popup>
              <strong>{i === 0 ? 'Departure' : 'Arrival'}</strong><br />
              Lat: {coord[0].toFixed(4)}<br />
              Lng: {coord[1].toFixed(4)}
            </Popup>
          </Marker>
        ))}

        <Polyline positions={route.coords} color="blue" weight={4} />

        {/* Dummy Info Overlay */}
        <div className="leaflet-bottom leaflet-left p-2 bg-dark text-light border">
          <strong>{route.title}</strong><br />
          🚛 Pallets: {route.freight.pallets}<br />
          ⚖️ Weight: {route.freight.totalWeight}<br />
          🧪 ADR: {route.freight.adr ? 'Yes' : 'No'}<br />
          🛃 Customs: {route.customs}
        </div>
      </MapContainer>
    </div>
  );
}
