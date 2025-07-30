// /pages/dashboard/forwarder/fast-booking.js and /pages/dashboard/users/fast-booking.js

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function FastBookingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('Small Van');
  const [freightWeight, setFreightWeight] = useState('');
  const [numberOfPallets, setNumberOfPallets] = useState('');
  const [fridgeRequired, setFridgeRequired] = useState(false);
  const [adrRequired, setAdrRequired] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(null);

  const VEHICLE_RATES = {
    'Small Van': 1.8,
    'XLWB': 2.2,
    '7.5 Ton Taillift': 2.9,
    '18 Tonner Tail-lift': 3.5,
    'Luton Tailift': 2.7,
  };

  const calculateDistanceAndPrice = async () => {
    if (!pickup || !delivery) return;

    const res = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: pickup,
        destinations: delivery,
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    });

    const distanceMeters = res.data.rows[0].elements[0].distance.value;
    const distanceMiles = distanceMeters / 1609.34;

    let basePrice = distanceMiles * VEHICLE_RATES[selectedVehicle];

    if (fridgeRequired) basePrice *= 1.1;
    if (adrRequired) basePrice *= 1.15;

    basePrice = Math.round(basePrice);

    setEstimatedPrice(basePrice);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post('/api/fast-booking-create', {
      pickup,
      delivery,
      selectedVehicle,
      freightWeight,
      numberOfPallets,
      fridgeRequired,
      adrRequired,
      contactName,
      contactEmail,
      contactPhone,
      pickupDate,
      estimatedPrice,
    });

    router.push('/dashboard');
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Fast Van/Truck Booking</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input type="text" placeholder="Pickup Address" value={pickup} onChange={(e) => setPickup(e.target.value)} className="border p-2" required />
        <input type="text" placeholder="Delivery Address" value={delivery} onChange={(e) => setDelivery(e.target.value)} className="border p-2" required />
        
        <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className="border p-2">
          {Object.keys(VEHICLE_RATES).map(vehicle => (
            <option key={vehicle} value={vehicle}>{vehicle}</option>
          ))}
        </select>

        <input type="number" placeholder="Freight Weight (kg)" value={freightWeight} onChange={(e) => setFreightWeight(e.target.value)} className="border p-2" required />
        <input type="number" placeholder="Number of Pallets" value={numberOfPallets} onChange={(e) => setNumberOfPallets(e.target.value)} className="border p-2" required />

        <div className="flex gap-4">
          <label><input type="checkbox" checked={fridgeRequired} onChange={(e) => setFridgeRequired(e.target.checked)} /> Fridge Required</label>
          <label><input type="checkbox" checked={adrRequired} onChange={(e) => setAdrRequired(e.target.checked)} /> ADR Required</label>
        </div>

        <input type="text" placeholder="Contact Name" value={contactName} onChange={(e) => setContactName(e.target.value)} className="border p-2" required />
        <input type="email" placeholder="Contact Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="border p-2" required />
        <input type="text" placeholder="Contact Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="border p-2" required />
        <input type="datetime-local" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="border p-2" required />

        <button type="button" onClick={calculateDistanceAndPrice} className="bg-blue-500 text-white p-2 rounded">
          Calculate Price
        </button>

        {estimatedPrice && (
          <div className="text-lg font-bold">Estimated Price: £{estimatedPrice}</div>
        )}

        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Submit Booking
        </button>
      </form>
    </div>
  );
}
