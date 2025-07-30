'use client';
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import RequireForwarder from "@/components/RequireForwarder";
import BookingStepper from "@/components/forwarder/BookingStepper";
import ConsignmentDetails from "@/components/forwarder/ConsignmentDetails";
import PointInputs from "@/components/common/PointInputs";
import Requirements from "@/components/forwarder/Requirements";
import BookingReviewSlide from '@/components/common/BookingReviewSlide';
import { calculateQuote } from '@/utils/rateConfig';
import { resolveRoute } from '@/utils/resolveRoute';
import { normalizePostcode } from '@/utils/normalizePostcode';

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard/forwarder", icon: "bi bi-house" },
  { label: "All Bookings", href: "/dashboard/forwarder/bookings", icon: "bi bi-truck" },
  { label: "Create Booking", href: "/dashboard/forwarder/bookings/create", icon: "bi bi-plus-circle" },
];

function isForwarder(sessionUser) {
  return sessionUser?.role === "forwarder" || sessionUser?.roles?.includes("forwarder");
}

export default function CreateBooking() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const supabase = getSupabaseClient(session?.user?.supabaseAccessToken);

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadStatus, setUploadStatus] = useState({});
  const [breakdown, setBreakdown] = useState({});
  const [routeInfo, setRouteInfo] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [draftCreated, setDraftCreated] = useState(false);
  const [customsUploading, setCustomsUploading] = useState(false);
  const [commodityInput, setCommodityInput] = useState("");

  const methods = useForm({
    defaultValues: {
      pallets: [], collectionPoints: [], deliveryPoints: [],
      forkliftPickup: false, forkliftDelivery: false,
      tailLiftPickup: false, tailLiftDelivery: false,
      customsFiles: { invoice: null, packing: null, delivery: null },
      invoiceFileUrl: null, podFileUrl: null, documentFileUrl: null,
      senderEori: "", receiverEori: "", commodityCodes: []
    },
  });

  const { watch, getValues, setValue } = methods;
  const userId = session?.user?.sub || session?.user?.id || session?.user?.user_id || session?.user?.uid || "";

  function getUserIdOrThrow() {
    if (!userId) throw new Error("Could not determine your authenticated user id (auth.uid()). Please relogin.");
    return userId;
  }

  // ----------- Supabase, file upload, draft booking logic unchanged -----------
  async function ensureForwarderRowExistsAndGetId(sessionUser) {
    const safeUserId = getUserIdOrThrow();
    const email = sessionUser?.email;
    const name = sessionUser.name || email;
    const { data: byId } = await supabase.from("users").select("id, role").eq("id", safeUserId).maybeSingle();
    if (byId?.id) {
      if (byId.role !== 'forwarder') {
        await supabase.from("users").update({ role: 'forwarder' }).eq("id", safeUserId);
      }
      return byId.id;
    }
    const { data: byEmail } = await supabase.from("users").select("id, role").eq("email", email).maybeSingle();
    if (byEmail?.id) {
      if (byEmail.role !== 'forwarder') {
        await supabase.from("users").update({ role: 'forwarder' }).eq("id", byEmail.id);
      }
      return byEmail.id;
    }
    const { data: inserted, error: insertErr } = await supabase.from("users").insert([{ id: safeUserId, email, name, role: 'forwarder' }]).select("id").single();
    if (insertErr) throw new Error("Insert failed: " + insertErr.message);
    return inserted.id;
  }

  const handleFileUploadToBucket = async ({
    bucket, type, file, bookingId, userId = "", extraPath = "", setUploadStatus, setValue, valuePath
  }) => {
    if (setUploadStatus) setUploadStatus(s => ({ ...s, [type]: "Uploading..." }));
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `bookings/${bookingId}/${extraPath}${type}_${Date.now()}_${safeFilename}`;
    try {
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) {
        if (setUploadStatus) setUploadStatus(s => ({ ...s, [type]: `❌ Upload error: ${error.message}` }));
        return { error };
      }
      const { data: urlData, error: urlError } = supabase.storage.from(bucket).getPublicUrl(path);
      if (urlError || !urlData?.publicUrl) {
        if (setUploadStatus) setUploadStatus(s => ({ ...s, [type]: `❌ Public URL error: ${urlError?.message || "Unknown"}` }));
        return { error: urlError };
      }
      if (setUploadStatus) setUploadStatus(s => ({ ...s, [type]: "✅ Uploaded!" }));
      if (setValue && valuePath) setValue(valuePath, urlData.publicUrl);
      return { url: urlData.publicUrl };
    } catch (err) {
      if (setUploadStatus) setUploadStatus(s => ({ ...s, [type]: `❌ JS error: ${err.message}` }));
      return { error: err };
    }
  };

  const handleCustomsUpload = async (type, file) => {
    if (!bookingId) { setError("No booking ID for upload!"); return; }
    if (!session?.user?.supabaseAccessToken) { setError("You must be logged in to upload files."); return; }
    setCustomsUploading(true);
    await handleFileUploadToBucket({
      bucket: "customs",
      type,
      file,
      bookingId,
      userId,
      setUploadStatus,
      setValue: methods.setValue,
      valuePath: `customsFiles.${type}`,
    });
    setCustomsUploading(false);
  };

  const handleInvoiceUpload = (file) =>
    handleFileUploadToBucket({
      bucket: "invoices",
      type: "invoice",
      file,
      bookingId,
      userId,
      setUploadStatus,
      setValue: methods.setValue,
      valuePath: "invoiceFileUrl",
    });

  const handlePodUpload = (file) =>
    handleFileUploadToBucket({
      bucket: "pods",
      type: "pod",
      file,
      bookingId,
      userId,
      setUploadStatus,
      setValue: methods.setValue,
      valuePath: "podFileUrl",
    });

  const handleDocumentUpload = (file) =>
    handleFileUploadToBucket({
      bucket: "documents",
      type: "document",
      file,
      bookingId,
      userId,
      setUploadStatus,
      setValue: methods.setValue,
      valuePath: "documentFileUrl",
    });

  const handleAdrFileUpload = async (palletIdx, file) => {
    setValue(`pallets.${palletIdx}.adrFileUploading`, true);
    setValue(`pallets.${palletIdx}.adrFileError`, null);
    const { url, error } = await handleFileUploadToBucket({
      bucket: "adrfiles",
      type: "adr",
      file,
      bookingId,
      userId,
      setUploadStatus,
      setValue,
      valuePath: `pallets.${palletIdx}.adrFileUrl`,
      extraPath: `pallet${palletIdx}_`
    });
    setValue(`pallets.${palletIdx}.adrFileUploading`, false);
    setValue(`pallets.${palletIdx}.adrFileError`, error ? error.message : null);
  };

  // ---- Draft booking creation ----
  useEffect(() => {
    if (!session?.user?.email || bookingId || draftCreated || !userId) return;
    (async () => {
      setLoading(true);
      let usersTableId;
      try {
        usersTableId = await ensureForwarderRowExistsAndGetId(session.user);
      } catch (e) {
        setError("❌ " + e.message);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from("bookings").insert([{ user_id: usersTableId, status: "draft", pallets: [] }]).select("id").single();
      setLoading(false);
      if (error || !data?.id) {
        setError("❌ Failed to create draft booking. " + (error?.message || ""));
        return;
      }
      setBookingId(data.id);
      setDraftCreated(true);
    })();
  }, [session?.user?.email, bookingId, draftCreated, userId]);

  // ---- Quote & route calculation ----
  useEffect(() => {
    const sub = watch(async (values) => {
      try {
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
          adrClassSpecial: values.pallets?.some(p => p.adrClassSpecial) || false,
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
        });
      } catch (e) {
        setBreakdown({});
        setRouteInfo(null);
      }
    });
    return () => sub.unsubscribe();
  }, [watch]);

  // ---- Customs logic ----
  const hasFerry = !!routeInfo?.ferryRoute;
  const customsValues = methods.getValues();
  const customsReady =
    customsValues?.customsFiles?.invoice &&
    customsValues?.customsFiles?.packing &&
    customsValues?.customsFiles?.delivery &&
    customsValues?.senderEori &&
    customsValues?.receiverEori &&
    Array.isArray(customsValues?.commodityCodes) &&
    customsValues.commodityCodes.length > 0 &&
    !customsUploading;

  const addCommodityCode = () => {
    if (!commodityInput) return;
    const current = getValues("commodityCodes") || [];
    if (current.includes(commodityInput)) return;
    setValue("commodityCodes", [...current, commodityInput], { shouldDirty: true });
    setCommodityInput("");
  };
  const removeCommodityCode = code => {
    const current = getValues("commodityCodes") || [];
    setValue("commodityCodes", current.filter(c => c !== code), { shouldDirty: true });
  };

  // ---- Save handler ----
  const onSave = async () => {
    setLoading(true);
    setError("");
    const values = getValues();
    for (const [idx, pallet] of (values.pallets || []).entries()) {
      if (pallet.adr && !pallet.adrFileUrl) {
        setError(`❌ ADR file missing for pallet #${idx + 1}`);
        setLoading(false);
        return;
      }
    }
    if (!bookingId) {
      setError("❌ No booking ID available to update!");
      setLoading(false);
      return;
    }
    const payload = {
      pallets: values.pallets,
      adr: values.pallets?.some(p => p.adr || p.adrClassSpecial) || false,
      adr_class_special: values.pallets?.some(p => p.adrClassSpecial) || false,
      forklift_pickup: !!values.forkliftPickup,
      forklift_delivery: !!values.forkliftDelivery,
      tail_lift_pickup: !!values.tailLiftPickup,
      tail_lift_delivery: !!values.tailLiftDelivery,
      collections: values.collectionPoints,
      deliveries: values.deliveryPoints,
      collection_cost: breakdown.collectionCost ?? 0,
      delivery_cost: breakdown.deliveryCost ?? 0,
      ferry_cost: breakdown.ferryCost ?? 0,
      customs_fee: breakdown.customsFee ?? 0,
      vat: breakdown.vat ?? 0,
      total_cost: breakdown.totalCost ?? 0,
      amount: breakdown.totalCost ?? 0,
      miles_to_depot_a: breakdown.milesToDepotA ?? 0,
      miles_from_depot_b: breakdown.milesFromDepotB ?? 0,
      distance_miles: (breakdown.milesToDepotA || 0) + (breakdown.milesFromDepotB || 0),
      vehicle_type: breakdown.vehicle,
      customs_invoice_url: values.customsFiles?.invoice,
      customs_packing_url: values.customsFiles?.packing,
      customs_delivery_url: values.customsFiles?.delivery,
      invoice_file_url: values.invoiceFileUrl,
      pod_file_url: values.podFileUrl,
      document_file_url: values.documentFileUrl,
      user_id: userId,
      sender_eori: values.senderEori || null,
      receiver_eori: values.receiverEori || null,
      commodity_codes: values.commodityCodes || [],
      status: 'pending',
    };
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) delete payload[key];
    });
    const { error: updateError } = await supabase
      .from("bookings")
      .update(payload)
      .eq("id", bookingId)
      .select("*");
    setLoading(false);
    if (updateError) {
      setError("❌ Failed to save: " + updateError.message);
      return;
    }
    router.push(`/dashboard/forwarder/bookings`);
  };

  // ---- Steps array (ALWAYS 5 STEPS, never dynamic) ----
  const steps = [
    { title: "Points", content: <PointInputs /> },
    {
      title: "Consignment",
      content: (
        <ConsignmentDetails
          handleAdrFileUpload={handleAdrFileUpload}
          handleInvoiceUpload={handleInvoiceUpload}
          handlePodUpload={handlePodUpload}
          handleDocumentUpload={handleDocumentUpload}
          methods={methods}
        />
      )
    },
    { title: "Requirements", content: <Requirements /> },
    {
      title: "Customs",
      content: hasFerry ? (
        <div className="neon-card customs-upload-container" style={{ marginBottom: 36 }}>
          <h5 style={{ color: "#09e5fa", marginBottom: 18, fontWeight: 600 }}>Customs Documents & Data</h5>
          {["invoice", "packing", "delivery"].map(type => (
            <div className="mb-3" key={type}>
              <label style={{ fontWeight: 500, fontSize: 15 }}>
                {type.charAt(0).toUpperCase() + type.slice(1)} Document <span style={{ color: "#0af" }}>*</span>
              </label>
              <br />
              <input
                type="file"
                accept="application/pdf,image/*"
                disabled={!bookingId || !session?.user?.supabaseAccessToken || customsUploading}
                onChange={e => e.target.files[0] && handleCustomsUpload(type, e.target.files[0])}
                style={{ marginBottom: 4 }}
              />
              {!bookingId && (
                <div style={{ color: "red", fontSize: 13 }}>
                  Booking must be created first before uploading files.
                </div>
              )}
              <div style={{ fontSize: 12, color: "#0af" }}>{uploadStatus[type]}</div>
              {methods.getValues(`customsFiles.${type}`) && (
                <a href={methods.getValues(`customsFiles.${type}`)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13 }}>
                  View uploaded {type}
                </a>
              )}
            </div>
          ))}
          <div className="mb-3">
            <label>Sender EORI <span style={{ color: "#0af" }}>*</span></label>
            <input
              className="form-control"
              value={customsValues.senderEori || ""}
              onChange={e => setValue("senderEori", e.target.value, { shouldDirty: true })}
            />
          </div>
          <div className="mb-3">
            <label>Receiver EORI/XORI <span style={{ color: "#0af" }}>*</span></label>
            <input
              className="form-control"
              value={customsValues.receiverEori || ""}
              onChange={e => setValue("receiverEori", e.target.value, { shouldDirty: true })}
            />
          </div>
          <div className="mb-3">
            <label>Commodity Codes <span style={{ color: "#0af" }}>*</span></label>
            <div className="d-flex mb-2" style={{ gap: 6 }}>
              <input
                className="form-control"
                value={commodityInput}
                onChange={e => setCommodityInput(e.target.value.toUpperCase())}
                placeholder="Add code"
                style={{ maxWidth: 160 }}
              />
              <button type="button" className="btn btn-gradient-primary" onClick={addCommodityCode}>Add</button>
            </div>
            <div>
              {(customsValues.commodityCodes || []).map(code => (
                <span key={code} className="badge rounded-pill bg-info text-dark me-2" style={{ fontSize: 15 }}>
                  {code} <span style={{ cursor: "pointer" }} onClick={() => removeCommodityCode(code)}>✕</span>
                </span>
              ))}
            </div>
          </div>
          {!customsReady && (
            <div style={{ color: "#fb4141", fontWeight: 600, fontSize: 14 }}>
              Please upload all files, fill EORI fields and add at least one commodity code to continue.
            </div>
          )}
        </div>
      ) : (
        <div style={{ color: "#0af", textAlign: "center", fontWeight: 600, marginTop: 40 }}>
          No customs required for this route.
        </div>
      )
    },
    {
      title: "Review & Final Cost",
      content: (
        <BookingReviewSlide
          quote={breakdown}
          routeInfo={routeInfo}
          originalBreakdown={{}}
        />
      )
    }
  ];

  // -------- Stepper navigation logic (skip customs if not needed) --------
  const handleNext = () => {
    let nextStep = currentStep + 1;
    // If going to customs and not needed, skip
    if (steps[nextStep]?.title === "Customs" && !hasFerry) nextStep += 1;
    setCurrentStep(Math.min(nextStep, steps.length - 1));
  };
  const handleBack = () => {
    let prevStep = currentStep - 1;
    // If coming back to customs and not needed, skip
    if (steps[prevStep]?.title === "Customs" && !hasFerry) prevStep -= 1;
    setCurrentStep(Math.max(prevStep, 0));
  };

  // ---- Page guards ----
  if (status === "loading") return <div>Loading session...</div>;
  if (!session?.user?.email) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"
      }}>
        <h2>Please log in to create a booking</h2>
        <a href="/login" className="btn btn-gradient-primary mt-4">Go to Login</a>
      </div>
    );
  }
  if (!isForwarder(session.user)) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"
      }}>
        <h2>Not authorized as forwarder.</h2>
        <a href="/dashboard" className="btn btn-gradient-primary mt-4">Back to dashboard</a>
      </div>
    );
  }

  // ---- Main render ----
  return (
    <div className="d-flex" style={{
      background: "linear-gradient(120deg, #131720 60%, #0a0f14 100%)",
      minHeight: "100vh", overflow: "hidden"
    }}>
      {/* SIDEBAR */}
      <div style={{
        minWidth: 220, background: "rgba(23,32,41, 0.96)",
        boxShadow: "2px 0 20px #05101f60", borderRadius: "0 2.5rem 2.5rem 0",
        margin: "2.2rem 0 2.2rem 1.4rem", padding: "2.5rem 1.5rem 2.5rem 1rem",
        display: "flex", flexDirection: "column", alignItems: "flex-start", zIndex: 2
      }}>
        <h3 style={{ color: "#08e7fe", fontWeight: 700, marginBottom: 30 }}>
          <i className="bi bi-plus-circle"></i> Create Booking
        </h3>
        {sidebarLinks.map(link => (
          <a
            key={link.href}
            href={link.href}
            className="btn btn-gradient-primary mb-3 d-flex align-items-center"
            style={{
              width: "100%", fontWeight: 600, fontSize: "1.09em", borderRadius: 14,
              background: "linear-gradient(90deg, #01cfff 0%, #695afc 100%)",
              color: "#fff", boxShadow: "0 2px 16px #00b8f924"
            }}
          >
            <i className={link.icon + " me-2"} />
            {link.label}
          </a>
        ))}
      </div>
      {/* MAIN CARD CONTAINER FOR STEPS */}
      <div className="flex-grow-1 d-flex flex-column align-items-center" style={{
        minHeight: "calc(100vh - 48px)",
        padding: "3.2rem 0",
        position: "relative"
      }}>
        <div className="booking-card neon-card" style={{
          maxWidth: 780,
          width: "100%",
          margin: "0 auto",
          padding: "2.7rem 2.3rem 2.7rem 2.3rem",
          background: "rgba(20,24,38,0.98)",
          borderRadius: "2.5rem",
          position: "relative",
          boxShadow: "0 8px 36px 0 #0aefff28, 0 1.5px 4px #0002",
        }}>
          <h2 style={{
            color: "#00d4ff",
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: ".06em",
            textAlign: "center",
            marginBottom: 30,
            textShadow: "0 3px 12px #00294a88"
          }}>
            Create Booking
          </h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {loading ? (
            <div>Saving...</div>
          ) : (
            <FormProvider {...methods}>
              <BookingStepper
                steps={steps}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                onNext={handleNext}
                onBack={handleBack}
                onSave={onSave}
                buttonProps={{
                  className: "btn btn-gradient-primary mt-4",
                  disabled: (steps[currentStep]?.title === "Customs" && hasFerry && !customsReady)
                }}
              />
            </FormProvider>
          )}
        </div>
      </div>
    </div>
  );
}


