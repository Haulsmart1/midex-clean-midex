import { useState, useEffect } from 'react';
import { normalizePostcode } from '@/utils/normalizePostcode';
import { resolveRoute } from '@/utils/resolveRoute';
import { calculateQuote } from '@/utils/pricingEngine';

export function useBookingQuoteAndRoute(values, watchDeps = []) {
  const [breakdown, setBreakdown] = useState({});
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const rawFrom =
    values?.collections?.[0]?.postcode ||
    values?.collectionPoints?.[0]?.postcode || '';
  const rawTo =
    values?.deliveries?.[0]?.postcode ||
    values?.deliveryPoints?.[0]?.postcode || '';
  const pallets = values?.pallets || [];

  const from = normalizePostcode(rawFrom);
  const to = normalizePostcode(rawTo);

  const shouldCalculate =
    from.length > 3 && to.length > 3 && Array.isArray(pallets) && pallets.length > 0;

  useEffect(() => {
    if (!shouldCalculate) {
      setBreakdown({});
      setRouteInfo(null);
      return;
    }

    const run = async () => {
      setLoading(true);
      try {
        const route = await resolveRoute({ from, to });

        const legs = route?.legs || [];
        const roadLegs = legs.filter(l => !l.isFerry);
        const ferryLegs = legs.filter(l => l.isFerry);

        const milesToDepotA = roadLegs[0]?.distanceMiles || 0;
        const milesFromDepotB = roadLegs.length > 1
          ? roadLegs[roadLegs.length - 1]?.distanceMiles || 0
          : 0;

        const ferryMiles = ferryLegs.reduce((sum, l) => sum + (l.distanceMiles || 0), 0);
        const roadMiles = milesToDepotA + milesFromDepotB;
        const totalMiles = roadMiles + ferryMiles;

        const forkliftPickup = pallets.some(p => p.collectionEquipment === 'forklift');
        const tailLiftPickup = pallets.some(p => p.collectionEquipment === 'tail-lift');
        const forkliftDelivery = pallets.some(p => p.deliveryEquipment === 'forklift');
        const tailLiftDelivery = pallets.some(p => p.deliveryEquipment === 'tail-lift');

        const quote = await calculateQuote({
          from,
          to,
          pallets,
          adr: pallets.some(p => p.adr),
          adrClassSpecial: pallets.some(p => p.adrClassSpecial),
          forkliftPickup,
          tailLiftPickup,
          forkliftDelivery,
          tailLiftDelivery,
          milesToDepotA,
          milesFromDepotB,
          ferryRoute: route.ferryRoute,
          customsRequired: route.customsRequired,
          vatApplicable: !route.customsRequired,
        });

        setRouteInfo({
          ...route,
          roadMiles,
          ferryMiles,
          totalMiles,
        });

        setBreakdown({
          ...quote,
          roadMiles,
          ferryMiles,
          totalMiles,
          milesToDepotA,
          milesFromDepotB,
          pallets,
          collectionPoints: values?.collections || values?.collectionPoints,
          deliveryPoints: values?.deliveries || values?.deliveryPoints,
          ferryRoute: route.ferryRoute,
          customsRequired: route.customsRequired,
          vatApplicable: !route.customsRequired,
          breakdown: {
            ...(quote.breakdown || {}),
            forkliftPickup,
            tailLiftPickup,
            forkliftDelivery,
            tailLiftDelivery,
            milesToDepotA,
            milesFromDepotB,
          },
        });
      } catch (err) {
        console.error('❌ Quote calculation error:', err.message || err);
        setBreakdown({});
        setRouteInfo(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [from, to, pallets.length, ...watchDeps]);

  return { breakdown, routeInfo, loading };
}

