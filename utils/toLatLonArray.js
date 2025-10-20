// /utils/toLatLonArray.js

/**
 * Converts various coordinate formats to [lat, lon] array.
 * Supports:
 *   - [lat, lon] arrays (numbers)
 *   - { lat, lon } objects
 *   - { latitude, longitude } objects
 *   - { lat: string, lon: string } (auto-casts)
 * Throws if input is invalid.
 * @param {*} coord
 * @returns {[number, number]} [lat, lon]
 */
export function toLatLonArray(coord) {
  // Array: [lat, lon]
  if (
    Array.isArray(coord) &&
    coord.length === 2 &&
    typeof coord[0] === "number" &&
    typeof coord[1] === "number"
  ) {
    return [coord[0], coord[1]]; // ✅ keep [lat, lon]
  }

  // Object: { lat, lon }
  if (coord && typeof coord === "object") {
    if ("lat" in coord && "lon" in coord) {
      const lat = Number(coord.lat);
      const lon = Number(coord.lon);
      if (!isNaN(lat) && !isNaN(lon)) return [lat, lon];
    }
    if ("latitude" in coord && "longitude" in coord) {
      const lat = Number(coord.latitude);
      const lon = Number(coord.longitude);
      if (!isNaN(lat) && !isNaN(lon)) return [lat, lon];
    }
  }

  throw new TypeError("Invalid coordinate format: " + JSON.stringify(coord));
}
