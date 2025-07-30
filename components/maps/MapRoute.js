import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const fetchCoordinates = async (postcode) => {
  const geoRes = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(postcode + ', UK')}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}`);
  const data = await geoRes.json();
  return data?.results?.[0]?.geometry
    ? [data.results[0].geometry.lng, data.results[0].geometry.lat]
    : null;
};

const fetchRoute = async (start, end) => {
  const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
    method: 'POST',
    headers: {
      'Authorization': process.env.NEXT_PUBLIC_ORS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coordinates: [start, end],
    }),
  });

  const data = await res.json();
  return data?.features?.[0]?.geometry?.coordinates || [];
};

const RoadRouteMap = ({ from, to }) => {
  const [routeCoords, setRouteCoords] = useState([]);
  const [startCoord, setStartCoord] = useState(null);
  const [endCoord, setEndCoord] = useState(null);

  useEffect(() => {
    const loadRoute = async () => {
      const start = await fetchCoordinates(from);
      const end = await fetchCoordinates(to);
      if (!start || !end) return;

      setStartCoord([start[1], start[0]]);
      setEndCoord([end[1], end[0]]);

      const route = await fetchRoute(start, end);
      const leafletRoute = route.map(([lng, lat]) => [lat, lng]);
      setRouteCoords(leafletRoute);
    };

    if (from && to) {
      loadRoute();
    }
  }, [from, to]);

  if (!startCoord || !endCoord || !routeCoords.length) {
    return <p style={{ color: '#ccc' }}>Loading road route...</p>;
  }

  return (
    <div style={{ height: '300px', marginTop: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer center={startCoord} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={startCoord}>
          <Popup>Collection</Popup>
        </Marker>
        <Marker
          position={endCoord}
          icon={L.icon({
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            iconSize: [30, 30],
          })}
        >
          <Popup>Delivery</Popup>
        </Marker>
        <Polyline positions={routeCoords} color="blue" />
      </MapContainer>
    </div>
  );
};

export default RoadRouteMap;
