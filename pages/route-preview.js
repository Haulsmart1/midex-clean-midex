import dynamic from 'next/dynamic';
import React from 'react';

// 🧠 Dynamically import your Leaflet map component (SSR disabled)
const StableRouteMap = dynamic(
  () => import('@/components/maps/StableRouteMap'),
  { ssr: false }
);

// ✅ Optional: mock data for testing
const MOCK_POLYLINE = [
  [-6.240071, 54.626948],
  [-6.232436, 54.627677],
  [-6.22314, 54.628543],
];

export default function RoutePreviewPage() {
  return (
    <div style={{ maxWidth: '960px', margin: '40px auto', padding: '30px' }}>
      <h1>📍 Route Preview</h1>
      <StableRouteMap
        fromCoords={[-6.240071, 54.626948]}
        toCoords={[-6.22314, 54.628543]}
        routeLine={MOCK_POLYLINE}
      />
    </div>
  );
}
