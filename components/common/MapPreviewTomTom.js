'use client';
import React, { useEffect, useRef, useState } from 'react';

/**
 * Props:
 *  - fromPostcode, toPostcode   (strings)
 *  - vehicleType: 'car' | 'van' | 'truck'  (affects routing mode)
 *  - weightKg: number            (total consignment weight)
 *  - allowFerries: boolean       (true => include ferries, false => avoid ferries)
 *  - heightPx: number            (optional)
 */
export default function MapPreviewTomTom({
  fromPostcode,
  toPostcode,
  vehicleType = 'truck',
  weightKg = 0,
  allowFerries = true,
  heightPx = 220,
}) {
  const ref = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let map, routeSrcId = 'route-src', roadLayerId = 'route-road', ferryLayerId = 'route-ferry';
    let markers = [];

    const key = process.env.NEXT_PUBLIC_TOMTOM_KEY;
    if (!key) { setError('Missing NEXT_PUBLIC_TOMTOM_KEY'); return; }

    const tt = window.tt;
    if (!tt?.map) { setError('TomTom Maps SDK not loaded'); return; }
    if (!fromPostcode || !toPostcode) return;

    async function geocode(q) {
      const url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(q)}.json?countrySet=GB,IE&key=${key}&limit=1`;
      const r = await fetch(url);
      const j = await r.json();
      const p = j?.results?.[0]?.position;
      if (!p) throw new Error(`No result for ${q}`);
      return [p.lon, p.lat];
    }

    function ttMode() {
      // truck routing to respect ferries/weight; fallback to 'car' for smaller vehicles
      if (vehicleType === 'truck') return 'truck';
      return 'car';
    }

    async function route([lon1, lat1], [lon2, lat2]) {
      const avoid = allowFerries ? '' : '&avoid=ferries';
      // truck params: weight in kg (total weight), keep simple
      const truck = vehicleType === 'truck'
        ? `&travelMode=truck&vehicleWeight=${Math.max(0, Math.round(weightKg))}`
        : `&travelMode=${ttMode()}`;

      const url =
        `https://api.tomtom.com/routing/1/calculateRoute/${lat1},${lon1}:${lat2},${lon2}/json?` +
        `key=${key}&traffic=false${avoid}${truck}&routeRepresentation=polyline&sectionType=traffic&sectionType=ferry`;
      const r = await fetch(url);
      const j = await r.json();
      if (!j?.routes?.[0]) throw new Error('No route found');
      return j.routes[0];
    }

    function polylineToGeoJSON(route) {
      // One GeoJSON Feature with LineString for whole route
      const coords = route?.legs?.flatMap(leg =>
        leg.points?.map(p => [p.longitude, p.latitude]) || []
      ) || [];
      return { type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: {} };
    }

    function splitFerrySegments(route) {
      // sectionType = "FERRY" segments coordinates if available
      const sections = route?.sections || [];
      const all = route?.legs?.flatMap(leg => leg.points?.map(p => [p.longitude, p.latitude]) || []) || [];
      const ferryRanges = sections
        .filter(s => s.type === 'FERRY' || s.sectionType === 'FERRY')
        .map(s => [s.startPointIndex, s.endPointIndex]);

      const ferryCoords = [];
      ferryRanges.forEach(([a, b]) => {
        const seg = all.slice(a, b + 1);
        if (seg.length > 1) ferryCoords.push(seg);
      });
      return ferryCoords; // array of LineString coordinate arrays
    }

    (async () => {
      try {
        // init map
        map = tt.map({
          key,
          container: ref.current,
          style: 'tomtom://vector/1/basic-main',
          dragPan: true,
          zoom: 5,
          center: [-4, 54],
        });

        const from = await geocode(fromPostcode);
        const to   = await geocode(toPostcode);
        const rr   = await route(from, to);

        // markers with postcode labels
        const mkFrom = new tt.Marker({ color: '#00e0ff' }).setLngLat(from).addTo(map);
        const mkTo   = new tt.Marker({ color: '#00e07a' }).setLngLat(to).addTo(map);
        mkFrom.setPopup(new tt.Popup({ closeButton: false}).setText(`COL: ${fromPostcode}`));
        mkTo.setPopup(new tt.Popup({ closeButton: false}).setText(`DEL: ${toPostcode}`));
        markers.push(mkFrom, mkTo);

        // base route (road + ferry together)
        const gj = polylineToGeoJSON(rr);
        if (map.getSource(routeSrcId)) map.removeSource(routeSrcId);
        map.addSource(routeSrcId, { type: 'geojson', data: gj });

        if (map.getLayer(roadLayerId)) map.removeLayer(roadLayerId);
        map.addLayer({
          id: roadLayerId,
          type: 'line',
          source: routeSrcId,
          paint: {
            'line-color': '#66ccff',
            'line-width': 4,
            'line-opacity': 0.9
          }
        });

        // overlay dashed ferry parts
        const ferrySegs = splitFerrySegments(rr);
        ferrySegs.forEach((coords, i) => {
          const srcId = `ferry-src-${i}`, lyrId = `ferry-lyr-${i}`;
          map.addSource(srcId, {
            type: 'geojson',
            data: { type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: {} }
          });
          map.addLayer({
            id: lyrId,
            type: 'line',
            source: srcId,
            paint: {
              'line-color': '#ffc66b',
              'line-width': 4,
              'line-dasharray': [1.5, 1.5],
              'line-opacity': 0.95
            }
          });
        });

        // fit bounds
        const bounds = new tt.LngLatBounds();
        [from, to].forEach(c => bounds.extend(c));
        map.fitBounds(bounds, { padding: 40, maxZoom: 9 });
      } catch (e) {
        console.error(e);
        setError(e.message || 'Map error');
      }
    })();

    return () => {
      markers.forEach(m => m.remove?.());
      if (map) map.remove();
    };
  }, [fromPostcode, toPostcode, vehicleType, weightKg, allowFerries]);

  return (
    <div style={{ border:'1px solid #16253a', borderRadius:12, background:'#0e1523e6', padding:8 }}>
      {error ? (
        <div style={{ color:'#ff9e9e' }}>Map error: {error}</div>
      ) : (
        <div ref={ref} style={{ width:'100%', height: heightPx }} />
      )}
    </div>
  );
}
