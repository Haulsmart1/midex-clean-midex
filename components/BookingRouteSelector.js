import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import dynamic from 'next/dynamic';
const RouteMapMini = dynamic(() => import('./maps/RouteMapMini'), { ssr: false });

const VEHICLE_RATES = {
  '18 Tonner Tail-lift': 3.5,
  '7.5 Ton Taillift': 2.9,
  'Luton Tailift': 2.7,
  XLWB: 2.2,
  'Small Van': 1.8,
};

export const ROUTES = [
  {
    id: 'cairnryan-belfast',
    label: 'Cairnryan → Belfast',
    fromDepot: 'DG9 8RG',
    toDepot: 'BT29 4GD',
    baseRate: 500,
    customs: true,
  },
  {
    id: 'belfast-cairnryan',
    label: 'Belfast → Cairnryan',
    fromDepot: 'BT29 4GD',
    toDepot: 'DG9 8RG',
    baseRate: 500,
    customs: false,
  },
  {
    id: 'liverpool-dublin',
    label: 'Liverpool → Dublin',
    fromDepot: 'L5 9ZS',
    toDepot: 'D01 R2P3',
    baseRate: 600,
    customs: true,
  },
  {
    id: 'dublin-liverpool',
    label: 'Dublin → Liverpool',
    fromDepot: 'D01 R2P3',
    toDepot: 'L5 9ZS',
    baseRate: 600,
    customs: false,
  }
];

const BookingRouteSelector = ({ form, setForm, quote, setQuote, mapCoords, setMapCoords }) => {
  const [loading, setLoading] = useState(false);

  const getLatLng = async (postcode) => {
    const res = await fetch(`/api/geocode?postcode=${encodeURIComponent(postcode)}`);
    const data = await res.json();
    if (!data?.lat || !data?.lng) throw new Error('Invalid postcode');
    return [data.lat, data.lng];
  };

  const getDistanceMiles = ([lat1, lon1], [lat2, lon2]) => {
    const toRad = deg => deg * Math.PI / 180;
    const R = 3958.8;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const calculateQuote = async () => {
    const { pickupPostcode, deliveryPostcode, pallets, vehicle, adr, routeId } = form;
    const route = ROUTES.find(r => r.id === routeId);
    if (!route || !pickupPostcode || !deliveryPostcode || !vehicle) {
      alert('Complete all fields');
      return;
    }

    setLoading(true);
    try {
      const [pickupCoord, deliveryCoord] = await Promise.all([
        getLatLng(pickupPostcode),
        getLatLng(deliveryPostcode),
      ]);
      const fromDepotCoord = await getLatLng(route.fromDepot);
      const toDepotCoord = await getLatLng(route.toDepot);

      const pickupMiles = getDistanceMiles(pickupCoord, fromDepotCoord);
      const deliveryMiles = getDistanceMiles(toDepotCoord, deliveryCoord);

      const pickupCharge = pickupMiles * VEHICLE_RATES[vehicle];
      const deliveryCharge = deliveryMiles <= 50
        ? 150
        : 150 + (deliveryMiles - 50) * VEHICLE_RATES[vehicle];
      const palletCharge = pallets > 1 ? (pallets - 1) * 100 : 0;
      const customsCharge = route.customs ? 160 : 0;

      let total = route.baseRate + customsCharge + pickupCharge + deliveryCharge + palletCharge;
      const adrCharge = adr ? total * 0.3 : 0;
      total += adrCharge;

      setQuote({
        route: route.label,
        pickupMiles: pickupMiles.toFixed(1),
        deliveryMiles: deliveryMiles.toFixed(1),
        pickupCharge: pickupCharge.toFixed(2),
        deliveryCharge: deliveryCharge.toFixed(2),
        palletCharge,
        customsCharge,
        adrCharge: adrCharge.toFixed(2),
        total: total.toFixed(2),
        from: pickupCoord,
        to: deliveryCoord,
      });

      setMapCoords({ from: pickupCoord, to: deliveryCoord });
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <select
        value={form.routeId}
        onChange={e => setForm({ ...form, routeId: e.target.value })}
        className="w-full p-2 bg-zinc-700 rounded"
      >
        <option value="">Select a route</option>
        {ROUTES.map(r => (
          <option key={r.id} value={r.id}>{r.label}</option>
        ))}
      </select>

      <input
        placeholder="Pickup postcode"
        value={form.pickupPostcode}
        onChange={e => setForm({ ...form, pickupPostcode: e.target.value })}
        className="w-full p-2 bg-zinc-700 rounded"
      />

      <input
        placeholder="Delivery postcode"
        value={form.deliveryPostcode}
        onChange={e => setForm({ ...form, deliveryPostcode: e.target.value })}
        className="w-full p-2 bg-zinc-700 rounded"
      />

      <select
        value={form.vehicle}
        onChange={e => setForm({ ...form, vehicle: e.target.value })}
        className="w-full p-2 bg-zinc-700 rounded"
      >
        <option value="">Select vehicle type</option>
        {Object.keys(VEHICLE_RATES).map(v => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>

      <select
        value={form.pallets}
        onChange={e => setForm({ ...form, pallets: parseInt(e.target.value) })}
        className="w-full p-2 bg-zinc-700 rounded"
      >
        {[1, 2, 3, 4].map(p => (
          <option key={p} value={p}>{p} pallet{p > 1 ? 's' : ''}</option>
        ))}
      </select>

      <div className="flex items-center justify-between">
        <span>ADR Consignment</span>
        <button
          onClick={() => setForm({ ...form, adr: !form.adr })}
          className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${form.adr ? 'bg-green-500' : 'bg-zinc-600'}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${form.adr ? 'translate-x-6' : ''}`} />
        </button>
      </div>

      <button
        onClick={calculateQuote}
        disabled={loading}
        className="w-full bg-blue-600 py-2 rounded text-white font-semibold"
      >
        {loading ? 'Calculating...' : 'Calculate Quote'}
      </button>

      {quote?.total && (
        <div className="text-sm bg-zinc-900 p-4 mt-4 rounded">
          <p>Route: {quote.route}</p>
          <p>Pickup: {quote.pickupMiles} mi (£{quote.pickupCharge})</p>
          <p>Delivery: {quote.deliveryMiles} mi (£{quote.deliveryCharge})</p>
          <p>Pallet surcharge: £{quote.palletCharge}</p>
          <p>Customs: £{quote.customsCharge}</p>
          {form.adr && <p>ADR: £{quote.adrCharge}</p>}
          <hr className="my-2 border-zinc-600" />
          <p className="text-lg font-bold">Total: £{quote.total}</p>
        </div>
      )}

      {mapCoords?.from && mapCoords?.to && (
        <div className="mt-4">
          <RouteMapMini
            fromLat={mapCoords.from[0]}
            fromLng={mapCoords.from[1]}
            toLat={mapCoords.to[0]}
            toLng={mapCoords.to[1]}
          />
        </div>
      )}
    </div>
  );
};

export default BookingRouteSelector;
