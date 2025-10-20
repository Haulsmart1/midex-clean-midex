'use client';

import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import PointInputs from '@/components/common/PointInputs';
import ConsignmentDetails from '@/components/bookings/ConsignmentDetails';
import CustomsUpload from '@/components/common/CustomsUpload';
import BookingReviewSlide from '@/components/common/BookingReviewSlide';
import BookingStepsNav from '@/components/common/BookingStepsNav';
import { calculateQuote } from '@/utils/rateConfig';
import { resolveRoute } from '@/utils/resolveRoute';
import { normalizePostcode } from '@/utils/normalizePostcode';

export default function BookingSliderWizard({ originalBreakdown = {} }) {
  const { watch } = useFormContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [quote, setQuote] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routeError, setRouteError] = useState('');

  // Helper: at least one valid pallet
  function validatePallets(pallets) {
    if (!Array.isArray(pallets) || pallets.length === 0) return false;
    return pallets.some(
      (p) =>
        p &&
        typeof p.type === 'string' &&
        p.type.trim() &&
        Number(p.weight) > 0 &&
        Number(p.qty) > 0
    );
  }

  // ✅ Subscribe to form changes only when step >= 1
  useEffect(() => {
    if (currentStep < 1) return;

    const subscription = watch(async (values) => {
      const from = normalizePostcode(values.collectionPoints?.[0]?.postcode || '');
      const to = normalizePostcode(values.deliveryPoints?.[0]?.postcode || '');
      const pallets = values.pallets || [];

      if (!from || !to || !validatePallets(pallets)) {
        setQuote(null);
        setRouteInfo(null);
        setRouteError('Please fill all address and pallet fields.');
        return;
      }

      setLoading(true);
      setRouteError('');

      try {
        const routeData = await resolveRoute({ from, to });
        const milesToDepotA = routeData.legs?.[0]?.distanceMiles || 0;
        const milesFromDepotB =
          routeData.legs?.length > 2 ? routeData.legs[2]?.distanceMiles || 0 : 0;

        const result = await calculateQuote({
          from,
          to,
          pallets,
          adr: values.adr || false,
          adrClassSpecial: values.adrClassSpecial || false,
          forkliftPickup: values.forkliftPickup || false,
          forkliftDelivery: values.forkliftDelivery || false,
          milesToDepotA,
          milesFromDepotB,
          ferryRoute: routeData.ferryRoute || 'UK',
        });

        setQuote({
          ...result,
          milesToDepotA,
          milesFromDepotB,
          distanceMiles: routeData.totalMiles,
          legs: routeData.legs,
        });

        setRouteInfo({
          legs: routeData.legs,
          polyline: routeData.routePolyline,
          totalMiles: routeData.totalMiles,
          ferryRoute: routeData.ferryRoute,
        });
      } catch (err) {
        console.error('[Quote calc error]', err);
        setRouteError('❌ Could not calculate quote.');
        setQuote(null);
        setRouteInfo(null);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, currentStep]);

  // Stepper navigation logic
  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Watch values to pass into child components
  const formValues = watch();
  const collectionPoints = formValues.collectionPoints || [];
  const deliveryPoints = formValues.deliveryPoints || [];

  const steps = [
    <PointInputs key="address" />,
    <ConsignmentDetails
      key="consignment"
      collectionPoints={collectionPoints}
      deliveryPoints={deliveryPoints}
    />,
    <CustomsUpload key="customs" />,
    <BookingReviewSlide
      key="review"
      quote={quote}
      originalBreakdown={originalBreakdown}
      routeInfo={routeInfo}
    />,
  ];

  return (
    <div
      className="bg-dark text-white p-4 rounded"
      style={{
        maxWidth: '940px',
        minWidth: '700px',
        margin: '0 auto',
        background: 'rgba(20,24,38,0.98)',
        borderRadius: '2.5rem',
        boxShadow: '0 8px 36px 0 #0aefff28, 0 1.5px 4px #0002',
        border: '1px solid #11224499',
        zIndex: 3,
      }}
    >
      <h3 className="mb-3">
        Step {currentStep + 1} / {steps.length}
      </h3>
      {steps[currentStep]}
      {routeError && (
        <div style={{ color: 'orange', fontWeight: 600 }}>{routeError}</div>
      )}
      {loading && <p className="text-info">Calculating route & quote…</p>}
      <BookingStepsNav
        currentStep={currentStep}
        steps={steps}
        onNext={handleNext}
        onBack={handleBack}
      />
    </div>
  );
}



