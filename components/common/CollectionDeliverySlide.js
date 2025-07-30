import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";

const PALLET_TYPES = [
  { value: "standard", label: "Standard (120x100)" },
  { value: "euro", label: "Euro (120x80)" },
  { value: "half", label: "Half" },
  { value: "double", label: "Double" },
  { value: "custom", label: "Custom" },
];

const ADR_CLASSES = [
  { value: "1", label: "Class 1 - Explosives" },
  { value: "2", label: "Class 2 - Gases" },
  { value: "3", label: "Class 3 - Flammable Liquids" },
  { value: "4", label: "Class 4 - Flammable Solids" },
  { value: "5", label: "Class 5 - Oxidizing Substances" },
  { value: "6", label: "Class 6 - Toxic/Infectious" },
  { value: "7", label: "Class 7 - Radioactive" },
  { value: "8", label: "Class 8 - Corrosives" },
  { value: "9", label: "Class 9 - Miscellaneous" },
];

export default function PalletItemForm({ name = "pallets" }) {
  const { register, control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });
  const palletVals = watch(name) || [];

  // Simple fake upload handler (replace with your upload logic if needed)
  const handleFileChange = (e, idx, field) => {
    if (e.target.files && e.target.files[0]) {
      // Replace with actual upload, set field to uploaded file URL
      setValue(`${name}.${idx}.${field}`, e.target.files[0].name, { shouldValidate: true });
    }
  };

  return (
    <div>
      <h4 style={{ color: "#13f1fc", fontWeight: 700, marginBottom: 20 }}>🟫 Pallet Details</h4>
      {fields.map((field, idx) => {
        const adrChecked = palletVals?.[idx]?.adr || false;
        return (
          <div
            key={field.id}
            className="mb-4 p-3"
            style={{
              border: "2px solid #13f1fc33",
              borderRadius: 16,
              background: "rgba(18,24,36,0.99)",
              marginBottom: 28,
            }}
          >
            {/* Row 1: Pallet Size/ADR/Dimensions/Weight */}
            <div className="row align-items-end mb-3" style={{ minHeight: 60 }}>
              <div className="col-md-3 mb-2">
                <label className="fw-bold mb-1">Pallet Size/Type</label>
                <select
                  {...register(`${name}.${idx}.type`, { required: true })}
                  className="form-control"
                  style={{ fontSize: 16 }}
                >
                  <option value="">Select</option>
                  {PALLET_TYPES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-3 col-md-2 mb-2">
                <label className="fw-bold mb-1">Length (cm)</label>
                <input
                  type="number"
                  min="0"
                  {...register(`${name}.${idx}.length`, { required: true })}
                  className="form-control"
                  placeholder="e.g. 120"
                />
              </div>
              <div className="col-3 col-md-2 mb-2">
                <label className="fw-bold mb-1">Width (cm)</label>
                <input
                  type="number"
                  min="0"
                  {...register(`${name}.${idx}.width`, { required: true })}
                  className="form-control"
                  placeholder="e.g. 100"
                />
              </div>
              <div className="col-3 col-md-2 mb-2">
                <label className="fw-bold mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="0"
                  {...register(`${name}.${idx}.height`, { required: true })}
                  className="form-control"
                  placeholder="e.g. 180"
                />
              </div>
              <div className="col-3 col-md-2 mb-2">
                <label className="fw-bold mb-1">Weight (kg)</label>
                <input
                  type="number"
                  min="0"
                  {...register(`${name}.${idx}.weight`, { required: true })}
                  className="form-control"
                  placeholder="e.g. 450"
                />
              </div>
            </div>

            {/* Row 2: ADR Toggle and Class */}
            <div className="row align-items-center mb-3">
              <div className="col-auto">
                <label className="fw-bold me-3" style={{ minWidth: 65 }}>ADR</label>
                <label className="switch">
                  <input
                    type="checkbox"
                    {...register(`${name}.${idx}.adr`)}
                    defaultChecked={adrChecked}
                  />
                  <span className="slider round"></span>
                </label>
                <span className="ms-2" style={{ color: adrChecked ? "#0f0" : "#fb4141", fontWeight: 500 }}>
                  {adrChecked ? "Yes" : "No"}
                </span>
              </div>
              {adrChecked && (
                <div className="col-md-4 mt-2 mt-md-0">
                  <label className="fw-bold mb-1">ADR Class</label>
                  <select
                    {...register(`${name}.${idx}.adrClass`, { required: adrChecked })}
                    className="form-control"
                  >
                    <option value="">Select class</option>
                    {ADR_CLASSES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Row 2b: ADR Note Upload (if ADR) */}
            {adrChecked && (
              <div className="row align-items-center mb-3">
                <div className="col-md-6">
                  <label className="fw-bold">Upload Dangerous Goods Note (ADR)</label>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    className="form-control"
                    onChange={e => handleFileChange(e, idx, "adrNoteFile")}
                  />
                  {palletVals[idx]?.adrNoteFile && (
                    <div className="mt-1">
                      <span style={{ color: "#09e5fa" }}>Uploaded:</span> {palletVals[idx]?.adrNoteFile}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Row 3: Equipment Toggles */}
            <div className="row mb-3">
              <div className="col-md-6 mb-2">
                <label className="fw-bold" style={{ color: "#13f1fc" }}>Collection Equipment</label>
                <div className="form-check form-check-inline ms-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    {...register(`${name}.${idx}.forkliftPickup`)}
                  />
                  <label className="form-check-label">Forklift</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    {...register(`${name}.${idx}.tailLiftPickup`)}
                  />
                  <label className="form-check-label">Tail-lift</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    {...register(`${name}.${idx}.noEquipmentPickup`)}
                  />
                  <label className="form-check-label">No Equipment</label>
                </div>
              </div>
              <div className="col-md-6 mb-2">
                <label className="fw-bold" style={{ color: "#13f1fc" }}>Delivery Equipment</label>
                <div className="form-check form-check-inline ms-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    {...register(`${name}.${idx}.forkliftDelivery`)}
                  />
                  <label className="form-check-label">Forklift</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    {...register(`${name}.${idx}.tailLiftDelivery`)}
                  />
                  <label className="form-check-label">Tail-lift</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    {...register(`${name}.${idx}.noEquipmentDelivery`)}
                  />
                  <label className="form-check-label">No Equipment</label>
                </div>
              </div>
            </div>

            {/* Row 4: Collection/Delivery Address for this pallet (as required) */}
            <div className="row mb-2">
              <div className="col-md-6">
                <label>Collection Address for this Pallet</label>
                <input
                  className="form-control"
                  {...register(`${name}.${idx}.collectionAddress`)}
                  placeholder="Auto-filled"
                  disabled
                />
              </div>
              <div className="col-md-6">
                <label>Delivery Address for this Pallet</label>
                <input
                  className="form-control"
                  {...register(`${name}.${idx}.deliveryAddress`)}
                  placeholder="Auto-filled"
                  disabled
                />
              </div>
            </div>

            {/* Delivery Note Upload (for all pallets) */}
            <div className="row align-items-center mb-3">
              <div className="col-md-6">
                <label className="fw-bold">Upload Delivery Note</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="form-control"
                  onChange={e => handleFileChange(e, idx, "deliveryNoteFile")}
                />
                {palletVals[idx]?.deliveryNoteFile && (
                  <div className="mt-1">
                    <span style={{ color: "#09e5fa" }}>Uploaded:</span> {palletVals[idx]?.deliveryNoteFile}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-danger mt-2"
              onClick={() => remove(idx)}
            >
              🗑 Remove
            </button>
          </div>
        );
      })}

      <button
        type="button"
        className="btn btn-gradient-primary"
        onClick={() =>
          append({
            type: "",
            length: "",
            width: "",
            height: "",
            weight: "",
            adr: false,
            adrClass: "",
            adrNoteFile: "",
            deliveryNoteFile: "",
            forkliftPickup: false,
            tailLiftPickup: false,
            noEquipmentPickup: false,
            forkliftDelivery: false,
            tailLiftDelivery: false,
            noEquipmentDelivery: false,
            collectionAddress: "",
            deliveryAddress: ""
          })
        }
      >
        ➕ Add Another Pallet
      </button>

      {/* CSS for toggle switch */}
      <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 42px;
          height: 24px;
          vertical-align: middle;
        }
        .switch input { display: none; }
        .slider {
          position: absolute; cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #ccc; transition: .4s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute; content: "";
          height: 18px; width: 18px; left: 3px; bottom: 3px;
          background: #fff; transition: .4s; border-radius: 50%;
        }
        input:checked + .slider {
          background: #19ef9e;
        }
        input:checked + .slider:before {
          transform: translateX(18px);
        }
      `}</style>
    </div>
  );
}
