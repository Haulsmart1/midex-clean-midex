const ORS_API_KEY = process.env.ORS_API_KEY;

export default async function orsFetch(fromCoords, toCoords) {
  const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

  const body = {
    coordinates: [fromCoords, toCoords],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': ORS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error('ORS API failed');

  const json = await response.json();

  const features = json?.features?.[0];
  const distance = features?.properties?.summary?.distance;
  const geometry = features?.geometry?.coordinates;

  if (!distance || !geometry) throw new Error('ORS response incomplete');

  return {
    distance,
    geometry: features.geometry,
  };
}
