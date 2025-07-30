const ORS_API_KEY = process.env.ORS_API_KEY;
const ORS_ENDPOINT = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchWithRetry(url, options, retries = MAX_RETRIES, attempt = 1) {
  try {
    const res = await fetch(url, options);
    if (res.ok || res.status < 500) return res;
    if (retries > 0) {
      await delay(BASE_DELAY_MS * attempt);
      return fetchWithRetry(url, options, retries - 1, attempt + 1);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      await delay(BASE_DELAY_MS * attempt);
      return fetchWithRetry(url, options, retries - 1, attempt + 1);
    }
    throw err;
  }
}

export async function getORSRouteSegments(segments) {
  const output = [];

  for (const [fromCoord, toCoord] of segments) {
    try {
      if (!Array.isArray(fromCoord) || !Array.isArray(toCoord)) {
        output.push({ from: fromCoord, to: toCoord, polyline: [], error: '❌ Malformed coords' });
        continue;
      }

      const res = await fetchWithRetry(ORS_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: ORS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coordinates: [fromCoord, toCoord] }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        output.push({ from: fromCoord, to: toCoord, polyline: [], error: `ORS error ${res.status}: ${errorText}` });
        continue;
      }

      const data = await res.json();
      const coords = data?.features?.[0]?.geometry?.coordinates || [];
      output.push({ from: fromCoord, to: toCoord, polyline: coords });
    } catch (err) {
      output.push({ from: fromCoord, to: toCoord, polyline: [], error: `💥 ${err.message}` });
    }
  }

  return output;
}
