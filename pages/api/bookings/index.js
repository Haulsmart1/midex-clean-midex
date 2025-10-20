import { supabase } from '@/lib/supabaseClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export default async function handler(req, res) {
  // ✅ GET: Public fetch by user_id (query param)
  if (req.method === 'GET') {
    try {
      const { user_id } = req.query;

      if (!user_id) {
        console.error('[API GET] Missing user_id');
        return res.status(400).json({ error: 'Missing user_id' });
      }

      console.log('[API GET] Fetching bookings for user_id:', user_id);

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[API GET] Supabase Fetch Error:', error.message || error);
        return res.status(500).json({ error: error.message || 'Database Fetch Error' });
      }

      return res.status(200).json(data || []);
    } catch (err) {
      console.error('[API GET] Unexpected error:', err.stack || err);
      return res.status(500).json({ error: 'Unexpected error fetching bookings' });
    }
  }

  // ✅ POST: Authenticated booking creation
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      console.error('[API POST] Not authenticated');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const {
      pallets,
      adr,
      adr_class_special,
      forklift_pickup,
      forklift_delivery,
      collectionPoints,
      deliveryPoints,
      collection_cost,
      delivery_cost,
      ferry_cost,
      customs_fee,
      vat,
      total_cost,
      miles_to_depot_a,
      miles_from_depot_b,
      distance_miles,
      vehicle_type,
      consignmentRef,
      customer,
      destination,
      weightKg,
      goodsDescription,
    } = req.body;

    // 🔎 Validate request body
    const errors = {};
    if (!Array.isArray(pallets) || pallets.length === 0) errors.pallets = 'At least one pallet is required.';
    if (!Array.isArray(collectionPoints) || collectionPoints.length === 0) errors.collectionPoints = 'At least one collection point is required.';
    if (!Array.isArray(deliveryPoints) || deliveryPoints.length === 0) errors.deliveryPoints = 'At least one delivery point is required.';
    if (typeof collection_cost !== 'number') errors.collection_cost = 'Collection cost must be a number.';
    if (typeof delivery_cost !== 'number') errors.delivery_cost = 'Delivery cost must be a number.';
    if (typeof total_cost !== 'number') errors.total_cost = 'Total cost must be a number.';

    for (const [idx, p] of pallets.entries()) {
      if (p.adr && !p.adrFile) {
        errors[`pallets[${idx}].adrFile`] = 'ADR file is required for ADR pallet';
      }
    }

    if (Object.keys(errors).length > 0) {
      console.error('[API POST] Validation failed', errors);
      return res.status(400).json({ error: 'Invalid booking data.', fields: errors });
    }

    // 📦 Create insert object
    const insertData = {
      pallets,
      adr,
      adr_class_special,
      forklift_pickup,
      forklift_delivery,
      collections: collectionPoints,
      deliveries: deliveryPoints,
      collection_cost,
      delivery_cost,
      ferry_cost,
      customs_fee,
      vat,
      total_cost,
      miles_to_depot_a,
      miles_from_depot_b,
      distance_miles,
      vehicle_type,
      consignment_ref: consignmentRef,
      customer,
      destination,
      weight_kg: weightKg,
      goods_description: goodsDescription,
      user_id: session.user.id, // ✅ CORRECT field
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert([insertData])
      .select('*')
      .single();

    if (error) {
      console.error('[API POST] Supabase Insert Error:', error.message || error);
      return res.status(500).json({ error: error.message || 'Database Insert Error' });
    }

    return res.status(200).json({ success: true, booking: data });
  }

  // ❌ Unsupported method
  console.error('[API] Method not allowed:', req.method);
  return res.status(405).json({ error: 'Method Not Allowed' });
}
