'use client';
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { toast } from "react-toastify";

const TRIAGE_ACTIONS = [
  { value: "collect", label: "Collect & Return to Newark" },
  { value: "assess", label: "Assess & Return" },
  { value: "dispose", label: "Dispose" },
];

export default function CurrysBookingEdit() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const supabase = getSupabaseClient(session?.user?.supabaseAccessToken);

  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // For file uploads
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");

  // Form state
  const [triageAction, setTriageAction] = useState("");
  const [status, setStatus] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");

  // --- Load user and booking
  useEffect(() => {
    if (!session?.user || !id) return;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const { data: userData } = await supabase
          .from("currys_users")
          .select("*")
          .eq("email", session.user.email)
          .maybeSingle();
        if (!userData?.id) throw new Error("Not authorised for Currys portal");
        setUser(userData);

        const { data: bookingData, error: bookingErr } = await supabase
          .from("bookings_currys")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (bookingErr || !bookingData) throw new Error("Booking not found.");
        setBooking(bookingData);

        setTriageAction(bookingData.triage_action || "");
        setStatus(bookingData.status || "");
        setCost(bookingData.cost || "");
        setNotes(bookingData.notes || "");

        setUploadedUrl(bookingData?.doc_url || "");
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    fetchData();
  }, [session, id]);

  // --- Handle save/update
  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const payload = {
        triage_action: triageAction,
        status,
        cost,
        notes,
      };
      // Only allow permitted fields for roles
      if (user?.role !== "admin" && user?.role !== "ops") {
        delete payload.cost;
      }
      // Save uploaded doc_url if set
      if (uploadedUrl) payload.doc_url = uploadedUrl;
      const { error: updateErr } = await supabase
        .from("bookings_currys")
        .update(payload)
        .eq("id", id);
      if (updateErr) throw new Error(updateErr.message);
      toast.success("Booking updated.");
      router.replace(router.asPath); // Refresh data
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  }

  // --- Handle file upload
  async function handleFileUpload(file) {
    setUploading(true);
    setUploadStatus("Uploading...");
    try {
      const path = `booking_${id}_${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('currysdocs')
        .upload(path, file, { upsert: true });
      if (error) throw new Error(error.message);
      const { data: urlData } = supabase.storage.from('currysdocs').getPublicUrl(path);
      if (!urlData?.publicUrl) throw new Error("Failed to get public URL.");
      setUploadedUrl(urlData.publicUrl);
      setUploadStatus("Uploaded!");
      toast.success("File uploaded!");
    } catch (e) {
      setUploadStatus("Failed: " + e.message);
      toast.error(e.message);
    }
    setUploading(false);
  }

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;
  if (!booking) return <div className="container mt-4">Booking not found.</div>;

  return (
    <div className="container mt-4">
      <Link href="/dashboard/currys/bookings" className="btn btn-light mb-3">
        ← Back to Bookings
      </Link>
      <h2>Edit Currys Battery Booking #{booking.id}</h2>
      <div className="card mb-3">
        <div className="card-body">
          <div><b>Created:</b> {new Date(booking.created_at).toLocaleString()}</div>
          <div><b>Ref:</b> {booking.internal_reference}</div>
          <div><b>Type:</b> {booking.battery_type}</div>
          <div><b>Qty:</b> {booking.qty}</div>
          {uploadedUrl && (
            <div className="mt-2">
              <b>Uploaded File:</b>{" "}
              <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#007bff" }}>
                View / Download
              </a>
            </div>
          )}
          <div className="mt-2">
            <label className="form-label">Upload Document / Image</label>
            <input
              type="file"
              className="form-control"
              disabled={uploading}
              onChange={e => e.target.files[0] && handleFileUpload(e.target.files[0])}
            />
            <div>{uploadStatus}</div>
          </div>
        </div>
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSave();
        }}
      >
        <div className="mb-3">
          <label className="form-label">Triage Action</label>
          <select
            className="form-select"
            value={triageAction}
            onChange={e => setTriageAction(e.target.value)}
          >
            <option value="">Select...</option>
            {TRIAGE_ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Status</label>
          <input
            className="form-control"
            value={status}
            onChange={e => setStatus(e.target.value)}
            placeholder="Enter booking status"
          />
        </div>
        {(user?.role === "admin" || user?.role === "ops") && (
          <div className="mb-3">
            <label className="form-label">Cost (£)</label>
            <input
              type="number"
              className="form-control"
              value={cost}
              onChange={e => setCost(e.target.value)}
              min={0}
              step="0.01"
              placeholder="Enter job cost"
            />
          </div>
        )}
        <div className="mb-3">
          <label className="form-label">Notes / Update</label>
          <textarea
            className="form-control"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
