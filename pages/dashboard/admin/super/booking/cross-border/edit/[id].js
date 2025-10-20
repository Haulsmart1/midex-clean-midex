'use client';

import { useRouter } from 'next/router';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';

import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import BookingStepper from '@/components/admin/BookingStepper';
import PointInputs from '@/components/common/PointInputs';
import ConsignmentDetails from '@/components/admin/ConsignmentDetails';
import Requirements from '@/components/admin/Requirements';
import CustomsSlide from '@/components/common/CustomsSlide';
import BookingReview from '@/components/common/BookingReview';

import { resolveRoute } from '@/utils/resolveRoute';
import { normalizePostcode, isGB, isNI, isROI } from '@/utils/normalizePostcode';
import calculateQuote from '@/utils/pricingEngine';
import supabase from '@/lib/supabaseClient';
import styles from '@/styles/ManageBookings.module.css';

export default function EditInternalBookingPage() {
  const router = useRouter();
  const { id } = router.query;

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
  const [customsRequired, setCustomsRequired] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [totalWeightKg, setTotalWeightKg] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);
  const [confirmation, setConfirmation] = useState(null);

  const collectionPoints = useWatch({ control, name: 'collectionPoints' }) || [];
  const deliveryPoints = useWatch({ control, name: 'deliveryPoints' }) || [];
  const pallets = useWatch({ control, name: 'pallets' }) || [];
  const assignedUser = useWatch({ control, name: 'assignedUser' });

  const safeParseJSON = (val, fallback = []) => {
    try {
      if (typeof val !== 'string' || val.trim() === '' || val.trim().toLowerCase() === 'null') {
        return fallback;
      }
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      const { data, error } = await supabase.from('bookings').select('*').eq('id', id).single();
      if (error) return console.error('❌ Fetch error:', error);

      Object.entries(data).forEach(([key, val]) => {
        if (key === 'collectionpoints') {
          setValue('collectionPoints', safeParseJSON(val));
        } else if (key === 'deliverypoints') {
          setValue('deliveryPoints', safeParseJSON(val));
        } else if (key === 'pallets') {
          setValue('pallets', safeParseJSON(val));
        } else if (key === 'assigneduser') {
          setValue('assignedUser', val);
        } else {
          setValue(key, val);
        }
      });
      setLoading(false);
    };

    fetchBooking();
  }, [id, setValue]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('users').select('id, email');
      if (data) setUsers(data);
    };
    fetchUsers();
  }, []);

  const debounce = (fn, ms = 450) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  const runCalc = useCallback(
    debounce(async () => {
      const v = getValues();
      const from = normalizePostcode(v.collectionPoints?.[0]?.postcode || '');
      const to = normalizePostcode(v.deliveryPoints?.[0]?.postcode || '');

      if (!from || !to || !v.pallets.length) return;

      const normalize = (val) => (val || '').toLowerCase().replace(/[\s_-]+/g, '');
      const forkliftPickup = v.pallets.some((p) => normalize(p.collectionEquipment) === 'forklift');
      const tailLiftPickup = v.pallets.some((p) => normalize(p.collectionEquipment).includes('taillift'));
      const forkliftDelivery = v.pallets.some((p) => normalize(p.deliveryEquipment) === 'forklift');
      const tailLiftDelivery = v.pallets.some((p) => normalize(p.deliveryEquipment).includes('taillift'));
      const adrRequired = v.pallets.some((p) => p.adr);

      const totalUnits = v.pallets.reduce((sum, p) => sum + (Number(p?.qty) || 0), 0);
      const totalWeightKg = v.pallets.reduce(
        (sum, p) => sum + (Number(p?.weight || p?.weightKg) || 0) * (Number(p?.qty) || 0),
        0
      );
      setTotalUnits(totalUnits);
      setTotalWeightKg(totalWeightKg);

      try {
        const isInternalGB =
          isGB(from) && isGB(to) && !isNI(from) && !isNI(to) && !isROI(from) && !isROI(to);

        const route = await resolveRoute({
          from,
          to,
          allowFerries: v.requirements?.allowFerries ?? true,
          travelMode: v.requirements?.travelMode || 'truck',
          isInternal: isInternalGB,
        });

        const q = await calculateQuote({
          pallets: v.pallets,
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

        setRouteInfo(route);
        setQuote(q);
        setCustomsRequired(route.customsRequired);
      } catch (err) {
        console.error('❌ Quote error:', err);
        setRouteInfo(null);
        setQuote(null);
        setCustomsRequired(false);
      }
    }, 450),
    [getValues]
  );

  useEffect(() => {
    runCalc();
  }, [collectionPoints, deliveryPoints, JSON.stringify(pallets), id]);

  const handleSave = async () => {
    try {
      const v = getValues();

      const payload = {
        updated_at: new Date().toISOString(),
        total_weight_kg: totalWeightKg,
        total_units: totalUnits,
        vehicle: quote?.vehicle || null,
        road_miles: routeInfo?.roadMiles || 0,
        ferry_miles: routeInfo?.ferryMiles || 0,
        total_miles: routeInfo?.totalMiles || 0,
        customs_required: customsRequired,
        vat_applied: quote?.vatApplied || false,
        vat_amount: quote?.vatAmount || 0,
        total_ex_vat: quote?.totalExVat || 0,
        total_inc_vat: quote?.totalIncVat || 0,

        collectionpoints: JSON.stringify(v.collectionPoints),
        deliverypoints: JSON.stringify(v.deliveryPoints),
        pallets: JSON.stringify(v.pallets),

        assigneduser: v.assignedUser || null,
        consignmentref: v.consignmentRef || null,
        goodsdescription: v.goodsDescription || null,
        sender_eori: v.senderEori || null,
        receiver_eori: v.receiverEori || null,
      };

      const { error } = await supabase.from('bookings').update(payload).eq('id', id);
      if (error) throw error;

      setConfirmation('✅ Booking updated.');
    } catch (e) {
      console.error(e);
      alert(`❌ Update failed: ${e.message}`);
    }
  };

  const steps = useMemo(() => {
    const baseSteps = [
      { title: 'Points', content: <PointInputs /> },
      { title: 'Consignment', content: <ConsignmentDetails bookingId={id} /> },
      { title: 'Requirements', content: <Requirements /> },
      {
        title: 'Assign User',
        content: (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Assign booking to a user</h3>
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
    ];

    if (customsRequired) {
      baseSteps.push({
        title: 'Customs',
        content: (
          <div>
            <p style={{ color: '#9ee' }}>
              This route crosses GB/IE — please upload customs documents and EORI details.
            </p>
            <CustomsSlide bookingId={id} />
          </div>
        ),
      });
    }

    baseSteps.push({
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
    });

    return baseSteps;
  }, [customsRequired, quote, routeInfo, pallets, totalUnits, totalWeightKg, users, assignedUser, id, setValue]);

  return (
    <SuperAdminLayout>
      <div className={styles.pageWrap}>
        <div className={styles.wizard}>
          <h2 className={styles.pageTitle}>✏️ Edit Booking</h2>
          {confirmation && <p style={{ color: 'lime', marginBottom: '1rem' }}>{confirmation}</p>}
          {loading ? (
            <p>Loading booking...</p>
          ) : (
            <div className={styles.panel}>
              <FormProvider {...methods}>
                <BookingStepper
                  steps={steps}
                  currentStep={step}
                  setCurrentStep={setStep}
                  routeInfo={routeInfo}
                  setRouteInfo={setRouteInfo}
                  onSave={handleSave}
                />
              </FormProvider>
            </div>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
}
