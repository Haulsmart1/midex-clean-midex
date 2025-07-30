import { useEffect, useState, Fragment } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

export default function RoutesMap() {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      const { data, error } = await supabase.from('routes').select('*');
      if (!error) setRoutes(data);
    };
    fetchRoutes();
  }, []);

  if (!routes.length) return <p className="text-white text-center">Loading map...</p>;

  return (
    <MapContainer
      center={[54.5, -3.0]}
      zoom={5}
      style={{ height: '600px', width: '100%', borderRadius: '12px' }}
      whenCreated={(map) => {
        map.on('click', async (e) => {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;

          const routeId = prompt('Enter route ID to update coords for:');
          const which = prompt('Type "from" or "to" to update:');

          if (!routeId || !['from', 'to'].includes(which)) return alert('Invalid input');

          const updateFields = (which === 'from')
            ? { from_lat: lat, from_lng: lng }
            : { to_lat: lat, to_lng: lng };

          const { error } = await supabase.from('routes').update(updateFields).eq('id', routeId);
          if (!error) alert(`${which} updated! Refresh to see change.`);
        });
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {routes.map((route, idx) => {
        const from = { lat: route.from_lat, lng: route.from_lng };
        const to = { lat: route.to_lat, lng: route.to_lng };
        return (
          <Polyline key={`poly-${idx}`} positions={[from, to]} color="#007bff">
            <Popup>
              <strong>{route.from} ⇄ {route.to}</strong><br />
              {route.description}<br />
              {route.route_message && <em>📢 {route.route_message}</em>}
            </Popup>
          </Polyline>
        );
      })}

      {routes.map((route, idx) => (
        <Fragment key={`markers-${idx}`}>
          <Marker position={{ lat: route.from_lat, lng: route.from_lng }} icon={markerIcon}>
            <Popup>
              <strong>{route.from}</strong><br />
              ({route.from_lat.toFixed(4)}, {route.from_lng.toFixed(4)})
            </Popup>
          </Marker>
          <Marker position={{ lat: route.to_lat, lng: route.to_lng }} icon={markerIcon}>
            <Popup>
              <strong>{route.to}</strong><br />
              ({route.to_lat.toFixed(4)}, {route.to_lng.toFixed(4)})
            </Popup>
          </Marker>
        </Fragment>
      ))}
    </MapContainer>
  );
}
