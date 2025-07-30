// pages/api/distance.js

function haversine(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = deg(lat2 - lat1);
  const dLon = deg(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(deg(lat1)) * Math.cos(deg(lat2)) * Math.sin(dLon / 2) ** 2;
  return +(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
}

const deg = (val) => val * Math.PI / 180;

export default async function handler(req, res) {
  const { from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ error: 'Missing postcodes' });
  }

  const format = (pc) => pc.toUpperCase().replace(/\s+/g, '').replace(/(.{3})$/, ' $1');
  const fromPC = format(from);
  const toPC = format(to);

  console.log('📮 /api/distance', { fromRaw: from, toRaw: to, fromPC, toPC });

  try {
    const fRes = await fetch(`https://api.postcodes.io/postcodes/${fromPC}`);
    const tRes = await fetch(`https://api.postcodes.io/postcodes/${toPC}`);

    if (!fRes.ok) throw new Error(`Postcodes.io failed for FROM: ${fromPC}`);
    if (!tRes.ok) throw new Error(`Postcodes.io failed for TO: ${toPC}`);

    const f = await fRes.json();
    const t = await tRes.json();

    console.log('📡 postcodes.io FROM:', f);
    console.log('📡 postcodes.io TO:', t);

    if (!f.result || !t.result) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const dist = haversine(
      f.result.latitude,
      f.result.longitude,
      t.result.latitude,
      t.result.longitude
    );

    return res.status(200).json({ distanceMiles: dist });
  } catch (err) {
    console.error('🔥 /api/distance crash:', err.message);
    return res.status(500).json({ error: 'Server failure: ' + err.message });
  }
}
