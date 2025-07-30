'use client';
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { toast } from "react-toastify";

const TRIAGE_ACTIONS = [
  { value: "collect", label: "Collect & Return to Newark" },
  { value: "assess", label: "Assess & Return" },
  { value: "dispose", label: "Dispose" },
];

export default function CurrysBookingCreate() {
  const { data: session } = useSession();
  const router = useRouter();
  const supabase = getSupabaseClient(session?.user?.supabaseAccessToken);

  const [form, setForm] = useState({
    internal_reference: "",
    battery_type: "",
    qty: "",
    triage_action: "",
    status: "open",
    cost: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  function updateField(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setUploadStatus("");
    try {
      // Verify Currys user
      const { data: user } = await supabase
        .from("currys_users")
        .select("*")
        .eq("email", session.user.email)
        .maybeSingle();
      if (!user?.id) throw new Error("Not authorised for Currys portal");

      // Insert booking (initial)
      const payload = {
        ...form,
        qty: Number(form.qty) || 1,
        created_by: user.id,
        created_at: new Date().toISOString(),
      };
      const { error: insertErr, data: booking } = await supabase
        .from("bookings_currys")
        .insert([payload])
        .select("*")
        .single();
      if (insertErr) throw new Error(insertErr.message);

      let docUrl = "";
      if (file) {
        setUploadStatus("Uploading file...");
        const path = `booking_${booking.id}_${Date.now()}_${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from('currysdocs')
          .upload(path, file, { upsert: true });
        if (uploadErr) throw new Error("File upload failed: " + uploadErr.message);
        const { data: urlData } = supabase.storage.from('currysdocs').getPublicUrl(path);
        if (!urlData?.publicUrl) throw new Error("Failed to get public URL.");
        docUrl = urlData.publicUrl;
        setUploadStatus("File uploaded!");
        // Update booking with doc_url
        await supabase
          .from("bookings_currys")
          .update({ doc_url: docUrl })
          .eq("id", booking.id);
      }

      toast.success("Booking created!");
      router.push(`/dashboard/currys/bookings/${booking.id}`);
    } catch (e) {
      setError(e.message);
      setUploadStatus("");
    }
    setSaving(false);
  }

  return (
    <div className="container mt-4">
      <Link href="/dashboard/currys/bookings" className="btn btn-light mb-3">
        ← Back to Bookings
      </Link>
      <h2>Create New Currys Battery Booking</h2>
      <form className="mt-3" onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label className="form-label">Internal Reference <span style={{color:"#0af"}}>*</span></label>
          <input
            className="form-control"
            value={form.internal_reference}
            onChange={e => updateField("internal_reference", e.target.value)}
            required
            placeholder="Currys job reference"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Battery Type <span style={{color:"#0af"}}>*</span></label>
          <input
            className="form-control"
            value={form.battery_type}
            onChange={e => updateField("battery_type", e.target.value)}
            required
            placeholder="E.g. Lithium Ion"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Quantity <span style={{color:"#0af"}}>*</span></label>
          <input
            className="form-control"
            type="number"
            min={1}
            value={form.qty}
            onChange={e => updateField("qty", e.target.value)}
            required
            placeholder="Number of batteries"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Triage Action <span style={{color:"#0af"}}>*</span></label>
          <select
            className="form-select"
            value={form.triage_action}
            onChange={e => updateField("triage_action", e.target.value)}
            required
          >
            <option value="">Select...</option>
            {TRIAGE_ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Status</label>
          <input
            className="form-control"
            value={form.status}
            onChange={e => updateField("status", e.target.value)}
            placeholder="Status (default: open)"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Cost (£)</label>
          <input
            className="form-control"
            type="number"
            min={0}
            step="0.01"
            value={form.cost}
            onChange={e => updateField("cost", e.target.value)}
            placeholder="Leave blank unless admin"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Notes / Extra Info</label>
          <textarea
            className="form-control"
            rows={3}
            value={form.notes}
            onChange={e => updateField("notes", e.target.value)}
            placeholder="Instructions, notes, etc"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Attach Document / Image</label>
          <input
            type="file"
            className="form-control"
            onChange={e => setFile(e.target.files?.[0])}
            disabled={saving}
          />
          <div>{uploadStatus}</div>
        </div>
        <button type="submit" className="btn btn-success" disabled={saving}>
          {saving ? "Saving..." : "Create Booking"}
        </button>
      </form>
    </div>
  );
}
