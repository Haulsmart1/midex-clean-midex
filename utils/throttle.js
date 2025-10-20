// /utils/throttle.js

const throttleMap = {};
const queueMap = {};

/**
 * Ensures requests per key are spaced by delay.
 * If called too soon, queues until delay passes.
 * @param {string} key
 * @param {Function} fn - async function that actually does the fetch
 * @param {number} delay
 * @returns {Promise<any>}
 */
export function throttledRequest(key, fn, delay = 1000) {
  const now = Date.now();
  const last = throttleMap[key] || 0;
  const wait = Math.max(0, delay - (now - last));

  throttleMap[key] = now + wait;

  // Chain in queue so calls execute sequentially per key
  queueMap[key] = (queueMap[key] || Promise.resolve())
    .then(() => new Promise(res => setTimeout(res, wait)))
    .then(fn);

  return queueMap[key];
}

// Optional: reset throttle per key
export function resetThrottle(key) {
  delete throttleMap[key];
  delete queueMap[key];
}

// Example usage:
export function fetchTomTomGeocode(postcode, apiKey) {
  const key = `/geocode/${postcode}`;
  return throttledRequest(
    key,
    () =>
      fetch(
        `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(postcode)}.json?key=${apiKey}`
      )
        .then(r => r.json())
        .then(data => {
          console.log("Result:", data);
          return data;
        })
  );
}
