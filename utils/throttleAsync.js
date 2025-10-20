// /utils/throttleAsync.js
export function throttleAsync(fn, keyFn = args => args.join('-'), delay = 1000) {
  const lastCall = {};
  let queue = Promise.resolve();

  return async function(...args) {
    const key = keyFn(args);
    const now = Date.now();
    const wait = lastCall[key] ? Math.max(0, delay - (now - lastCall[key])) : 0;

    lastCall[key] = now + wait;

    queue = queue.then(() => new Promise(res => setTimeout(res, wait)))
      .then(() => fn(...args));

    return queue;
  };
}
