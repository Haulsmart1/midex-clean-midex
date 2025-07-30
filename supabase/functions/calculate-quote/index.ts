import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { consignments } = await req.json();
  let total = 0;
  const breakdowns = [];
  const enriched = [];

  for (const c of consignments) {
    const palletUnits = c.pallets.reduce((sum: number, p: any) => sum + (p.type === 'double' ? 2 : 1), 0);

    const vehicle = palletUnits <= 1 ? 'Small Van'
                 : palletUnits <= 2 ? 'Luton Tailift'
                 : palletUnits <= 3 ? '7.5 Ton Taillift'
                 : '18 Tonner Tail-lift';

    const { data: vehicleRow, error: vErr } = await supabase
      .from('vehicles')
      .select('*')
      .eq('type', vehicle)
      .single();

    const rate = vehicleRow?.rate_per_mile ?? 2.5;
    const baseCost = 500;

    // Replace with real postcode distance calc
    const collectionMiles = 100;
    const deliveryMiles = 80;

    const fromROI = c.collectionPostcode.startsWith('D');
    const toROI = c.deliveryPostcode.startsWith('D');
    const customsRequired = (!fromROI && toROI) || (fromROI && !toROI);
    const customsFee = customsRequired ? 160 : 0;

    const collectionCharge = collectionMiles * rate * 0.9;
    const deliveryCharge = deliveryMiles * rate;
    const totalCost = baseCost + collectionCharge + deliveryCharge + customsFee;

    total += totalCost;

    breakdowns.push({
      baseCost,
      collectionCharge,
      deliveryCharge,
      customsFee,
      total: totalCost
    });

    enriched.push({
      ...c,
      vehicle,
      customsRequired,
      amount: totalCost.toFixed(2)
    });
  }

  return new Response(JSON.stringify({ total, breakdowns, enriched }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
});
