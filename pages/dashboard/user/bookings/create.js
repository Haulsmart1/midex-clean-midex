'use client';

import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import UsersLayout from "@/components/layouts/UsersLayout";
import BookingStepper from "@/components/bookingusers/BookingStepper";
import ConsignmentDetails from "@/components/bookingusers/ConsignmentDetails";
import PointInputs from "@/components/common/PointInputs";
import Requirements from "@/components/bookingusers/Requirements";
import BookingReviewSlide from "@/components/common/BookingReviewSlide";
import { calculateQuote } from "@/utils/rateConfig";
import { resolveRoute } from "@/utils/resolveRoute";
import { normalizePostcode } from "@/utils/normalizePostcode";

export default function CreateUserBooking() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const supabase = getSupabaseClient(session?.user?.supabaseAccessToken);

  const accountType = session?.user?.account_type || "cash";
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
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
  const userId = session?.user?.id || "";

  // ===== File upload helper =====
  const handleFileUploadToBucket = async ({ bucket, type, file, extraPath = "", valuePath }) => {
    setUploadStatus(s => ({ ...s, [type]: "Uploading..." }));
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `bookings/${bookingId}/${extraPath}${type}_${Date.now()}_${safeFilename}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) {
      setUploadStatus(s => ({ ...s, [type]: `❌ ${error.message}` }));
      return;
    }
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    if (urlData?.publicUrl) {
      setValue(valuePath, urlData.publicUrl);
      setUploadStatus(s => ({ ...s, [type]: "✅ Uploaded!" }));
    }
  };

  const handleAdrFileUpload = (idx, file) =>
    handleFileUploadToBucket({
      bucket: "adrfiles",
      type: `adr_${idx}`,
      file,
      valuePath: `pallets.${idx}.adrFileUrl`,
      extraPath: `pallet${idx}_`
    });

  const handleInvoiceUpload = (file) =>
    handleFileUploadToBucket({
      bucket: "invoices",
      type: "invoice",
      file,
      valuePath: "invoiceFileUrl"
    });

  const handlePodUpload = (file) =>
    handleFileUploadToBucket({
      bucket: "pods",
      type: "pod",
      file,
      valuePath: "podFileUrl"
    });

  const handleDocumentUpload = (file) =>
    handleFileUploadToBucket({
      bucket: "documents",
      type: "document",
      file,
      valuePath: "documentFileUrl"
    });

  // ===== Create draft booking =====
  useEffect(() => {
    if (!session?.user?.email || bookingId || draftCreated || !userId) return;
    (async () => {
      const { data, error } = await supabase
        .from("bookings")
        .insert([{ user_id: userId, status: "draft", pallets: [] }])
        .select("id")
        .single();
      if (!error && data?.id) {
        setBookingId(data.id);
        setDraftCreated(true);
      }
    })();
  }, [session?.user?.email, bookingId, draftCreated, userId]);

  // ===== Quote & route calculation =====
  useEffect(() => {
    const sub = watch(async (values) => {
      const from = normalizePostcode(values.collectionPoints?.[0]?.postcode || "");
      const to = normalizePostcode(values.deliveryPoints?.[0]?.postcode || "");
      if (!from || !to) {
        setBreakdown({});
        setRouteInfo(null);
        return;
      }
      const route = await resolveRoute({ from, to });
      setRouteInfo(route);
      const milesToDepotA = route.legs?.[0]?.distanceMiles || 0;
      const milesFromDepotB = route.legs?.length > 2 ? route.legs[2]?.distanceMiles || 0 : 0;
      const quote = await calculateQuote({
        from,
        to,
        pallets: values.pallets,
        adr: values.pallets?.some(p => p.adr || p.adrClassSpecial) || false,
        forkliftPickup: values.forkliftPickup,
        forkliftDelivery: values.forkliftDelivery,
        milesToDepotA,
        milesFromDepotB,
        ferryRoute: route.ferryRoute,
      });
      setBreakdown({ ...quote, milesToDepotA, milesFromDepotB });
    });
    return () => sub.unsubscribe();
  }, [watch]);

  // ===== Save handler =====
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
      status: accountType === "credit" ? "pending_approval" : "pending_payment",
    };
    const { error } = await supabase.from("bookings").update(payload).eq("id", bookingId);
    if (error) {
      setError("❌ Failed to save booking.");
      return;
    }
    if (accountType === "cash") {
      const res = await fetch("/api/create-stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, amount: payload.amount }),
      });
      const data = await res.json();
      if (data?.id) {
        window.location = `https://checkout.stripe.com/pay/${data.id}`;
      }
    } else {
      router.push(`/dashboard/user/bookings`);
    }
  };

  const steps = [
    { title: "Points", content: <PointInputs /> },
    { title: "Consignment", content: (
      <ConsignmentDetails
        handleAdrFileUpload={handleAdrFileUpload}
        handleInvoiceUpload={handleInvoiceUpload}
        handlePodUpload={handlePodUpload}
        handleDocumentUpload={handleDocumentUpload}
        methods={methods}
      />
    )},
    { title: "Requirements", content: <Requirements /> },
    { title: "Review & Final Cost", content: (
      <BookingReviewSlide quote={breakdown} routeInfo={routeInfo} originalBreakdown={{}} />
    )},
  ];

  if (status === "loading") return <div>Loading...</div>;

  return (
    <UsersLayout>
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <div
          style={{
            width: "100%",
            maxWidth: "900px",
            background: "rgba(20,24,38,0.98)",
            borderRadius: "1.5rem",
            boxShadow: "0 8px 36px 0 #0aefff28",
            padding: "2rem",
          }}
        >
          <h2 style={{ color: "#00d4ff", textAlign: "center", marginBottom: "2rem" }}>
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

