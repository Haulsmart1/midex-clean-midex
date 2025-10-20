'use client';

import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

import { supabase } from "@/lib/supabaseClient";
import PointInputs from "@/components/common/PointInputs";
import  calculateQuote  from "@/utils/pricingEngine"; // ✅ Make sure this file exists
import { resolveRoute } from "@/utils/resolveRoute";
import { normalizePostcode } from "@/utils/normalizePostcode";
import ForwarderLayout from "@/components/layouts/ForwarderLayout";
import styles from "@/styles/ForwarderDashboard.module.css";

// Dynamic imports for performance
const BookingStepper = dynamic(() => import("@/components/forwarder/BookingStepper"), { ssr: false });
const ConsignmentDetails = dynamic(() => import("@/components/forwarder/ConsignmentDetails"), { ssr: false });
const Requirements = dynamic(() => import("@/components/forwarder/Requirements"), { ssr: false });
const BookingReviewSlide = dynamic(() => import("@/components/common/BookingReview"), { ssr: false });
const CustomsSlide = dynamic(() => import("@/components/common/CustomsSlide"), { ssr: false });

export default function CreateBooking() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const accountType = session?.user?.account_type || "cash";
  const userId = session?.user?.id || session?.user?.sub || "";

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [breakdown, setBreakdown] = useState({});
  const [routeInfo, setRouteInfo] = useState(null);
  const [bookingId, setBookingId] = useState(null);

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
      commodityCodes: [],
      senderEori: "",
      receiverEori: "",
      podFile: null,
    },
  });

  const { watch, getValues, setValue } = methods;

  // ✅ Set Supabase session for row-level security (RLS) file uploads
  useEffect(() => {
    if (session?.user?.supabaseAccessToken) {
      supabase.auth.setSession({
        access_token: session.user.supabaseAccessToken,
        refresh_token: null,
      });
    }
  }, [session?.user?.supabaseAccessToken]);

  // ✅ Create draft booking in Supabase once on first render
  useEffect(() => {
    if (!session?.user?.email || bookingId || !userId) return;

    (async () => {
      const { data, error } = await supabase
        .from("bookings")
        .insert([{ user_id: userId, status: "draft", pallets: [] }])
        .select("id")
        .single();

      if (error) {
        console.error("❌ Error creating draft booking:", error);
        setError("❌ Could not create draft booking.");
        return;
      }

      if (data?.id) setBookingId(data.id);
    })();
  }, [session?.user?.email, bookingId, userId]);

  // ✅ Watch form changes and update quote
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

      const quote = calculateQuote({
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

      setBreakdown({
        ...quote,
        milesToDepotA,
        milesFromDepotB,
        customsRequired: route.customsRequired,
      });
    });

    return () => sub?.unsubscribe?.();
  }, [watch]);

  // ✅ Save final booking to Supabase
  const onSave = async () => {
    if (!bookingId) return;
    const values = getValues();

    const payload = {
      pallets: values.pallets || [],
      collections: values.collectionPoints || [],
      deliveries: values.deliveryPoints || [],
      customs_files: values.customsFiles || {},
      commodity_codes: values.commodityCodes || [],
      sender_eori: values.senderEori || null,
      receiver_eori: values.receiverEori || null,
      pod_url: typeof values.podFile === "string" ? values.podFile : null,
      total_cost: breakdown.totalCost ?? 0,
      account_type: accountType,
      status: accountType === "credit" ? "pending_approval" : "pending_payment",
    };

    console.log("🚀 Saving booking", bookingId, payload);

    const { error } = await supabase
      .from("bookings")
      .update(payload)
      .eq("id", bookingId);

    if (error) {
      console.error("❌ Supabase save error:", error);
      setError(`❌ Failed to save booking: ${error.message}`);
      return;
    }

    router.push(`/dashboard/forwarder/bookings`);
  };

  if (status === "loading") return <div>Loading...</div>;

  return (
    <ForwarderLayout>
      <div className="container py-4 text-white">
        <h1 className={styles.dashboardTitle}>🚚 Create Booking</h1>
        {error && <div className="alert alert-danger">{error}</div>}

        <FormProvider {...methods}>
          <div className="stepper-container">
            <BookingStepper
              steps={[
                { title: "Points", content: <PointInputs /> },
                {
                  title: "Consignment",
                  content: <ConsignmentDetails bookingId={bookingId} session={session} />,
                },
                { title: "Requirements", content: <Requirements /> },
                ...(breakdown.customsRequired
                  ? [{
                      title: "Customs Documents",
                      content: (
                        <CustomsSlide
                          bookingId={bookingId}
                          session={session}
                          setValue={setValue}
                        />
                      ),
                    }]
                  : []),
                {
                  title: "Review & Final Cost",
                  content: (
                    <BookingReviewSlide
                      quote={breakdown}
                      routeInfo={routeInfo}
                      originalBreakdown={{}}
                    />
                  ),
                },
              ]}
              currentStep={step}
              setCurrentStep={setStep}
              onSave={onSave}
            />
          </div>
        </FormProvider>
      </div>
    </ForwarderLayout>
  );
}
