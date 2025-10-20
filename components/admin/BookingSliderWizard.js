'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import debounce from 'lodash.debounce';

import PointInputs from '@/components/common/PointInputs';
import ConsignmentDetails from '@/components/admin/ConsignmentDetails';
import Requirements from '@/components/admin/Requirements';
import CustomsSlide from '@/components/common/CustomsSlide';
import BookingReview from '@/components/common/BookingReview';
import BookingStepsNav from '@/components/common/BookingStepsNav';

import calculateQuote from '@/utils/pricingEngine';
import resolveRoute from '@/utils/resolveRoute';
import {
  normalizePostcode,
  isGB,
  isNI,
  isROI,
  requiresCustoms
} from '@/utils/normalizePostcode';

import { uploadFile } from '@/utils/uploadHelper';
import supabase from '@/lib/supabaseClient';

function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const normalizeEquip = (val) => (val || '').toString().trim().toLowerCase();

export default function BookingSliderWizard() {
  const { control, setValue, getValues, reset } = useFormContext();
  const values = useWatch({ control });

  const [step, setStep] = useState(0);
  const [quote, setQuote] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeError, setRouteError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInternational, setIsInternational] = useState(false);
  const [saved, setSaved] = useState(false);

  const bookingId = values?.id || genId();

  const handleFileUpload = async (file, bucket, valuePath, extraPath = '') => {
    if (!file) return;
    try {
      const url = await uploadFile(
        supabase,
        bookingId,
        bucket,
        file,
        `${extraPath}${Date.now()}_${file.name}`
      );
      setValue(valuePath, url, { shouldDirty: true });
    } catch (err) {
      console.error(`Upload failed for ${valuePath}:`, err);
      setValue(valuePath, { error: err.message || 'Upload failed' }, { shouldDirty: true });
    }
  };

  const calculateAndSetQuote = useMemo(
    () =>
      debounce(async (vals) => {
        const from =
          normalizePostcode(vals?.collections?.[0]?.postcode ||
            vals?.collectionPoints?.[0]?.postcode ||
            vals?.pallets?.[0]?.collectionAddress || '');

        const to =
          normalizePostcode(vals?.deliveries?.[0]?.postcode ||
            vals?.deliveryPoints?.[0]?.postcode ||
            vals?.pallets?.[0]?.deliveryAddress || '');

        const pallets = vals?.pallets || [];

        console.log('📦 From:', from, 'To:', to, 'Pallets:', pallets);

        // 🚨 Add postcode region debug
        console.log('📍 Debug: Postcode Details', {
          from,
          to,
          isGB_from: isGB(from),
          isGB_to: isGB(to),
          isNI_from: isNI(from),
          isNI_to: isNI(to),
          isROI_from: isROI(from),
          isROI_to: isROI(to),
          requiresCustoms: requiresCustoms(from, to),
        });

        if (!from || !to || pallets.length === 0) {
          setQuote(null);
          setRouteInfo(null);
          setRouteError('Waiting for route calculation…');
          setIsInternational(false);
          return;
        }

        try {
          setLoading(true);

          // ✅ Detect internal GB (no customs)
          const isInternal =
            isGB(from) &&
            isGB(to) &&
            !isNI(from) &&
            !isNI(to) &&
            !isROI(from) &&
            !isROI(to);

          const route = await resolveRoute({ from, to, isInternal });

          if (!route?.legs?.length) throw new Error('Route resolution failed');

          const customsRequired = !!route.customsRequired;

          // 🚨 Route debug
          console.log('🚚 Route Debug', {
            legs: route.legs,
            customsRequired: customsRequired,
            isInternal,
          });

          setIsInternational(customsRequired);
          setRouteInfo({ ...route, customsRequired });

          const legs = route.legs;
          const roadMiles = legs.filter((l) => !l.isFerry).reduce((s, l) => s + (l.distanceMiles || 0), 0);
          const ferryMiles = legs.filter((l) => l.isFerry).reduce((s, l) => s + (l.distanceMiles || 0), 0);
          const totalMiles = roadMiles + ferryMiles;

          const firstRoadLeg = legs.find((l) => !l.isFerry);
          const lastRoadLeg = [...legs].reverse().find((l) => !l.isFerry);
          const milesToDepotA = firstRoadLeg?.distanceMiles || 0;
          const milesFromDepotB = lastRoadLeg?.distanceMiles || 0;

          const hasForkliftPickup = pallets.some((p) => normalizeEquip(p.collectionEquipment) === 'forklift');
          const hasTailLiftPickup = pallets.some((p) =>
            ['tail lift', 'tail-lift'].includes(normalizeEquip(p.collectionEquipment))
          );
          const hasForkliftDelivery = pallets.some((p) => normalizeEquip(p.deliveryEquipment) === 'forklift');
          const hasTailLiftDelivery = pallets.some((p) =>
            ['tail lift', 'tail-lift'].includes(normalizeEquip(p.deliveryEquipment))
          );

          const adr = pallets.some((p) => p.adr);
          const adrClassSpecial = pallets.some((p) => p.adrClassSpecial);

          const palletUnits = pallets.reduce((sum, p) => sum + (Number(p.qty) || 0), 0);
          const totalWeight = pallets.reduce((sum, p) => sum + ((Number(p.weight) || 0) * (Number(p.qty) || 0)), 0);
          const totalPallets = pallets.length;

          const q = await calculateQuote({
            from,
            to,
            pallets,
            adr,
            adrClassSpecial,
            forkliftPickup: hasForkliftPickup,
            forkliftDelivery: hasForkliftDelivery,
            tailLiftPickup: hasTailLiftPickup,
            tailLiftDelivery: hasTailLiftDelivery,
            milesToDepotA,
            milesFromDepotB,
            ferryRoute: route.ferryRoute || null,
            customsRequired,
            roadMiles,
            ferryMiles,
            totalMiles,
          });

          setQuote({
            ...q,
            milesToDepotA,
            milesFromDepotB,
            roadMiles,
            ferryMiles,
            totalMiles,
            pallets,
            collectionPoints: vals.collectionPoints,
            deliveryPoints: vals.deliveryPoints,
            ferryRoute: route.ferryRoute || null,
            totalWeight,
            totalPallets,
            breakdown: {
              ...q.breakdown,
              milesToDepotA,
              milesFromDepotB,
              palletUnits,
              totalPallets,
              totalWeight,
              forkliftPickup: hasForkliftPickup,
              tailLiftPickup: hasTailLiftPickup,
              forkliftDelivery: hasForkliftDelivery,
              tailLiftDelivery: hasTailLiftDelivery,
              collectionNone: !hasForkliftPickup && !hasTailLiftPickup,
              deliveryNone: !hasForkliftDelivery && !hasTailLiftDelivery,
              adr,
              adrClassSpecial,
            },
          });

          setRouteError('');
        } catch (err) {
          console.error('❌ Route/Quote error:', err);
          setQuote(null);
          setRouteInfo(null);
          setRouteError(`Failed to calculate quote: ${err.message}`);
          setIsInternational(false);
        } finally {
          setLoading(false);
        }
      }, 600),
    []
  );

  useEffect(() => {
    calculateAndSetQuote(values);
    return () => {
      if (calculateAndSetQuote.cancel) calculateAndSetQuote.cancel();
    };
  }, [values, calculateAndSetQuote]);

  const handleFinalSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const formValues = getValues();
      const payload = {
        id: bookingId,
        status: 'draft',
        pallets: formValues.pallets ?? [],
        collections: formValues.collectionPoints ?? [],
        deliveries: formValues.deliveryPoints ?? [],
        customs_files: formValues.customsFiles ?? {},
        sender_eori: formValues.senderEori ?? '',
        receiver_eori: formValues.receiverEori ?? '',
        commodity_codes: formValues.commodityCodes ?? [],
        total_cost: quote?.totalCost ?? 0,
        amount: quote?.totalCost ?? 0,
        ferry_route: !!quote?.ferryRoute,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('bookings').upsert(payload, { onConflict: 'id' });
      if (error) throw error;

      setSaved(true);
      reset();
      setStep(0);
      setQuote(null);
      setRouteInfo(null);
      setRouteError('');
    } catch (err) {
      console.error('Save failed:', err);
      alert(`❌ Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    { title: 'Points', content: <PointInputs /> },
    {
      title: 'Consignment',
      content: (
        <ConsignmentDetails
          handleAdrFileUpload={(idx, file) =>
            handleFileUpload(file, 'files', `pallets.${idx}.adrFileUrl`, `adr/pallet_${idx}_`)
          }
          handleDocumentUpload={(file) =>
            handleFileUpload(file, 'files', 'documentFileUrl', 'documents/')
          }
        />
      ),
    },
    { title: 'Requirements', content: <Requirements /> },
    ...(isInternational
      ? [
          {
            title: 'Customs',
            content: (
              <CustomsSlide bookingId={bookingId} setValue={setValue} routeInfo={routeInfo} />
            ),
          },
        ]
      : []),
    {
      title: 'Review & Final Cost',
      content:
        routeInfo?.legs?.length && quote ? (
          <BookingReview quote={quote} routeInfo={routeInfo} originalQuote={{}} />
        ) : (
          <div style={{ padding: '1rem', color: '#aaa', fontStyle: 'italic' }}>
            {loading ? 'Calculating route…' : routeError || 'Enter all data to calculate quote.'}
          </div>
        ),
    },
  ];

  const handleNext = () => {
    const nextStep = step + 1;
    const isFinalStep = nextStep === steps.length - 1;
    if (isFinalStep && (!quote || !routeInfo?.legs?.length)) {
      setRouteError('Still calculating quote. Please wait.');
      return;
    }
    setStep(Math.min(nextStep, steps.length - 1));
  };

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 0));

  if (saved) {
    return (
      <div className="wizard-wrapper text-center" style={{ padding: '2rem' }}>
        <h2 className="text-success">✅ Booking Saved</h2>
        <p>Your booking was saved successfully.</p>
        <button className="btn btn-primary mt-3" onClick={() => setSaved(false)}>
          Create Another Booking
        </button>
      </div>
    );
  }

  return (
    <div className="wizard-wrapper">
      <h3 className="mb-3 text-center neon-text">
        Step {step + 1} / {steps.length}
      </h3>

      <div style={{ marginBottom: '1rem' }}>{steps[step].content}</div>

      {routeError && <p className="text-warning mt-2">{routeError}</p>}
      {loading && <p className="text-info mt-2">Calculating route…</p>}

      <BookingStepsNav
        steps={steps}
        currentStep={step}
        setCurrentStep={setStep}
        onNext={handleNext}
        onBack={handleBack}
        onSave={handleFinalSave}
        buttonProps={{
          disabled:
            isSaving ||
            (steps[step]?.title?.toLowerCase().includes('review') &&
              (!quote || !routeInfo?.legs?.length)),
        }}
      />
    </div>
  );
}
