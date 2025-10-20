'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import debounce from 'lodash.debounce';

import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import BookingStepper from '@/components/admin/BookingStepper';
import PointInputs from '@/components/common/PointInputs';
import ConsignmentDetails from '@/components/admin/ConsignmentDetails';
import Requirements from '@/components/admin/Requirements';
import CustomsSlide from '@/components/common/CustomsSlide';
import BookingReview from '@/components/common/BookingReview';

import { resolveRoute } from '@/utils/resolveRoute';
import calculateQuote from '@/utils/pricingEngine';
import { normalizePostcode, getRegion } from '@/utils/normalizePostcode';

import supabase from '@/lib/supabaseClient';
import styles from '@/styles/BookingWizard.module.css';

export default function CreateBookingPage() {
  const methods = useForm({
    defaultValues: {
      collectionPoints: [{ postcode: '' }],
      deliveryPoints: [{ postcode: '' }],
      pallets: [],
      documents: [],
      customsFiles: { invoice: null, packing: null, delivery: null },
      senderEori: '',
      receiverEori: '',
      commodityCodes: [],
      requirements: { travelMode: 'truck', allowFerries: true },
      assignedUser: '',
      consignmentRef: '',
      goodsDescription: '',
    },
  });

  const { getValues, setValue, control } = methods;

  const [routeInfo, setRouteInfo] = useState(null);
  const [quote, setQuote] = useState(null);
  const [step, setStep] = useState(0);
  const [customsRequired, setCustomsRequired] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const [totalWeightKg, setTotalWeightKg] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);

  const collectionPoints = useWatch({ control, name: 'collectionPoints' }) || [];
  const deliveryPoints = useWatch({ control, name: 'deliveryPoints' }) || [];
  const pallets = useWatch({ control, name: 'pallets' }) || [];
  const assignedUser = useWatch({ control, name: 'assignedUser' });

  useEffect(() => {
    supabase
      .from('users')
      .select('id, email')
      .then(({ data }) => {
        if (data) setUsers(data);
      });
  }, []);

  useEffect(() => {
    if (!bookingId) {
      supabase
        .from('bookings')
        .insert([{ status: 'draft', created_at: new Date().toISOString() }])
        .select('id')
        .single()
        .then(({ data, error }) => {
          if (!error && data?.id) {
            setBookingId(data.id);
          } else {
            console.error('❌ Failed to create draft booking:', error);
          }
        });
    }
  }, [bookingId]);

  const runCalcRef = useRef(null);

  useEffect(() => {
    runCalcRef.current = debounce(async () => {
      const v = getValues();
      const from = normalizePostcode(collectionPoints?.[0]?.postcode || '');
      const to = normalizePostcode(deliveryPoints?.[0]?.postcode || '');

      if (!from || !to || !pallets.length) {
        console.log('❌ Missing from/to or pallets — skipping calc');
        return;
      }

      try {
        const normalize = (val) => (val || '').toLowerCase().replace(/[\s_-]+/g, '');
        const forkliftPickup = pallets.some((p) => normalize(p.collectionEquipment) === 'forklift');
        const tailLiftPickup = pallets.some((p) => normalize(p.collectionEquipment).includes('taillift'));
        const forkliftDelivery = pallets.some((p) => normalize(p.deliveryEquipment) === 'forklift');
        const tailLiftDelivery = pallets.some((p) => normalize(p.deliveryEquipment).includes('taillift'));
        const adrRequired = pallets.some((p) => p.adr);

        const units = pallets.reduce((sum, p) => sum + (Number(p?.qty) || 0), 0);
        const weight = pallets.reduce(
          (sum, p) => sum + (Number(p?.weight || p?.weightKg) || 0) * (Number(p?.qty) || 0),
          0
        );

        setTotalUnits(units);
        setTotalWeightKg(weight);

        const fromRegion = getRegion(from);
        const toRegion = getRegion(to);
        const isInternal = fromRegion === toRegion && fromRegion !== 'EU';

        console.log(`🚚 Route calculation: ${from} → ${to}`);
        console.log(`🌍 Regions: ${fromRegion} → ${toRegion} | Internal: ${isInternal}`);

        const route = await resolveRoute({
          from,
          to,
          fromRegion,
          toRegion,
          allowFerries: v.requirements?.allowFerries ?? true,
          travelMode: v.requirements?.travelMode || 'truck',
          isInternal,
        });

        console.log('✅ Route:', route);

        const q = await calculateQuote({
          pallets,
          legs: route.legs || [],
          collectionMiles: route.collectionMiles || 0,
          deliveryMiles: route.deliveryMiles || 0,
          middleMiles: route.middleMiles || 0,
          ferryMiles: route.ferryMiles || 0,
          totalMiles: route.totalMiles || 0,
          customsRequired: route.customsRequired,
          vatRequired: route.vatApplied,
          ferryRoute: route.ferryRoute || null,
          adr: adrRequired,
          forkliftPickup,
          tailLiftPickup,
          forkliftDelivery,
          tailLiftDelivery,
        });

        console.log('💸 Quote:', q);

        setRouteInfo(route);
        setQuote(q);
        setCustomsRequired(route.customsRequired);
      } catch (err) {
        console.error('❌ runCalc error:', err.message);
        setRouteInfo(null);
        setQuote(null);
        setCustomsRequired(false);
      }
    }, 500);
  }, [getValues, collectionPoints, deliveryPoints, pallets]);

  useEffect(() => {
    if (runCalcRef.current) {
      runCalcRef.current();
    }
  }, [collectionPoints, deliveryPoints, JSON.stringify(pallets)]);

  const handleSaveBooking = async () => {
    if (!bookingId) return alert('Booking ID not ready yet.');

    const v = getValues();

    const payload = {
      consignment_ref: v.consignmentRef || null,
      goods_description: v.goodsDescription || null,
      assigned_user: v.assignedUser || null,

      pallets: JSON.stringify(v.pallets || []),
      collectionpoints: JSON.stringify(v.collectionPoints || []),
      deliverypoints: JSON.stringify(v.deliveryPoints || []),

      customs_required: customsRequired,
      sender_eori: v.senderEori || null,
      receiver_eori: v.receiverEori || null,
      commodity_codes: v.commodityCodes || [],
      customs_files: v.customsFiles || {},

      vehicle: quote?.vehicle || null,
      total_weight_kg: totalWeightKg,
      total_units: totalUnits,
      road_miles: routeInfo?.roadMiles || 0,
      ferry_miles: routeInfo?.ferryMiles || 0,
      total_miles: routeInfo?.totalMiles || 0,
      ferry_route: routeInfo?.ferryRoute || null,

      vat_applied: quote?.vatApplied || false,
      vat_amount: quote?.vatAmount || 0,
      total_ex_vat: quote?.totalExVat || 0,
      total_inc_vat: quote?.totalIncVat || 0,

      updated_at: new Date().toISOString(),
      status: 'confirmed',
    };

    const { error } = await supabase.from('bookings').update(payload).eq('id', bookingId);
    if (error) {
      console.error('❌ Failed to save booking:', error.message);
      alert('Failed to save booking.');
    } else {
      setConfirmation(`✅ Booking #${bookingId} saved successfully!`);
    }
  };

  const steps = [
    { title: 'Points', content: <PointInputs /> },
    { title: 'Consignment', content: <ConsignmentDetails bookingId={bookingId} /> },
    { title: 'Requirements', content: <Requirements /> },
    {
      title: 'Assign User',
      content: (
        <div>
          <h3>Assign booking to a user</h3>
          <select
            value={assignedUser}
            onChange={(e) => setValue('assignedUser', e.target.value)}
            style={{ padding: '0.5rem', fontSize: '1rem', minWidth: '250px' }}
          >
            <option value="">-- Select User --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </select>
        </div>
      ),
    },
    ...(customsRequired
      ? [
          {
            title: 'Customs',
            content: (
              <div>
                <p>This route requires customs — please upload documents and EORI details.</p>
                <CustomsSlide bookingId={bookingId} />
              </div>
            ),
          },
        ]
      : []),
    {
      title: 'Review & Final Cost',
      content: (
        <BookingReview
          quote={quote || {}}
          routeInfo={routeInfo || {}}
          pallets={pallets}
          totalUnits={totalUnits}
          totalWeightKg={totalWeightKg}
          vehicle={quote?.vehicle || null}
        />
      ),
    },
  ];

  return (
    <SuperAdminLayout>
      <div className={styles.pageWrap}>
        <div className={styles.wizard}>
          <h2 className={styles.pageTitle}>📦 Create New Booking</h2>
          {confirmation && <div style={{ color: 'lime', marginBottom: '1rem' }}>{confirmation}</div>}
          <div className={styles.panel}>
            <FormProvider {...methods}>
              <BookingStepper
                steps={steps}
                currentStep={step}
                setCurrentStep={setStep}
                routeInfo={routeInfo}
                setRouteInfo={setRouteInfo}
                onSave={handleSaveBooking}
              />
            </FormProvider>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
