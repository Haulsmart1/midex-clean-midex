import React, { useState } from "react";

export default function CurrysBookingForm({
  initial = {},
  onSave,
  saving = false,
  editMode = false,
}) {
  const [form, setForm] = useState({ ...initial });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.collection_address || !form.collection_postcode || !form.triage_action) {
      setError("Required fields missing");
      return;
    }
    setError("");
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="neon-card p-4">
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-2">
        <label>Collection Address</label>
        <input className="form-control" name="collection_address" value={form.collection_address || ""} onChange={handleChange} />
      </div>
      <div className="mb-2">
        <label>Collection Postcode</label>
        <input className="form-control" name="collection_postcode" value={form.collection_postcode || ""} onChange={handleChange} />
      </div>
      <div className="mb-2">
        <label>Contact Name</label>
        <input className="form-control" name="contact_name" value={form.contact_name || ""} onChange={handleChange} />
      </div>
      <div className="mb-2">
        <label>Contact Phone</label>
        <input className="form-control" name="contact_phone" value={form.contact_phone || ""} onChange={handleChange} />
      </div>
      <div className="mb-2">
        <label>Currys Internal Ref</label>
        <input className="form-control" name="internal_reference" value={form.internal_reference || ""} onChange={handleChange} />
      </div>
      <div className="mb-2">
        <label>Battery Type</label>
        <input className="form-control" name="battery_type" value={form.battery_type || ""} onChange={handleChange} />
      </div>
      <div className="mb-2">
        <label>Quantity</label>
        <input type="number" className="form-control" name="qty" min={1} value={form.qty || 1} onChange={handleChange} />
      </div>
      <div className="mb-2">
        <label>Weight (kg)</label>
        <input type="number" step="0.01" className="form-control" name="weight_kg" value={form.weight_kg || ""} onChange={handleChange} />
      </div>
      <div className="mb-2">
        <label>Triage Action</label>
        <select className="form-control" name="triage_action" value={form.triage_action || ""} onChange={handleChange} required>
          <option value="">Select Action</option>
          <option value="Return to Newark">Return to Newark</option>
          <option value="Assess and Return">Assess and Return</option>
          <option value="Dispose">Dispose</option>
        </select>
      </div>
      <button className="btn btn-gradient-primary" disabled={saving}>
        {saving ? "Saving..." : editMode ? "Save Booking" : "Book Collection"}
      </button>
    </form>
  );
}
