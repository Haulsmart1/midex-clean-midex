// /components/RoutePolylines.js
'use client';

import React from 'react';

/**
 * RoutePolylines Component
 *
 * Props:
 * - legs: Array of route legs, each with:
 *    - points: Array of coordinates [[lon, lat], ...]
 *    - isFerry?: boolean
 *    - error?: string
 * - PolylineComponent: Polyline renderer (e.g., from Leaflet or custom)
 * - flip (boolean): If true, flips [lon, lat] to [lat, lon] for components like Leaflet
 */
export default function RoutePolylines({ legs = [], PolylineComponent, flip = true }) {
  if (!Array.isArray(legs) || legs.length === 0) return null;

  return (
    <>
      {legs.map((leg, idx) => {
        if (!Array.isArray(leg.points) || leg.points.length < 2) return null;

        const isFerry = !!leg.isFerry;
        const isError = !!leg.error;

        // Convert coordinates for leaflet-style [lat, lon]
        const positions = flip
          ? leg.points.map(([lon, lat]) => [lat, lon])
          : leg.points;

        return (
          <PolylineComponent
            key={`leg-${idx}`}
            positions={positions}
            pathOptions={{
              color: isFerry ? 'grey' : isError ? 'red' : 'blue',
              dashArray: isFerry || isError ? '6,6' : null,
              weight: 6,
              opacity: 1,
            }}
          />
        );
      })}
    </>
  );
}
