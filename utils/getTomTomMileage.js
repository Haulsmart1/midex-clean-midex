// /utils/getTomTomMileage.js

import axios from "axios";
import { toLatLonArray } from "./toLatLonArray";

// Named export
export async function getTomTomMileage(origin, destination, apiKey) {
  if (!apiKey) throw new Error("TomTom API key required for mileage");

  // Convert to [lat, lon] arrays if objects or postcodes
  const originArr = toLatLonArray(origin);
  const destArr = toLatLonArray(destination);

  const url = `https://api.tomtom.com/routing/1/calculateRoute/${originArr[0]},${originArr[1]}:${destArr[0]},${destArr[1]}/json`;
  const params = { key: apiKey, travelMode: "car" };

  try {
    const res = await axios.get(url, { params });
    const summary = res.data.routes?.[0]?.summary;
    if (!summary) throw new Error("No route found for given coordinates");

    return {
      distance: summary.lengthInMeters,           // Meters
      duration: summary.travelTimeInSeconds,      // Seconds
      raw: res.data
    };
  } catch (err) {
    const message = err?.response?.data?.error?.description || err?.response?.data || err.message || "Unknown TomTom mileage API error";
    console.error('TomTom mileage API failed:', message);
    throw new Error(message);
  }
}
