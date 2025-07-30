'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";
import atechConfig from "@/components/partners/atechConfig"; // your config, e.g. postcode zones

export default function AtechDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [legs, setLegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(null);

  // ---- RBAC: only "partner" or "atech" can view this ----
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace('/login');
      return;
    }
    const roles = Array.isArray(session?.user?.roles)
      ? session.user.roles
      : [session?.user?.role].filter(Boolean);

    // Change this to match your exact allowed roles:
    if (!roles.includes('partner') && !roles.includes('atech')) {
      router.replace('/dashboard');
      return;
    }
    fetchAtechLegs();
    // eslint-disable-next-line
  }, [session, status, router]);

  async function fetchAtechLegs() {
    setLoading(true);
    setError("");
    try {
      // Only bookings assigned to Atech as transport_partner
      let { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("transport_partner", "atech");
      if (error) throw error;
      setLegs(data || []);
    } catch (err) {
      setError("Failed to load data: " + (err.message || err));
    }
    setLoading(false);
  }

  async function handleAllocateToHaulSmart(bookingId) {
    setProcessing(bookingId);
    const { error } = await supabase
      .from("bookings")
      .update({ allocated_to_haulsmart: true })
      .eq("id", bookingId);
    setProcessing(null);
    if (error) {
      alert("Failed to allocate: " + error.message);
    } else {
      fetchAtechLegs();
    }
  }

  function handleLogout() {
    signOut({ callbackUrl: "/" });
  }

  if (status === "loading" || !session) return <div className="mt-4">Loading...</div>;
  const roles = Array.isArray(session?.user?.roles)
    ? session.user.roles
    : [session?.user?.role].filter(Boolean);
  if (!roles.includes('partner') && !roles.includes('atech')) return <div className="mt-4">Redirecting...</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #11141b 60%, #182338 100%)",
        color: "#fff",
        fontFamily: "Poppins, Arial, sans-serif",
      }}
    >
      <div style={{ padding: 28, maxWidth: 1120, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: "#21eaff",
                letterSpacing: ".05em",
                textShadow: "0 2px 18px #0aeffb60",
                margin: 0,
              }}
            >
              🅰️ Atech Transport Dashboard
            </h2>
            <div style={{ fontSize: 15, color: "#84e4f9", fontWeight: 400 }}>
              Covering EH, TD, NE, DL, TS, SR, LS, HU, YO, BD postcodes
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "linear-gradient(90deg, #23e8ff 0%, #5363fb 100%)",
              color: "#fff",
              fontWeight: 700,
              padding: "9px 28px",
              fontSize: 17,
              border: "none",
              borderRadius: 14,
              boxShadow: "0 2px 18px #0af6ff52",
              cursor: "pointer",
              letterSpacing: ".04em",
              transition: "background 0.18s",
            }}
          >
            Log Out
          </button>
        </div>

        {/* Body */}
        <div className="neon-card" style={{
          padding: 32, borderRadius: 28,
          background: "linear-gradient(120deg, #181b24 65%, #202944 100%)",
          boxShadow: "0 8px 40px 0 #13f7e13b, 0 0 24px #00eaff44",
          border: "2.5px solid #10f3fe1f",
        }}>
          <h3 style={{
            fontWeight: 700, color: "#21eaff", marginBottom: 18,
            fontSize: 26, textShadow: "0 1px 8px #22eaff52"
          }}>
            📦 Assigned Collections & Deliveries
          </h3>
          {loading ? (
            <div style={{ color: "#0cf", padding: "2rem" }}>
              Loading bookings...
            </div>
          ) : error ? (
            <div style={{ color: "#fb4141", fontWeight: 600 }}>{error}</div>
          ) : legs.length === 0 ? (
            <div style={{ color: "#86b5d6", fontSize: 17 }}>
              No legs found for Atech.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table table-dark table-striped" style={{
                width: "100%",
                background: "#192336cc",
                borderRadius: 14,
                overflow: "hidden",
              }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Collection(s)</th>
                    <th>Delivery(ies)</th>
                    <th>Status</th>
                    <th>Allocated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {legs.map((b) => (
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td>
                        {Array.isArray(b.collections) ? b.collections.map((c, i) =>
                          <div key={i}>
                            <b>{c.postcode}</b> <span style={{ color: "#86f" }}>{c.address}</span>
                          </div>
                        ) : "-"}
                      </td>
                      <td>
                        {Array.isArray(b.deliveries) ? b.deliveries.map((d, i) =>
                          <div key={i}>
                            <b>{d.postcode}</b> <span style={{ color: "#86f" }}>{d.address}</span>
                          </div>
                        ) : "-"}
                      </td>
                      <td>{b.status || "pending"}</td>
                      <td>
                        {b.allocated_to_haulsmart
                          ? <span style={{ color: "#0fa" }}>HaulSmart</span>
                          : <span style={{ color: "#3cf" }}>Atech</span>}
                      </td>
                      <td>
                        {!b.allocated_to_haulsmart && (
                          <button
                            disabled={processing === b.id}
                            style={{
                              background: "linear-gradient(90deg,#01cfff,#695afc)",
                              color: "#fff", fontWeight: 700,
                              border: "none", borderRadius: 10,
                              padding: "6px 18px", margin: "0 2px",
                              cursor: "pointer",
                              opacity: processing === b.id ? 0.65 : 1,
                              boxShadow: "0 2px 8px #12eaff3d"
                            }}
                            onClick={() => handleAllocateToHaulSmart(b.id)}
                          >
                            {processing === b.id ? "Allocating..." : "Allocate to HaulSmart"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        body { background: #0b101a !important; }
        .neon-card { border-radius: 28px; box-shadow: 0 10px 50px #12e9ff15; }
        table.table { border-collapse: separate; border-spacing: 0; }
        th, td { vertical-align: middle; font-size: 1.06em; }
        th { background: #21334a; color: #0cf; letter-spacing: .03em; font-size: 1.05em; }
        td { background: #101926ee; }
        tr { border-radius: 12px !important; }
      `}</style>
    </div>
  );
}
