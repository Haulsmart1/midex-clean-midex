// /utils/throttle.js

// Stores last request time per key
const throttleMap = {};

/**
 * Checks if a request with the given key can be made.
 * @param {string} key - Unique key for the API action (e.g. "/geocode/POSTCODE").
 * @param {number} delay - Delay in ms between allowed requests (default: 1000).
 * @returns {boolean} True if allowed, false if too soon.
 */
export function canRequest(key, delay = 1000) {
  const now = Date.now();
  if (!throttleMap[key] || now - throttleMap[key] > delay) {
    throttleMap[key] = now;
    return true;
  }
  return false;
}

/**
 * Optional: Reset throttle for a given key (for tests or retries)
 * @param {string} key
 */
export function resetThrottle(key) {
  delete throttleMap[key];
}

// Example usage with TomTom fetch:
export function fetchTomTomGeocode(postcode, apiKey) {
  const key = `/geocode/${postcode}`;
  if (!canRequest(key, 1200)) {
    alert("You're making requests too fast! Try again shortly.");
    return;
  }
  fetch(`https://api.tomtom.com/search/2/geocode/${encodeURIComponent(postcode)}.json?key=${apiKey}`)
    .then(response => response.json())
    .then(data => console.log('Result:', data))
    .catch(err => console.error('TomTom error:', err));
}
