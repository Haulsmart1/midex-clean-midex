import { calculateQuote } from '@/utils/rateConfig';
import { resolveRoute } from '@/utils/resolveRoute';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      from = '',
      to = '',
      pallets = [],
      adr = false,
      adrClassSpecial = false,
      forkliftPickup = false,
      forkliftDelivery = false,
    } = req.body;

    if (!from || !to || !Array.isArray(pallets) || pallets.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Get the route (legs, totalMiles, ferryRoute, etc)
    const routeData = await resolveRoute({ from, to });

    // 2. Extract correct mileages
    const { totalMiles, legs, ferryRoute = 'UK' } = routeData || {};
    // Default to 0 if missing
    const milesToDepotA = legs?.[0]?.distanceMiles || 0;
    const milesFromDepotB = legs?.length > 2 ? legs?.[2]?.distanceMiles || 0 : 0;

    // 3. Calculate the quote with all correct params
    const quote = await calculateQuote({
      from,
      to,
      pallets,
      adr,
      adrClassSpecial,
      forkliftPickup,
      forkliftDelivery,
      distanceMiles: totalMiles,
      milesToDepotA,
      milesFromDepotB,
      ferryRoute,
    });

    // 4. Add route legs and polyline info to the response for front-end display
    return res.status(200).json({
      ...quote,
      routeInfo: {
        legs,
        polyline: routeData.routePolyline,
        totalMiles,
        ferryRoute,
      },
    });
  } catch (err) {
    console.error('❌ /api/quote error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
