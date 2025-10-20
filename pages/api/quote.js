// /pages/api/quote.js or /app/api/quote/route.js (Next 13+ with app router)
import calculateQuote from '@/utils/pricingEngine';
import { resolveRoute } from '@/utils/resolveRoute';
import supabase from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      bookingId = null,
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

    // STEP 1: Resolve route
    const routeData = await resolveRoute({ from, to });

    if (!routeData || !routeData.legs) {
      return res.status(500).json({ error: 'Failed to resolve route' });
    }

    const { totalMiles = 0, legs = [], ferryRoute = 'UK', routePolyline } = routeData;
    const milesToDepotA = legs?.[0]?.distanceMiles || 0;
    const milesFromDepotB = legs?.[2]?.distanceMiles || 0;

    // STEP 2: Calculate the quote
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

    // STEP 3: Determine route type
    const isCrossBorder = ferryRoute !== 'UK';
    const routeType = isCrossBorder ? 'cross_border' : 'internal';

    // STEP 4: Update booking if ID is provided
    if (bookingId) {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          legs,
          ferry_route: ferryRoute,
          route_type: routeType,
        })
        .eq('id', bookingId);

      if (updateError) {
        console.error('❌ Failed to update booking with route info:', updateError);
      }
    }

    // STEP 5: Respond
    return res.status(200).json({
      ...quote,
      routeInfo: {
        legs,
        polyline: routePolyline,
        totalMiles,
        ferryRoute,
        routeType,
      },
    });
  } catch (err) {
    console.error('❌ /api/quote error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
