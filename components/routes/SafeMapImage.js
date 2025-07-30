import { useEffect, useState } from 'react';

export default function SafeMapImage({ from, to, apiKey }) {
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => setIsClient(true), []);

  if (!isClient || error || !from || !to) {
    return (
      <div style={{
        height: '100px',
        width: '200px',
        backgroundColor: '#1e1e1e',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#999',
        fontSize: '0.8rem'
      }}>
        Map Unavailable
      </div>
    );
  }

  const fromEncoded = encodeURIComponent(from);
  const toEncoded = encodeURIComponent(to);
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?key=${apiKey}&size=200x100&markers=${fromEncoded}&markers=${toEncoded}&path=color:blue|weight:3|${fromEncoded}|${toEncoded}`;

  return (
    <img
      src={mapUrl}
      alt={`Map from ${from} to ${to}`}
      onError={() => setError(true)}
      style={{
        height: '100px',
        width: '200px',
        objectFit: 'cover',
        borderRadius: '6px'
      }}
    />
  );
}
