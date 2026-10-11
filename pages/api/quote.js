// /pages/api/quote.js or /app/api/quote/route.js (Next 13+ with app router)
import calculateQuote from '@/utils/pricingEngine';
import { resolveRoute } from '@/utils/resolveRoute';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { supabaseForSession } from '@/lib/server/supabaseForSession';
import { sessionIsCurrent } from '@/lib/server/sessionPolicy.cjs';

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
    } = req.body || {};

    if (!from || !to || !Array.isArray(pallets) || pallets.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    let supabase;
    let ownerId;
    if (bookingId) {
      const session = await getServerSession(req, res, authOptions);
      if (!sessionIsCurrent(session)) return res.status(401).json({ error: 'Sign in again to update a booking' });
      ownerId = session.user.id;
      supabase = supabaseForSession(session);
      const { data, error } = await supabase.from('bookings').select('id').eq('id', bookingId).eq('user_id', ownerId).maybeSingle();
      if (error) return res.status(500).json({ error: 'Unable to verify booking' });
      if (!data) return res.status(404).json({ error: 'Booking not found' });
    }

    // STEP 1: Resolve route
    const routeData = await resolveRoute({ from, to });

    if (!routeData || !routeData.legs) {
      return res.status(500).json({ error: 'Failed to resolve route' });
    }

    const { totalMiles = 0, legs = [], ferryRoute = null, routePolyline } = routeData;

    // STEP 2: Calculate the quote
    const quote = await calculateQuote({
      from,
      to,
      pallets,
      adr,
      adrClassSpecial,
      forkliftPickup,
      forkliftDelivery,
      legs,
      totalMiles,
      collectionMiles: routeData.collectionMiles,
      deliveryMiles: routeData.deliveryMiles,
      middleMiles: routeData.middleMiles,
      ferryMiles: routeData.ferryMiles,
      customsRequired: routeData.customsRequired,
      vatRequired: routeData.vatApplied,
      ferryRoute,
    });

    // STEP 3: Determine route type
    const isCrossBorder = Boolean(ferryRoute && ferryRoute !== 'UK');
    const routeType = isCrossBorder ? 'cross_border' : 'internal';

    // STEP 4: Update booking if ID is provided
    if (bookingId) {
      const { data: updated, error: updateError } = await supabase
        .from('bookings')
        .update({
          legs,
          ferry_route: ferryRoute,
          route_type: routeType,
        })
        .eq('id', bookingId)
        .eq('user_id', ownerId)
        .select('id')
        .maybeSingle();

      if (updateError) {
        console.error('❌ Failed to update booking with route info:', updateError);
        return res.status(500).json({ error: 'Unable to update booking route' });
      }
      if (!updated) return res.status(404).json({ error: 'Booking no longer available' });
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
