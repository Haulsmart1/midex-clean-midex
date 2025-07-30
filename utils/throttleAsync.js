// /utils/throttleAsync.js

/**
 * Returns a throttled version of any async function.
 * If called again with the same args (determined by keyFn) within `delay` ms, throws 'Throttled'.
 * @param {Function} fn - The async function to throttle.
 * @param {Function} [keyFn] - Function to make a unique string from args. Default: args.join('-')
 * @param {number} [delay] - Delay in ms. Default: 1000.
 * @returns {Function} Throttled async function.
 */
export function throttleAsync(fn, keyFn = args => args.join('-'), delay = 1000) {
  const map = {};
  return async function(...args) {
    const key = keyFn(args);
    const now = Date.now();
    if (!map[key] || now - map[key] > delay) {
      map[key] = now;
      return fn(...args);
    } else {
      throw new Error('Throttled');
    }
  };
}

// Example usage
// You must provide an async function (returns a Promise)
async function fetchTomTomGeocode(postcode, apiKey) {
  const url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(postcode)}.json?key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocode failed: ${res.status}`);
  return await res.json();
}

// Wrap with throttleAsync: key is postcode, 1200ms delay
export const throttledGeocode = throttleAsync(
  fetchTomTomGeocode,
  ([postcode]) => `/geocode/${postcode}`,
  1200
);

// Example call:
// throttledGeocode('BT1 1AA', 'YOUR_API_KEY')
//   .then(data => console.log(data))
//   .catch(err => {
//     if (err.message === 'Throttled') {
//       alert('Please wait before trying again.');
//     } else {
//       alert('Geocode failed: ' + err.message);
//     }
//   });
