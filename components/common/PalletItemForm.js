import React, { useEffect } from "react";
import { adrClasses, palletTypes } from "./bookingConstants";
import { supabase } from "@/lib/supabaseClient";
import { useFormContext } from "react-hook-form";

async function uploadAdrFile(file, palletIdx, setValue) {
  if (!file) return;
  const { data, error } = await supabase.storage
    .from("adrfiles")
    .upload(`adr_${Date.now()}_${file.name}`, file);
  if (error) {
    alert("ADR Upload failed: " + error.message);
    return;
  }
  setValue(`pallets.${palletIdx}.adrFileUrl`, data.path, { shouldValidate: true });
}

async function uploadDeliveryNoteFile(file, palletIdx, setValue) {
  if (!file) return;
  const { data, error } = await supabase.storage
    .from("documents")
    .upload(`deliverynote_${Date.now()}_${file.name}`, file);
  if (error) {
    alert("Delivery Note upload failed: " + error.message);
    return;
  }
  setValue(`pallets.${palletIdx}.deliveryNoteUrl`, data.path, { shouldValidate: true });
}

export default function PalletItemForm({
  field,
  idx,
  register,
  setValue,
  errors,
  pallets,
  remove,
  collectionPoints = [],
  deliveryPoints = [],
}) {
  const { watch, trigger, unregister } = useFormContext();
  const pallet = watch(`pallets.${idx}`) || {};
  const supabaseBase = "https://YOUR-SUPABASE-URL/storage/v1/object/public/";

  // Unregister ADR fields when ADR toggle is off
  useEffect(() => {
    if (!pallet.adr) {
      unregister(`pallets.${idx}.adrClass`);
      unregister(`pallets.${idx}.adrFileUrl`);
    }
  }, [pallet.adr, idx, unregister]);

  return (
    <div className="booking-form-row" key={field.id}>
      {/* Pallet Type */}
      <div className="booking-form-group mb-3">
        <label>📋 Type*</label>
        <select
          {...register(`pallets.${idx}.type`, { required: "Type is required" })}
          value={pallet.type || ""}
          onChange={e => setValue(`pallets.${idx}.type`, e.target.value, { shouldValidate: true })}
          className="form-control neon-select"
        >
          <option value="">Select</option>
          {palletTypes.map((type) => (
            <option value={type} key={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.pallets?.[idx]?.type && (
          <span className="text-danger">{errors.pallets[idx].type.message}</span>
        )}
      </div>

      {/* Pallet Size */}
      <div className="booking-form-group d-flex flex-wrap gap-3 align-items-end mb-3" style={{ gap: 18 }}>
        <div>
          <label>Length (cm)*</label>
          <input
            type="number"
            min={0}
            {...register(`pallets.${idx}.length`, { required: "Length is required" })}
            value={pallet.length || ""}
            onChange={e => setValue(`pallets.${idx}.length`, e.target.value, { shouldValidate: true })}
            className="form-control"
            placeholder="e.g. 120"
            style={{ width: 110 }}
          />
          {errors.pallets?.[idx]?.length && (
            <span className="text-danger">{errors.pallets[idx].length.message}</span>
          )}
        </div>
        <div>
          <label>Width (cm)*</label>
          <input
            type="number"
            min={0}
            {...register(`pallets.${idx}.width`, { required: "Width is required" })}
            value={pallet.width || ""}
            onChange={e => setValue(`pallets.${idx}.width`, e.target.value, { shouldValidate: true })}
            className="form-control"
            placeholder="e.g. 100"
            style={{ width: 110 }}
          />
          {errors.pallets?.[idx]?.width && (
            <span className="text-danger">{errors.pallets[idx].width.message}</span>
          )}
        </div>
        <div>
          <label>Height (cm)*</label>
          <input
            type="number"
            min={0}
            {...register(`pallets.${idx}.height`, { required: "Height is required" })}
            value={pallet.height || ""}
            onChange={e => setValue(`pallets.${idx}.height`, e.target.value, { shouldValidate: true })}
            className="form-control"
            placeholder="e.g. 180"
            style={{ width: 110 }}
          />
          {errors.pallets?.[idx]?.height && (
            <span className="text-danger">{errors.pallets[idx].height.message}</span>
          )}
        </div>
        <div>
          <label>Weight (kg)*</label>
          <input
            type="number"
            min={0}
            {...register(`pallets.${idx}.weight`, { required: "Weight is required" })}
            value={pallet.weight || ""}
            onChange={e => setValue(`pallets.${idx}.weight`, e.target.value, { shouldValidate: true })}
            className="form-control"
            placeholder="e.g. 400"
            style={{ width: 110 }}
          />
          {errors.pallets?.[idx]?.weight && (
            <span className="text-danger">{errors.pallets[idx].weight.message}</span>
          )}
        </div>
      </div>

      {/* ADR Toggle + Class + Neon Upload */}
      <div className="booking-form-group mb-3" style={{ marginTop: 12 }}>
        <label style={{ color: "#ffe066" }}>☣️ ADR*</label>
        <div style={{ marginLeft: 14, display: "inline-block" }}>
          <label className="neon-switch">
            <input
              type="checkbox"
              checked={!!pallet.adr}
              onChange={e => {
                setValue(`pallets.${idx}.adr`, e.target.checked, { shouldValidate: true });
                if (!e.target.checked) {
                  setValue(`pallets.${idx}.adrClass`, "", { shouldValidate: true });
                  setValue(`pallets.${idx}.adrFileUrl`, "", { shouldValidate: true });
                }
                trigger();
              }}
            />
            <span className="slider"></span>
          </label>
          <span style={{
            marginLeft: 14,
            color: "#ffe066",
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: "1px",
            verticalAlign: "middle"
          }}>
            {pallet.adr ? "Yes" : "No"}
          </span>
        </div>
        {pallet.adr && (
          <div style={{ marginTop: 8 }}>
            <label>ADR Class*</label>
            <select
              {...register(`pallets.${idx}.adrClass`, {
                required: pallet.adr ? "ADR class required" : false,
              })}
              value={pallet.adrClass || ""}
              onChange={e => setValue(`pallets.${idx}.adrClass`, e.target.value, { shouldValidate: true })}
              className="form-control neon-select"
              style={{
                background: "#21273a",
                color: "#0aefff",
                border: "1.7px solid #2dffef",
                borderRadius: 8,
                fontWeight: 700,
                padding: "6px 12px",
                marginBottom: 8,
                marginTop: 2,
                fontSize: 15,
              }}
            >
              <option value="">Select ADR Class</option>
              {adrClasses.map((c) => (
                <option value={c.value} key={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {["1", "7"].includes(pallet.adrClass) && (
              <div
                style={{
                  color: "#ffc800",
                  fontSize: 13,
                  marginBottom: 3,
                  fontWeight: 700,
                }}
              >
                ⚠️ Class {pallet.adrClass} is a special class and may incur extra cost!
              </div>
            )}
            <div className="neon-upload-wrapper mb-2">
              <input
                id={`adrFile-${idx}`}
                type="file"
                accept=".pdf"
                onChange={e => {
                  if (e.target.files?.[0]) {
                    uploadAdrFile(e.target.files[0], idx, setValue);
                  }
                }}
                className="neon-upload-input"
              />
              <label htmlFor={`adrFile-${idx}`} className="neon-upload-btn">
                ☢️ Upload PDF
              </label>
              <span className="neon-upload-file">
                {pallet.adrFileUrl ? (
                  <a
                    href={`${supabaseBase}adrfiles/${pallet.adrFileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {pallet.adrFileUrl.split("/").pop()}
                  </a>
                ) : (
                  "No file chosen"
                )}
              </span>
            </div>
            {errors.pallets?.[idx]?.adrClass && (
              <span className="text-danger">{errors.pallets[idx].adrClass.message}</span>
            )}
          </div>
        )}
      </div>

      {/* Equipment Toggles */}
      <div className="booking-form-group mt-3 mb-3">
        <label style={{ color: "#13f1fc" }}>Collection Equipment</label>
        <div style={{ display: "flex", gap: 18 }}>
          <label>
            <input type="checkbox" {...register(`pallets.${idx}.forkliftPickup`)} />
            Forklift
          </label>
          <label>
            <input type="checkbox" {...register(`pallets.${idx}.tailLiftPickup`)} />
            Tail-lift
          </label>
          <label>
            <input type="checkbox" {...register(`pallets.${idx}.noEquipPickup`)} />
            No Equipment
          </label>
        </div>
        <label style={{ color: "#13f1fc", marginTop: 6 }}>Delivery Equipment</label>
        <div style={{ display: "flex", gap: 18 }}>
          <label>
            <input type="checkbox" {...register(`pallets.${idx}.forkliftDelivery`)} />
            Forklift
          </label>
          <label>
            <input type="checkbox" {...register(`pallets.${idx}.tailLiftDelivery`)} />
            Tail-lift
          </label>
          <label>
            <input type="checkbox" {...register(`pallets.${idx}.noEquipDelivery`)} />
            No Equipment
          </label>
        </div>
      </div>

      {/* Collection/Delivery Address Selects */}
      <div className="row mb-2 mt-3">
        <div className="col-md-6 mb-3">
          <label>Collection Address for this Pallet*</label>
          <select
            className="form-control neon-select"
            value={pallet.collectionAddress || ""}
            onChange={e => {
              setValue(`pallets.${idx}.collectionAddress`, e.target.value, { shouldValidate: true });
              trigger();
            }}
            name={`pallets.${idx}.collectionAddress`}
          >
            <option value="">Select collection address</option>
            {collectionPoints?.map((pt, i) => (
              <option key={i} value={pt.postcode || pt}>
                {pt.label ? pt.label : pt.postcode || pt}
              </option>
            ))}
          </select>
          {errors.pallets?.[idx]?.collectionAddress && (
            <span className="text-danger">{errors.pallets[idx].collectionAddress.message}</span>
          )}
        </div>
        <div className="col-md-6 mb-3">
          <label>Delivery Address for this Pallet*</label>
          <select
            className="form-control neon-select"
            value={pallet.deliveryAddress || ""}
            onChange={e => {
              setValue(`pallets.${idx}.deliveryAddress`, e.target.value, { shouldValidate: true });
              trigger();
            }}
            name={`pallets.${idx}.deliveryAddress`}
          >
            <option value="">Select delivery address</option>
            {deliveryPoints?.map((pt, i) => (
              <option key={i} value={pt.postcode || pt}>
                {pt.label ? pt.label : pt.postcode || pt}
              </option>
            ))}
          </select>
          {errors.pallets?.[idx]?.deliveryAddress && (
            <span className="text-danger">{errors.pallets[idx].deliveryAddress.message}</span>
          )}
        </div>
      </div>

      {/* Neon Delivery Note Uploader */}
      <div className="booking-form-group mt-2 mb-3">
        <label>Delivery Note (PDF)</label>
        <div className="neon-upload-wrapper">
          <input
            id={`deliveryNoteFile-${idx}`}
            type="file"
            accept=".pdf"
            onChange={e => {
              if (e.target.files?.[0]) {
                uploadDeliveryNoteFile(e.target.files[0], idx, setValue);
              }
            }}
            className="neon-upload-input"
          />
          <label htmlFor={`deliveryNoteFile-${idx}`} className="neon-upload-btn">
            🚀 Upload PDF
          </label>
          <span className="neon-upload-file">
            {pallet.deliveryNoteUrl ? (
              <a
                href={`${supabaseBase}documents/${pallet.deliveryNoteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {pallet.deliveryNoteUrl.split("/").pop()}
              </a>
            ) : (
              "No file chosen"
            )}
          </span>
        </div>
      </div>

      {/* Remove pallet button */}
      {remove && (
        <button
          type="button"
          className="btn btn-danger"
          style={{ marginLeft: 8, marginTop: 18, marginBottom: 10 }}
          onClick={() => remove(idx)}
        >
          🗑 Remove
        </button>
      )}

      {/* Neon styles */}
      <style jsx>{`
        .neon-upload-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 4px;
        }
        .neon-upload-input {
          display: none;
        }
        .neon-upload-btn {
          background: linear-gradient(90deg,#0ff1ce 10%,#08f7fe 55%,#09fbd3 90%);
          color: #191a2f;
          border: none;
          font-weight: 800;
          padding: 0.6em 1.3em;
          border-radius: 15px;
          box-shadow: 0 0 8px #0ff1ce, 0 0 24px #08f7fe66;
          transition: transform 0.09s, box-shadow 0.09s;
          cursor: pointer;
          font-size: 1em;
          letter-spacing: 1px;
          outline: none;
          position: relative;
          z-index: 2;
          text-shadow: 0 2px 12px #fff8;
        }
        .neon-upload-btn:hover {
          transform: scale(1.06);
          box-shadow: 0 0 16px #0ff1ce, 0 0 48px #08f7fe;
        }
        .neon-upload-file {
          color: #13f1fc;
          font-weight: 700;
          font-size: 0.96em;
          text-shadow: 0 0 3px #09fbd3cc;
          max-width: 220px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .neon-select {
          background: #191a2f !important;
          color: #0aefff !important;
          border: 1.5px solid #0ff1ce !important;
          border-radius: 12px !important;
          font-weight: 700;
          padding: 8px 14px;
          margin-bottom: 6px;
          font-size: 1.09em;
          box-shadow: 0 0 7px #0ff1ce44;
        }
        .neon-switch {
          position: relative;
          display: inline-block;
          width: 46px;
          height: 25px;
          vertical-align: middle;
        }
        .neon-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          background: #222b3a;
          border-radius: 15px;
          top: 0; left: 0; right: 0; bottom: 0;
          box-shadow: 0 0 6px #08f7fe77;
          transition: 0.3s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 19px;
          width: 19px;
          left: 3px;
          bottom: 3px;
          background: linear-gradient(90deg,#0ff1ce,#08f7fe 55%,#09fbd3 100%);
          border-radius: 50%;
          transition: 0.3s;
          box-shadow: 0 0 10px #0ff1ce66;
        }
        .neon-switch input:checked + .slider {
          background: #08f7fe55;
          box-shadow: 0 0 14px #0ff1ce;
        }
        .neon-switch input:checked + .slider:before {
          transform: translateX(21px);
          box-shadow: 0 0 15px #0ff1cecc;
        }
      `}</style>
    </div>
  );
}
