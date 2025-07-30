'use client';
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import CustomsUpload from "@/components/common/CustomsUpload";

export default function CustomsSlide({ uploadStatus = {}, onUpload, uploading = false, disabled = false }) {
  const { getValues, setValue, watch } = useFormContext();
  const [commodityInput, setCommodityInput] = useState("");

  const customsValues = watch();

  const customsReady =
    customsValues?.customsFiles?.invoice?.url &&
    customsValues?.customsFiles?.packing?.url &&
    customsValues?.customsFiles?.delivery?.url &&
    customsValues?.senderEori &&
    customsValues?.receiverEori &&
    Array.isArray(customsValues?.commodityCodes) &&
    customsValues.commodityCodes.length > 0 &&
    !uploading;

  const addCommodityCode = () => {
    if (!commodityInput) return;
    const current = getValues("commodityCodes") || [];
    if (current.includes(commodityInput)) return;
    setValue("commodityCodes", [...current, commodityInput], { shouldDirty: true });
    setCommodityInput("");
  };

  const removeCommodityCode = (code) => {
    const current = getValues("commodityCodes") || [];
    setValue("commodityCodes", current.filter(c => c !== code), { shouldDirty: true });
  };

  return (
    <div className="neon-card customs-upload-container" style={{ marginBottom: 36 }}>
      <h5 style={{ color: "#09e5fa", marginBottom: 18, fontWeight: 600 }}>Customs Documents & Data</h5>

      {/* Uploads with neon buttons */}
      {["invoice", "packing", "delivery"].map((type) => (
        <div className="mb-3" key={type}>
          <label style={{ fontWeight: 500, fontSize: 15 }}>
            {type.charAt(0).toUpperCase() + type.slice(1)} Document <span style={{ color: "#0af" }}>*</span>
          </label>
          <CustomsUpload
            value={customsValues?.customsFiles?.[type] || {}}
            setValue={(key, val) => {
              const current = getValues("customsFiles") || {};
              setValue("customsFiles", { ...current, [type]: val }, { shouldDirty: true });
            }}
            field={type}
            label={`Upload ${type}`}
          />
        </div>
      ))}

      {/* EORI fields */}
      <div className="mb-3">
        <label>Sender EORI <span style={{ color: "#0af" }}>*</span></label>
        <input
          className="form-control"
          value={customsValues.senderEori || ""}
          onChange={e => setValue("senderEori", e.target.value, { shouldDirty: true })}
          disabled={disabled}
        />
      </div>
      <div className="mb-3">
        <label>Receiver EORI/XORI <span style={{ color: "#0af" }}>*</span></label>
        <input
          className="form-control"
          value={customsValues.receiverEori || ""}
          onChange={e => setValue("receiverEori", e.target.value, { shouldDirty: true })}
          disabled={disabled}
        />
      </div>

      {/* Commodity codes */}
      <div className="mb-3">
        <label>Commodity Codes <span style={{ color: "#0af" }}>*</span></label>
        <div className="d-flex mb-2" style={{ gap: 6 }}>
          <input
            className="form-control"
            value={commodityInput}
            onChange={e => setCommodityInput(e.target.value.toUpperCase())}
            placeholder="Add code"
            disabled={disabled}
            style={{ maxWidth: 160 }}
          />
          <button type="button" className="btn btn-gradient-primary" disabled={disabled} onClick={addCommodityCode}>Add</button>
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
  );
}
