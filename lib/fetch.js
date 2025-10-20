// FULL FILE — fixed PostgREST filters + real UPSERT
const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`;
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function headers(json = false) {
  const h = {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    Accept: 'application/json',
  };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

/**
 * Select a single row by primary key id.
 * Returns the row or null if none. Never throws 406.
 */
export async function restSelectById(table, id, select = '*') {
  const url = new URL(`${BASE}/${table}`);
  url.searchParams.set('select', select);
  // ✅ correct PostgREST filter syntax
  url.searchParams.set('id', `eq.${id}`);

  const res = await fetch(url.toString(), { headers: headers() });
  if (res.status === 406) return null;
  if (!res.ok) throw new Error(`REST select error ${res.status}: ${await res.text()}`);

  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] ?? null : rows;
}

/**
 * Idempotent upsert using PostgREST.
 * Uses Prefer: resolution=merge-duplicates so POST becomes UPSERT.
 * Returns the resulting row.
 */
export async function restUpsert(table, row, onConflict = 'id', select = '*') {
  const url = new URL(`${BASE}/${table}`);
  url.searchParams.set('on_conflict', onConflict);
  url.searchParams.set('select', select);

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      ...headers(true),
      // 👇 THIS is what your old code was missing
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) throw new Error(`REST upsert error ${res.status}: ${await res.text()}`);
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] ?? null : rows;
}
