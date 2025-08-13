'use client';

import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import BookingStepper from "@/components/users/BookingStepper";
import ConsignmentDetails from "@/components/users/ConsignmentDetails";
import PointInputs from "@/components/common/PointInputs";
import Requirements from "@/components/users/Requirements";
import BookingReviewSlide from '@/components/common/BookingReviewSlide';
import { calculateQuote } from '@/utils/rateConfig';
import { resolveRoute } from '@/utils/resolveRoute';
import { normalizePostcode } from "@/utils/normalizePostcode"; // ✅ FIXED QUOTES

import UsersLayout from "@/components/layouts/UsersLayout";

export default function EditUserBooking() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const supabase = getSupabaseClient(session?.user?.supabaseAccessToken);

  const [accountType, setAccountType] = useState('cash');
  const [hasPaid, setHasPaid] = useState(false);
  const [booking, setBooking] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadStatus, setUploadStatus] = useState({});
  const [breakdown, setBreakdown] = useState({});
  const [routeInfo, setRouteInfo] = useState(null);

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
      senderEori: "",
      receiverEori: "",
      commodityCodes: []
    },
  });
  const { watch, getValues, setValue, reset } = methods;
  const userId = session?.user?.id || "";

  useEffect(() => {
    if (!id || !session?.user?.email) return;
    (async () => {
      setLoading(true);
      const { data: userData } = await supabase
        .from('users')
        .select('account_type')
        .eq('id', userId)
        .maybeSingle();
      if (userData?.account_type) setAccountType(userData.account_type);

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      setLoading(false);
      if (error || !data) {
        setError("Could not find this booking.");
        return;
      }
      setBooking(data);
      setHasPaid(!!data.has_paid);
      reset({
        ...data,
        collectionPoints: data.collections || [],
        deliveryPoints: data.deliveries || [],
        customsFiles: {
          invoice: data.customs_invoice_url || null,
          packing: data.customs_packing_url || null,
          delivery: data.customs_delivery_url || null,
        },
        invoiceFileUrl: data.invoice_file_url || null,
        podFileUrl: data.pod_file_url || null,
        documentFileUrl: data.document_file_url || null,
        senderEori: data.sender_eori || "",
        receiverEori: data.receiver_eori || "",
        commodityCodes: data.commodity_codes || [],
      });
    })();
  }, [id, session?.user?.email, reset, userId, supabase]);

  const handleFileUploadToBucket = async ({ bucket, type, file, extraPath = "", valuePath }) => {
    setUploadStatus(s => ({ ...s, [type]: "Uploading..." }));
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `bookings/${id}/${extraPath}${type}_${Date.now()}_${safeFilename}`;
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
    };
    const { error } = await supabase.from("bookings").update(payload).eq("id", id);
    if (error) {
      setError("❌ Failed to save booking.");
      return;
    }
    router.push("/dashboard/user/bookings");
  };

  const handlePayNow = async () => {
    if (!booking || hasPaid || accountType !== "cash") return;
    const res = await fetch("/api/stripe/checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: booking.id, amount: booking.amount }),
    });
    const data = await res.json();
    if (data.id) {
      window.location.href = `https://checkout.stripe.com/pay/${data.id}`;
    } else {
      setError("Failed to create Stripe session.");
    }
  };

  if (status === "loading") return <div>Loading...</div>;

  return (
    <UsersLayout>
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <div style={{
          width: "100%",
          maxWidth: "900px",
          background: "rgba(20,24,38,0.98)",
          borderRadius: "1.5rem",
          boxShadow: "0 8px 36px 0 #0aefff28",
          padding: "2rem",
        }}>
          <h2 style={{ color: "#00d4ff", textAlign: "center", marginBottom: "2rem" }}>
            Edit Booking
          </h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <FormProvider {...methods}>
            <BookingStepper
              steps={[
                { title: "Points", content: <PointInputs /> },
                { title: "Consignment", content: (
                  <ConsignmentDetails
                    handleAdrFileUpload={(idx, file) =>
                      handleFileUploadToBucket({
                        bucket: "adrfiles",
                        type: `adr_${idx}`,
                        file,
                        valuePath: `pallets.${idx}.adrFileUrl`,
                        extraPath: `pallet${idx}_`
                      })
                    }
                    handleInvoiceUpload={(file) =>
                      handleFileUploadToBucket({
                        bucket: "invoices",
                        type: "invoice",
                        file,
                        valuePath: "invoiceFileUrl",
                      })
                    }
                    handlePodUpload={(file) =>
                      handleFileUploadToBucket({
                        bucket: "pods",
                        type: "pod",
                        file,
                        valuePath: "podFileUrl",
                      })
                    }
                    handleDocumentUpload={(file) =>
                      handleFileUploadToBucket({
                        bucket: "documents",
                        type: "document",
                        file,
                        valuePath: "documentFileUrl",
                      })
                    }
                    methods={methods}
                  />
                ) },
                { title: "Requirements", content: <Requirements /> },
                { title: "Review & Final Cost", content: (
                  <BookingReviewSlide quote={breakdown} routeInfo={routeInfo} originalBreakdown={{}} />
                )},
              ]}
              currentStep={step}
              setCurrentStep={setStep}
              onSave={onSave}
            />
          </FormProvider>
          {accountType === "cash" && !hasPaid && (
            <button
              className="btn btn-success mt-4"
              style={{ width: "100%", fontWeight: 700, fontSize: 18 }}
              onClick={handlePayNow}
              disabled={loading}
            >
              Pay Now
            </button>
          )}
        </div>
      </div>
    </UsersLayout>
  );
}
