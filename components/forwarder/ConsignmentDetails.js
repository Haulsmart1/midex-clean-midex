// FILE: components/forwarder/ConsignmentDetails.js

import React, { useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";

const palletTypes = [
  "Standard Pallet", "Euro Pallet", "Double Pallet", "Mini Quarter", "Custom"
];

export default function ConsignmentDetails({ handleAdrFileUpload }) {
  const { register, control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "pallets" });
  const pallets = watch("pallets") || [];
  const collections = watch("collectionPoints") || [];
  const deliveries = watch("deliveryPoints") || [];

  useEffect(() => {
    if (!fields.length) {
      append({
        type: "", length: "", width: "", height: "", weight: "", qty: 1, description: "",
        forkliftPickup: false, tailLiftPickup: false, forkliftDelivery: false, tailLiftDelivery: false,
        adr: false, adrFileUrl: null, adrFileUploading: false, adrFileError: null,
        pickupPointIndex: 0, deliveryPointIndex: 0
      });
    }
  }, []);

  const renderFileUpload = (idx) => {
    const uploading = pallets?.[idx]?.adrFileUploading;
    const error = pallets?.[idx]?.adrFileError;
    const fileUrl = pallets?.[idx]?.adrFileUrl;

    return (
      <div style={{ marginTop: 10 }}>
        <label className="cool-upload-btn">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: "none" }}
            disabled={uploading}
            onChange={e => e.target.files?.[0] && handleAdrFileUpload(idx, e.target.files[0])}
          />
          📄 {fileUrl ? "Replace Dangerous Goods Note" : "Upload Dangerous Goods Note"}
        </label>
        <div style={{
          fontSize: 13, marginTop: 4, maxWidth: 250, wordBreak: "break-word",
          background: "#1a2736", padding: "3px 7px", borderRadius: 7,
          color: uploading ? "#18e6c1" : "#0af", fontWeight: 500
        }}>
          {uploading ? "Uploading..." : fileUrl ? <a href={fileUrl} target="_blank">View file</a> : "No file uploaded"}
        </div>
        {error && <div style={{ color: "red", fontSize: 12 }}>{error}</div>}
        <style jsx>{`
          .cool-upload-btn {
            background: linear-gradient(90deg, #13f1fc 0%, #45ffc2 100%);
            padding: 6px 18px;
            border-radius: 12px;
            font-weight: 700;
            display: inline-block;
            cursor: pointer;
            color: #091821;
            border: none;
            margin-top: 5px;
            box-shadow: 0 2px 14px #13f1fc44;
            transition: 0.2s ease all;
          }
          .cool-upload-btn:hover {
            background: linear-gradient(90deg, #1ef2d6 0%, #0aefff 100%);
            color: #0e1836;
          }
        `}</style>
      </div>
    );
  };

  return (
    <div>
      <h3 style={{ color: "#13f1fc", fontWeight: 700 }}>📦 Pallet Details</h3>
      {fields.map((item, idx) => (
        <div key={item.id} className="mb-4 p-3 rounded" style={{ background: "#111a22", border: "1px solid #333" }}>
          <div className="row g-2">
            <div className="col-md-6">
              <label>Pallet Type</label>
              <select className="form-control" {...register(`pallets.${idx}.type`)}>
                <option value="">Select type</option>
                {palletTypes.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label>Quantity</label>
              <input type="number" className="form-control" {...register(`pallets.${idx}.qty`)} />
            </div>
            <div className="col-md-3">
              <label>Weight (kg)</label>
              <input type="number" className="form-control" {...register(`pallets.${idx}.weight`)} />
            </div>
            <div className="col-md-12 mt-2">
              <label>Description</label>
              <input type="text" className="form-control" {...register(`pallets.${idx}.description`)} />
            </div>
          </div>

          <div className="row g-2 mt-2">
            <div className="col-md-6">
              <label>Pickup Address</label>
              <select className="form-control" {...register(`pallets.${idx}.pickupPointIndex`)}>
                {collections.map((point, i) => (
                  <option key={i} value={i}>
                    {point.name || point.postcode || `Point ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label>Delivery Address</label>
              <select className="form-control" {...register(`pallets.${idx}.deliveryPointIndex`)}>
                {deliveries.map((point, i) => (
                  <option key={i} value={i}>
                    {point.name || point.postcode || `Point ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-check form-switch mt-3">
            <input
              type="checkbox"
              className="form-check-input"
              id={`adrSwitch-${idx}`}
              {...register(`pallets.${idx}.adr`)}
              onChange={(e) => setValue(`pallets.${idx}.adr`, e.target.checked)}
            />
            <label className="form-check-label" htmlFor={`adrSwitch-${idx}`} style={{ fontWeight: 600 }}>
              🚨 Contains Dangerous Goods (ADR)
            </label>
          </div>

          {pallets?.[idx]?.adr && renderFileUpload(idx)}

          <button
            type="button"
            onClick={() => remove(idx)}
            className="btn btn-danger btn-sm mt-3"
          >
            ❌ Remove Pallet
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ type: "", qty: 1 })}
        className="btn btn-gradient-primary"
      >
        ➕ Add Another Pallet
      </button>
    </div>
  );
}
