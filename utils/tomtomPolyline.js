// /components/RoutePolylines.js

import React from 'react';

/**
 * Props:
 * - legs: [{ points: [[lat, lon], ...], isFerry: true|false, ... }]
 * - PolylineComponent: your map polyline component (e.g. from react-leaflet)
 */
export default function RoutePolylines({ legs, PolylineComponent }) {
  return (
    <>
      {legs.map((leg, idx) => {
        const isFerry = !!leg.isFerry;
        const points = Array.isArray(leg.points) && leg.points.length >= 2
          ? leg.points
          : (
            (Array.isArray(leg.fromCoords) && Array.isArray(leg.toCoords))
              ? [leg.fromCoords, leg.toCoords]
              : []
            );
        if (!points.length) return null;

        return (
          <PolylineComponent
            key={idx}
            positions={points}
            color={isFerry ? 'grey' : 'blue'}
            dashArray={isFerry ? '8,8' : null}
            weight={6}
            opacity={1}
          />
        );
      })}
    </>
  );
}
