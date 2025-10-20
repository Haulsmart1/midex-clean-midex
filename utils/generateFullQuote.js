import { getMileageBetweenPostcodes } from '@/utils/getMileageBetweenPostcodes';
import { calculateQuote } from '@/utils/rateConfig';

/**
 * Full Quote Generator using TomTom API + quote engine
 * 
 * @param {Object} input
 * @param {string} input.from - Collection postcode
 * @param {string} input.to - Delivery postcode
 * @param {Array} input.pallets - Pallet array
 * @param {boolean} input.forkliftPickup
 * @param {boolean} input.forkliftDelivery
 * @param {string} input.ferryRoute - e.g. "Holyhead-Dublin"
 * @param {string} input.depotA - (Optional) Collection depot postcode
 * @param {string} input.depotB - (Optional) Delivery depot postcode
 * @returns {Promise<Object>} Full quote breakdown
 */
export async function generateFullQuote({
  from,
  to,
  pallets = [],
  forkliftPickup = false,
  forkliftDelivery = false,
  ferryRoute = 'UK',
  depotA = 'WA3 6PH',
  depotB = 'V94',
}) {
  const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;
  if (!apiKey) throw new Error('❌ Missing TomTom API key in .env');

  // === Get mileage from TomTom (in miles)
  const [milesToDepotA, milesFromDepotB] = await Promise.all([
    getMileageBetweenPostcodes(from, depotA, apiKey),
    getMileageBetweenPostcodes(depotB, to, apiKey),
  ]);

  // === Determine ADR settings
  const adr = pallets.some((p) => p.adr || p.adrClassSpecial);
  const adrClassSpecial = pallets.some((p) => p.adrClassSpecial);

  // === Call your pricing engine
  const quote = await calculateQuote({
    from,
    to,
    pallets,
    forkliftPickup,
    forkliftDelivery,
    adr,
    adrClassSpecial,
    milesToDepotA: milesToDepotA.miles,
    milesFromDepotB: milesFromDepotB.miles,
    ferryRoute,
  });

  // Optional: add road mileage for UI display
  return {
    ...quote,
    roadMiles: milesToDepotA.miles + milesFromDepotB.miles,
    milesToDepotA: milesToDepotA.miles,
    milesFromDepotB: milesFromDepotB.miles,
  };
}

export default generateFullQuote;
