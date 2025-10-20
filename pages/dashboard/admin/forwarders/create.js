'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import supabase from '@/lib/supabaseClient';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import PointInputs from '@/components/common/PointInputs';
import ConsignmentDetails from '@/components/admin/ConsignmentDetails';
import Requirements from '@/components/admin/Requirements';
import BookingReview from '@/components/common/BookingReview';
import CustomsSlide from '@/components/common/CustomsSlide';
import BookingStepper from '@/components/admin/BookingStepper';

import { resolveRoute } from '@/utils/resolveRoute';
import calculateQuote from '@/utils/pricingEngine';
import { normalizePostcode } from '@/utils/normalizePostcode';
import { uploadFile } from '@/utils/uploadHelper';

import styles from '@/styles/SuperAdminDashboard.module.css';

export default function BookingForm({ params }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const id = params?.id || null;
  const [step, setStep] = useState(0);
  const [breakdown, setBreakdown] = useState({});
  const [routeInfo, setRouteInfo] = useState(null);
  const [originalQuote, setOriginalQuote] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const methods = useForm({
    defaultValues: {
      pallets: [],
      collectionPoints: id ? [] : [{ postcode: '' }],
      deliveryPoints: id ? [] : [{ postcode: '' }],
      customsFiles: { invoice: null, packing: null, delivery: null },
      senderEori: '',
      receiverEori: '',
      commodityCodes: [],
    },
  });

  const { getValues, watch, reset } = methods;
  const bookingKey = id || 'new';

  // 🔹 Extract postcode from strings
  const extractPostcode = (str) => {
    if (!str) return '';
    // Match UK or Irish style postcodes
    const match = str.match(
      /\b([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}|[A-Z]\d{2}\s?[A-Z0-9]{4}|[A-Z0-9]{3}\s?[A-Z0-9]{4})\b/i
    );
    return match ? match[0].toUpperCase() : str.trim();
  };

  // ---------- Load booking if editing ----------
  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        alert(`❌ Could not load booking: ${error.message}`);
        return;
      }

      reset({
        pallets: data.pallets || [],
        collectionPoints: data.collections || [],
        deliveryPoints: data.deliveries || [],
        customsFiles: data.customs_files || {},
        senderEori: data.sender_eori || '',
        receiverEori: data.receiver_eori || '',
        commodityCodes: data.commodity_codes || [],
      });

      setOriginalQuote({ totalCost: data.total_cost, ...data });
    })();
  }, [id, reset]);

  // ---------- Run quote + route calculation ----------
  const runQuoteCalculation = useCallback(async (values) => {
    const pallets = values?.pallets || [];
    const collections = values?.collectionPoints || [];
    const deliveries = values?.deliveryPoints || [];

    const collectionPostcode =
      collections[0]?.postcode?.trim() ||
      extractPostcode(collections[0]?.address) ||
      extractPostcode(collections[0]?.fullAddress) ||
      extractPostcode(pallets[0]?.collectionAddress) ||
      '';

    const deliveryPostcode =
      deliveries[0]?.postcode?.trim() ||
      extractPostcode(deliveries[0]?.address) ||
      extractPostcode(deliveries[0]?.fullAddress) ||
      extractPostcode(pallets[0]?.deliveryAddress) ||
      '';

    const from = normalizePostcode(collectionPostcode);
    const to = normalizePostcode(deliveryPostcode);

    console.log('🧠 [runQuoteCalculation] Inputs:', { collectionPostcode, deliveryPostcode, from, to, pallets });

    if (!from || !to || pallets.length === 0) {
      console.warn('⚠️ Skipping quote: missing from/to or pallets');
      setBreakdown({});
      setRouteInfo(null);
      return;
    }

    try {
      const route = await resolveRoute({ from, to });
      console.log('✅ Route resolved:', route);

      const legs = route?.legs || [];
      const roadLegs = legs.filter((l) => !l.isFerry);
      const ferryLegs = legs.filter((l) => l.isFerry);

      const milesToDepotA = roadLegs[0]?.distanceMiles || 0;
      const milesFromDepotB = roadLegs.at(-1)?.distanceMiles || 0;
      const ferryMiles = ferryLegs.reduce((sum, l) => sum + (l.distanceMiles || 0), 0);
      const roadMiles = milesToDepotA + milesFromDepotB;
      const totalMiles = roadMiles + ferryMiles;

      const enrichedRoute = { ...route, roadMiles, ferryMiles, totalMiles };
      setRouteInfo(enrichedRoute);

      const forkliftPickup = pallets.some((p) => p.collectionEquipment === 'forklift');
      const tailLiftPickup = pallets.some((p) => p.collectionEquipment === 'tail-lift');
      const forkliftDelivery = pallets.some((p) => p.deliveryEquipment === 'forklift');
      const tailLiftDelivery = pallets.some((p) => p.deliveryEquipment === 'tail-lift');

      const quote = await calculateQuote({
        from,
        to,
        pallets,
        adr: pallets.some((p) => p.adr),
        adrClassSpecial: pallets.some((p) => p.adrClassSpecial),
        forkliftPickup,
        tailLiftPickup,
        forkliftDelivery,
        tailLiftDelivery,
        milesToDepotA,
        milesFromDepotB,
        ferryRoute: route.ferryRoute,
        customsRequired: route.customsRequired,
      });

      setBreakdown({
        ...quote,
        roadMiles,
        ferryMiles,
        totalMiles,
        pallets,
        collectionPoints: [{ postcode: collectionPostcode }],
        deliveryPoints: [{ postcode: deliveryPostcode }],
        ferryRoute: route.ferryRoute || null,
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
      console.error('❌ Quote calculation failed:', err);
      setBreakdown({});
      setRouteInfo(null);
    }
  }, []);

  // ---------- Auto-run when form changes ----------
  useEffect(() => {
    const subscription = watch((values) => {
      runQuoteCalculation(values);
    });
    return () => subscription.unsubscribe();
  }, [watch, runQuoteCalculation]);

  // ---------- Initial run ----------
  useEffect(() => {
    const timeout = setTimeout(() => {
      runQuoteCalculation(getValues());
    }, 300);
    return () => clearTimeout(timeout);
  }, [getValues, runQuoteCalculation]);

  // ---------- Save booking ----------
  const onSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const values = getValues();
      const payload = {
        id: id || undefined,
        user_id: session?.user?.id ?? null,
        status: 'draft',
        pallets: values.pallets ?? [],
        collections: values.collectionPoints ?? [],
        deliveries: values.deliveryPoints ?? [],
        customs_files: values.customsFiles ?? {},
        sender_eori: values.senderEori ?? '',
        receiver_eori: values.receiverEori ?? '',
        commodity_codes: values.commodityCodes ?? [],
        total_cost: breakdown.totalCost ?? 0,
        amount: breakdown.totalCost ?? 0,
        ferry_route: !!breakdown.ferryRoute,
        updated_at: new Date().toISOString(),
      };

      if (!id) payload.created_at = new Date().toISOString();

      const query = id
        ? supabase.from('bookings').upsert(payload, { onConflict: 'id' }).select('id').maybeSingle()
        : supabase.from('bookings').insert(payload).select('id').single();

      const { data, error } = await query;
      if (error) throw error;

      alert(`✅ Booking ${id ? 'updated' : 'created'} successfully!`);
      router.push(`/dashboard/admin/super/booking/edit/${data.id}`);
    } catch (err) {
      console.error('❌ Save failed:', err);
      alert(`🚨 Save failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- Step definitions ----------
  const stepDefs = useMemo(() => {
    const steps = [
      { title: 'Points', content: <PointInputs /> },
      {
        title: 'Consignment',
        content: (
          <ConsignmentDetails
            bookingId={bookingKey}
            handleAdrFileUpload={(idx, file) =>
              uploadFile(supabase, bookingKey, 'files', file, `adr/pallet_${idx}`)
            }
            handleDocumentUpload={(file) => uploadFile(supabase, bookingKey, 'files', file, 'documents')}
          />
        ),
      },
      { title: 'Requirements', content: <Requirements /> },
    ];

    if (routeInfo?.customsRequired) {
      steps.push({
        title: 'Customs',
        content: (
          <CustomsSlide
            bookingId={bookingKey}
            session={session}
            routeInfo={routeInfo}
            handleCustomsUpload={(file, type) =>
              uploadFile(supabase, bookingKey, 'files', file, `customs/${type}`)
            }
          />
        ),
      });
    }

    steps.push({
      title: 'Review & Final Cost',
      content: (
        <BookingReview
          quote={breakdown}
          routeInfo={routeInfo}
          pallets={watch('pallets')}
          originalQuote={originalQuote}
        />
      ),
    });

    return steps;
  }, [routeInfo?.customsRequired, breakdown, watch, session, originalQuote, bookingKey, id]);

  // ---------- Render ----------
  if (status === 'unauthenticated') {
    return <div style={{ color: 'white', padding: '2rem' }}>⚠️ Not logged in.</div>;
  }

  if (id && !originalQuote) {
    return <div style={{ color: 'white', padding: '2rem' }}>⏳ Loading booking...</div>;
  }

  return (
    <SuperAdminLayout>
      <div className={styles.bookingStepWrapper}>
        <h2 className={styles.cardTitle}>{id ? 'Edit Booking' : 'Create New Booking'}</h2>
        <FormProvider {...methods}>
          <BookingStepper
            steps={stepDefs}
            currentStep={step}
            setCurrentStep={setStep}
            onSave={onSave}
            buttonProps={{ disabled: isSaving }}
            routeInfo={routeInfo}
            setRouteInfo={setRouteInfo} // ✅ important
          />
        </FormProvider>
      </div>
    </SuperAdminLayout>
  );
}

