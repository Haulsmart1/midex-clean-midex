// utils/geo.js

/**
 * Converts a TomTom geocode object to a [lat, lon] array
 * Ensures compatibility with Leaflet, Mapbox, and GeoJSON formats.
 *
 * @param {Object} coordObj - Object with .lat and .lon properties
 * @returns {[number, number]} - Array in [lat, lon] format
 */
export function toLatLonArray(coordObj) {
  if (!coordObj || typeof coordObj.lat !== 'number' || typeof coordObj.lon !== 'number') {
    throw new Error('Invalid coordinate object passed to toLatLonArray');
  }

  return [coordObj.lat, coordObj.lon];
}
