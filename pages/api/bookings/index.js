import { supabase } from '@/lib/supabaseClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    console.error('API: Not authenticated');
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.method !== 'POST') {
    console.error('API: Method Not Allowed');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extract booking data
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

  // Validation
  const errors = {};
  if (!Array.isArray(pallets) || pallets.length === 0) errors.pallets = 'At least one pallet is required.';
  if (!Array.isArray(collectionPoints) || collectionPoints.length === 0) errors.collectionPoints = 'At least one collection point is required.';
  if (!Array.isArray(deliveryPoints) || deliveryPoints.length === 0) errors.deliveryPoints = 'At least one delivery point is required.';
  if (typeof collection_cost !== 'number') errors.collection_cost = 'Collection cost is required.';
  if (typeof delivery_cost !== 'number') errors.delivery_cost = 'Delivery cost is required.';
  if (typeof total_cost !== 'number') errors.total_cost = 'Total cost is required.';

  // Per-pallet ADR file validation (optional, enable if needed)
  for (const [idx, p] of (pallets || []).entries()) {
    if (p.adr && !p.adrFile) {
      errors[`pallets[${idx}].adrFile`] = 'ADR file is required for ADR pallet';
    }
  }

  if (Object.keys(errors).length) {
    console.error('API: Validation failed', errors);
    return res.status(400).json({ error: 'Missing or invalid booking data.', fields: errors });
  }

  // Insert to DB
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
    forwarder_id: session.user.id,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert([insertData])
    .select('*')
    .single();

  if (error) {
    console.error('❌ Insert Error:', error.message || error);
    return res.status(500).json({ error: error.message || 'Database Insert Error' });
  }

  return res.status(200).json({ success: true, booking: data });
}
