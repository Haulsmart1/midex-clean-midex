// components/common/currys/CurrysBookingForm.jsx
import React, { useEffect, useState } from "react";

const TRIAGE = [
  { value: "collect", label: "Return to Newark" },
  { value: "assess", label: "Assess and Return" },
  { value: "dispose", label: "Dispose" },
];

export default function CurrysBookingForm({
  initial = {},
  onSave,
  saving = false,
  editMode = false,
}) {
  const [form, setForm] = useState({ ...initial });
  const [error, setError] = useState("");

  // keep form in sync when `initial` changes (e.g., editing existing record)
  useEffect(() => {
    setForm({ ...initial });
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // basic postcode normalization on the fly
    if (name === "collection_postcode") {
      setForm((prev) => ({ ...prev, [name]: value.toUpperCase() }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Require essential fields
    if (
      !form.collection_address?.trim() ||
      !form.collection_postcode?.trim() ||
      !form.triage_action
    ) {
      setError("Required fields missing");
      return;
    }

    // coerce & sanitize before save
    const qty = Number(form.qty) > 0 ? Number(form.qty) : 1;
    const weight_kg =
      form.weight_kg === "" || form.weight_kg == null
        ? null
        : Number.parseFloat(form.weight_kg);

    // allow legacy label values by mapping to enum if needed
    const triageFromLabel =
      TRIAGE.find((t) => t.label === form.triage_action)?.value ?? form.triage_action;

    const payload = {
      ...form,
      internal_reference: form.internal_reference?.trim() || "",
      collection_address: form.collection_address.trim(),
      collection_postcode: form.collection_postcode.trim().toUpperCase(),
      contact_name: form.contact_name?.trim() || "",
      contact_phone: form.contact_phone?.trim() || "",
      battery_type: form.battery_type?.trim() || "",
      qty,
      weight_kg,
      triage_action: triageFromLabel, // "collect" | "assess" | "dispose"
    };

    setError("");
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="neon-card p-4">
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-2">
        <label>Collection Address</label>
        <input
          className="form-control"
          name="collection_address"
          value={form.collection_address || ""}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-2">
        <label>Collection Postcode</label>
        <input
          className="form-control"
          name="collection_postcode"
          value={form.collection_postcode || ""}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-2">
        <label>Contact Name</label>
        <input
          className="form-control"
          name="contact_name"
          value={form.contact_name || ""}
          onChange={handleChange}
        />
      </div>

      <div className="mb-2">
        <label>Contact Phone</label>
        <input
          className="form-control"
          name="contact_phone"
          value={form.contact_phone || ""}
          onChange={handleChange}
        />
      </div>

      <div className="mb-2">
        <label>Currys Internal Ref</label>
        <input
          className="form-control"
          name="internal_reference"
          value={form.internal_reference || ""}
          onChange={handleChange}
        />
      </div>

      <div className="mb-2">
        <label>Battery Type</label>
        <input
          className="form-control"
          name="battery_type"
          value={form.battery_type || ""}
          onChange={handleChange}
        />
      </div>

      <div className="mb-2">
        <label>Quantity</label>
        <input
          type="number"
          className="form-control"
          name="qty"
          min={1}
          value={form.qty ?? 1}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-2">
        <label>Weight (kg)</label>
        <input
          type="number"
          step="0.01"
          className="form-control"
          name="weight_kg"
          value={form.weight_kg ?? ""}
          onChange={handleChange}
        />
      </div>

      <div className="mb-2">
        <label>Triage Action</label>
        <select
          className="form-control"
          name="triage_action"
          value={
            // keep select stable if legacy value present
            TRIAGE.some((t) => t.value === form.triage_action)
              ? form.triage_action
              : TRIAGE.find((t) => t.label === form.triage_action)?.value || ""
          }
          onChange={handleChange}
          required
        >
          <option value="">Select Action</option>
          {TRIAGE.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <button className="btn btn-gradient-primary" disabled={saving}>
        {saving ? "Saving..." : editMode ? "Save Booking" : "Book Collection"}
      </button>
    </form>
  );
}
