'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import { normalizePostcode } from '@/utils/normalizePostcode';
import  calculateQuote  from '@/utils/pricingEngine';
import { resolveRoute } from '@/utils/resolveRoute';
import { supabase } from '@/lib/supabaseClient';
import UsersLayout from '@/components/layouts/UsersLayout';

// Dynamically imported components
const BookingStepper = dynamic(() => import('@/components/users/BookingStepper'), { ssr: false });
const PointInputs = dynamic(() => import('@/components/common/PointInputs'), { ssr: false });
const Requirements = dynamic(() => import('@/components/users/Requirements'), { ssr: false });
const ConsignmentDetails = dynamic(() => import('@/components/users/ConsignmentDetails'), { ssr: false });
const BookingReviewSlide = dynamic(() => import('@/components/common/BookingReview'), { ssr: false });

export default function CreateUserBooking() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const accountType = session?.user?.account_type || 'cash';

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState({});
  const [breakdown, setBreakdown] = useState({});
  const [routeInfo, setRouteInfo] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [draftCreated, setDraftCreated] = useState(false);

  const methods = useForm({
    defaultValues: {
      pallets: [],
      collectionPoints: [],
      deliveryPoints: [],
      forkliftPickup: false,
      forkliftDelivery: false,
      tailLiftPickup: false,
      tailLiftDelivery: false,
      customsFiles: { invoice: null, packing: null, delivery: null },
      invoiceFileUrl: null,
      podFileUrl: null,
      documentFileUrl: null,
    },
  });

  const { watch, getValues, setValue } = methods;
  const userId = session?.user?.id || '';

  // Auto-create draft booking
  useEffect(() => {
    if (status !== 'authenticated' || !userId || bookingId || draftCreated) return;

    (async () => {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{ user_id: userId, status: 'draft', pallets: [] }])
        .select('id')
        .single();

      if (error) {
        console.error('❌ Failed to create draft booking:', error.message || error);
        setError('Could not create draft booking.');
        return;
      }

      if (data?.id) {
        setBookingId(data.id);
        setDraftCreated(true);
      }
    })();
  }, [status, userId, bookingId, draftCreated]);

  // Watch form changes and calculate quotes
  useEffect(() => {
    const sub = watch(async (values) => {
      const from = normalizePostcode(values.collectionPoints?.[0]?.postcode || '');
      const to = normalizePostcode(values.deliveryPoints?.[0]?.postcode || '');

      if (!from || !to) {
        setBreakdown({});
        setRouteInfo(null);
        return;
      }

      const route = await resolveRoute({ from, to });
      setRouteInfo(route);

      const milesToDepotA = route.legs?.[0]?.distanceMiles || 0;
      const milesFromDepotB = route.legs?.[2]?.distanceMiles || 0;

      const quote = await calculateQuote({
        from,
        to,
        pallets: values.pallets,
        adr: values.pallets?.some(p => p.adr || p.adrClassSpecial),
        forkliftPickup: values.forkliftPickup,
        forkliftDelivery: values.forkliftDelivery,
        milesToDepotA,
        milesFromDepotB,
        ferryRoute: route.ferryRoute,
      });

      setBreakdown({ ...quote, milesToDepotA, milesFromDepotB });
    });

    return () => sub.unsubscribe?.();
  }, [watch]);

  // File upload handler
  const handleFileUploadToBucket = async ({ bucket, type, file, extraPath = '', valuePath }) => {
    setUploadStatus((s) => ({ ...s, [type]: 'Uploading...' }));

    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `bookings/${bookingId}/${extraPath}${type}_${Date.now()}_${safeFilename}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) {
      setUploadStatus((s) => ({ ...s, [type]: `❌ ${error.message}` }));
      return;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    if (urlData?.publicUrl) {
      setValue(valuePath, urlData.publicUrl);
      setUploadStatus((s) => ({ ...s, [type]: '✅ Uploaded!' }));
    }
  };

  // File-specific wrappers
  const handleAdrFileUpload = (idx, file) =>
    handleFileUploadToBucket({
      bucket: 'adrfiles',
      type: `adr_${idx}`,
      file,
      valuePath: `pallets.${idx}.adrFileUrl`,
      extraPath: `pallet${idx}_`,
    });

  const handleInvoiceUpload = (file) =>
    handleFileUploadToBucket({ bucket: 'invoices', type: 'invoice', file, valuePath: 'invoiceFileUrl' });

  const handlePodUpload = (file) =>
    handleFileUploadToBucket({ bucket: 'pods', type: 'pod', file, valuePath: 'podFileUrl' });

  const handleDocumentUpload = (file) =>
    handleFileUploadToBucket({ bucket: 'documents', type: 'document', file, valuePath: 'documentFileUrl' });

  // Final submit
  const onSave = async () => {
    const values = getValues();
    const payload = {
      pallets: values.pallets,
      adr: values.pallets?.some(p => p.adr || p.adrClassSpecial) || false,
      forklift_pickup: values.forkliftPickup,
      forklift_delivery: values.forkliftDelivery,
      tail_lift_pickup: values.tailLiftPickup,
      tail_lift_delivery: values.tailLiftDelivery,
      collections: values.collectionPoints,
      deliveries: values.deliveryPoints,
      total_cost: breakdown.totalCost ?? 0,
      amount: breakdown.totalCost ?? 0,
      account_type: accountType,
      status: accountType === 'credit' ? 'pending_approval' : 'pending_payment',
    };

    const { error } = await supabase.from('bookings').update(payload).eq('id', bookingId);
    if (error) {
      setError('❌ Failed to save booking.');
      return;
    }

    if (accountType === 'cash') {
      const res = await fetch('/api/create-stripe-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, amount: payload.amount }),
      });

      const data = await res.json();
      if (data?.id) {
        window.location = `https://checkout.stripe.com/pay/${data.id}`;
      }
    } else {
      router.push('/dashboard/user/bookings');
    }
  };

  // Stepper config
  const steps = [
    { title: 'Points', content: <PointInputs /> },
    {
      title: 'Consignment',
      content: (
        <ConsignmentDetails
          handleAdrFileUpload={handleAdrFileUpload}
          handleInvoiceUpload={handleInvoiceUpload}
          handlePodUpload={handlePodUpload}
          handleDocumentUpload={handleDocumentUpload}
          methods={methods}
        />
      ),
    },
    { title: 'Requirements', content: <Requirements /> },
    {
      title: 'Review & Final Cost',
      content: <BookingReviewSlide quote={breakdown} routeInfo={routeInfo} originalBreakdown={{}} />,
    },
  ];

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <UsersLayout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '900px',
            background: 'rgba(20,24,38,0.98)',
            borderRadius: '1.5rem',
            boxShadow: '0 8px 36px 0 #0aefff28',
            padding: '2rem',
          }}
        >
          <h2 style={{ color: '#00d4ff', textAlign: 'center', marginBottom: '2rem' }}>
            Create Booking
          </h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <FormProvider {...methods}>
            <BookingStepper
              steps={steps}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              onSave={onSave}
            />
          </FormProvider>
        </div>
      </div>
    </UsersLayout>
  );
}

