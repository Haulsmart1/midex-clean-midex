"use client";

import React, { useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import supabase from "@/lib/supabaseClient";
import { adrClasses, palletTypes } from "@/components/common/bookingConstants";
import styles from "@/styles/ConsignmentDetails.module.css";

// 🔧 Direct upload to Supabase (no helper)
async function handleDirectUpload(file, path, bucket = "files") {
  if (!file || !path) {
    alert("Missing file or path");
    return null;
  }

  const flatPath = path.replace(/\//g, "_") + "__" + file.name;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(flatPath, file, {
      upsert: true,
      cacheControl: "3600",
    });

  if (error) {
    console.error("❌ Supabase upload error:", error);
    alert("Upload failed: " + error.message);
    return null;
  }

  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(flatPath);

  return publicData?.publicUrl || null;
}

export default function ConsignmentDetails({ bookingId }) {
  const {
    control,
    register,
    setValue,
    watch,
    trigger,
    unregister,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({ control, name: "pallets" });
  const pallets = watch("pallets") || [];

  useEffect(() => {
    pallets.forEach((pallet, idx) => {
      if (!pallet?.adr) {
        unregister(`pallets.${idx}.adrClass`);
        unregister(`pallets.${idx}.adrFileUrl`);
      }
    });
  }, [pallets, unregister]);

  const handleAddPallet = () => {
    append({
      type: "",
      length: "",
      width: "",
      height: "",
      weight: "",
      adr: false,
      adrClass: "",
      adrFileUrl: "",
      deliveryNoteUrl: "",
    });
  };

  return (
    <div className={styles.consignmentContainer}>
      <h2 className="text-light mb-4">📦 Consignment Details</h2>

      {fields.map((field, idx) => {
        const pallet = pallets[idx] || {};

        return (
          <div key={field.id} className={styles.palletCard}>
            <div style={{ fontSize: "0.8em", color: "#0ff", marginBottom: 5 }}>
              Booking ID: {bookingId || "❌ Not set"}
            </div>

            {/* 📋 Type */}
            <div className="booking-form-group mb-3">
              <label>📋 Type*</label>
              <select
                {...register(`pallets.${idx}.type`, { required: "Type is required" })}
                value={pallet.type || ""}
                onChange={(e) => setValue(`pallets.${idx}.type`, e.target.value, { shouldValidate: true })}
                className="form-control"
              >
                <option value="">Select</option>
                {palletTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.pallets?.[idx]?.type && (
                <span className="text-danger">{errors.pallets[idx].type.message}</span>
              )}
            </div>

            {/* 📏 Dimensions */}
            <div className="booking-form-group d-flex flex-wrap align-items-end mb-3" style={{ gap: 18 }}>
              {["length", "width", "height", "weight"].map((dim) => (
                <div key={dim}>
                  <label>
                    {dim.charAt(0).toUpperCase() + dim.slice(1)} ({dim === "weight" ? "kg" : "cm"})*
                  </label>
                  <input
                    type="number"
                    min={0}
                    {...register(`pallets.${idx}.${dim}`, { required: `${dim} is required` })}
                    value={pallet[dim] || ""}
                    onChange={(e) =>
                      setValue(`pallets.${idx}.${dim}`, e.target.value, { shouldValidate: true })
                    }
                    className="form-control"
                    placeholder={`e.g. ${dim === "weight" ? 400 : 120}`}
                    style={{ width: 110 }}
                  />
                  {errors.pallets?.[idx]?.[dim] && (
                    <span className="text-danger">{errors.pallets[idx][dim].message}</span>
                  )}
                </div>
              ))}
            </div>

            {/* ☣️ ADR Toggle */}
            <div className="booking-form-group mb-3" style={{ marginTop: 12 }}>
              <label style={{ color: "#ffe066" }}>☣️ ADR*</label>
              <div style={{ marginLeft: 14, display: "inline-block" }}>
                <label className={styles["neon-switch"]}>
                  <input
                    type="checkbox"
                    checked={!!pallet.adr}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setValue(`pallets.${idx}.adr`, checked, { shouldValidate: true });
                      if (!checked) {
                        setValue(`pallets.${idx}.adrClass`, "", { shouldValidate: true });
                        setValue(`pallets.${idx}.adrFileUrl`, "", { shouldValidate: true });
                      }
                      trigger();
                    }}
                  />
                  <span className={styles.slider}></span>
                </label>
                <span style={{ marginLeft: 12, color: "#ffe066", fontWeight: 700, fontSize: 17 }}>
                  {pallet.adr ? "Yes" : "No"}
                </span>
              </div>

              {/* ADR Class + Upload */}
              {pallet.adr && (
                <>
                  <label>ADR Class*</label>
                  <select
                    {...register(`pallets.${idx}.adrClass`, {
                      required: pallet.adr ? "ADR class required" : false,
                    })}
                    value={pallet.adrClass || ""}
                    onChange={(e) =>
                      setValue(`pallets.${idx}.adrClass`, e.target.value, { shouldValidate: true })
                    }
                    className="form-control"
                  >
                    <option value="">Select ADR Class</option>
                    {adrClasses.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>

                  <div className={styles.neonUploadWrapper}>
                    <input
                      id={`adrFile-${idx}`}
                      type="file"
                      accept=".pdf"
                      disabled={!bookingId}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file && bookingId) {
                          const url = await handleDirectUpload(file, `adr/pallet_${idx}/${bookingId}`);
                          if (url) {
                            setValue(`pallets.${idx}.adrFileUrl`, url, { shouldValidate: true });
                          }
                        }
                      }}
                      className={styles.neonUploadInput}
                    />
                    <label htmlFor={`adrFile-${idx}`} className={styles.neonUploadBtn}>☢️ Upload PDF</label>
                    <span className={styles.neonUploadFile}>
                      {pallet.adrFileUrl ? (
                        <a href={pallet.adrFileUrl} target="_blank" rel="noopener noreferrer">
                          {pallet.adrFileUrl.split("/").pop()}
                        </a>
                      ) : "No file chosen"}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* 📎 Delivery Note */}
            <div className="booking-form-group mt-2 mb-3">
              <label>Delivery Note (PDF)</label>
              <div className={styles.neonUploadWrapper}>
                <input
                  id={`deliveryNote-${idx}`}
                  type="file"
                  accept=".pdf"
                  disabled={!bookingId}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && bookingId) {
                      const url = await handleDirectUpload(file, `documents/pallet_${idx}/${bookingId}`);
                      if (url) {
                        setValue(`pallets.${idx}.deliveryNoteUrl`, url, { shouldValidate: true });
                      }
                    }
                  }}
                  className={styles.neonUploadInput}
                />
                <label htmlFor={`deliveryNote-${idx}`} className={styles.neonUploadBtn}>📎 Upload PDF</label>
                <span className={styles.neonUploadFile}>
                  {pallet.deliveryNoteUrl ? (
                    <a href={pallet.deliveryNoteUrl} target="_blank" rel="noopener noreferrer">
                      {pallet.deliveryNoteUrl.split("/").pop()}
                    </a>
                  ) : "No file chosen"}
                </span>
              </div>
            </div>

            {/* ❌ Remove */}
            <button
              type="button"
              className="btn btn-danger"
              style={{ marginTop: 18 }}
              onClick={() => remove(idx)}
            >
              🗑 Remove
            </button>
          </div>
        );
      })}

      <div className="mt-4">
        <button type="button" className="btn btn-primary" onClick={handleAddPallet}>
          ➕ Add Pallet
        </button>
      </div>
    </div>
  );
}

