'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router!
import { useSession, signOut } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";
import fastFreightConfig from "@/components/partners/fastFreightConfig";

export default function FastFreightDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [legs, setLegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(null);

  // Role-guard and data fetch
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace('/login');
      return;
    }

    // Defensive roles handling
    const roles = Array.isArray(session?.user?.roles)
      ? session.user.roles.map(r => r.toLowerCase())
      : [session?.user?.role?.toLowerCase()].filter(Boolean);

    // Only allow partner, fastfreight, or admin
    if (!roles.includes('partner') && !roles.includes('fastfreight') && !roles.includes('admin')) {
      router.replace('/dashboard');
      return;
    }

    fetchFastFreightLegs();
    // eslint-disable-next-line
  }, [session, status, router]);

  async function fetchFastFreightLegs() {
    setLoading(true);
    setError("");
    try {
      let { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("transport_partner", "fastfreight");
      if (error) throw error;

      // Optional postcode filter logic...
      // const { data: allData, error: allError } = await supabase.from("bookings").select("*");
      // if (allError) throw allError;
      // const filteredByPostcode = (allData || []).filter(fastFreightConfig.filterLeg);
      // data = [...(data || []), ...filteredByPostcode];

      setLegs(data || []);
    } catch (err) {
      setError("Failed to load data: " + (err.message || err));
    }
    setLoading(false);
  }

  function handleLogout() {
    signOut({ callbackUrl: "/" });
  }

  // UI states: loading or not permitted
  if (status === "loading" || !session) return <div className="mt-4">Loading...</div>;

  const roles = Array.isArray(session?.user?.roles)
    ? session.user.roles.map(r => r.toLowerCase())
    : [session?.user?.role?.toLowerCase()].filter(Boolean);
  if (!roles.includes('partner') && !roles.includes('fastfreight') && !roles.includes('admin'))
    return <div className="mt-4">Redirecting...</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #181216 60%, #35270d 100%)",
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
                color: "#ff9400",
                letterSpacing: ".05em",
                textShadow: "0 2px 18px #fbab0060",
                margin: 0,
              }}
            >
              🚚 Fast Freight Dashboard
            </h2>
            <div style={{ fontSize: 15, color: "#ffb46d", fontWeight: 400 }}>
              Covering all SW Scotland, Highlands, Islands (excluding EH postcodes)
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "linear-gradient(90deg, #ff9d00 0%, #fb5e3c 100%)",
              color: "#fff",
              fontWeight: 700,
              padding: "9px 28px",
              fontSize: 17,
              border: "none",
              borderRadius: 14,
              boxShadow: "0 2px 18px #ffbf3052",
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
          background: "linear-gradient(120deg, #291e17 65%, #4e3311 100%)",
          boxShadow: "0 8px 40px 0 #fd7b122b, 0 0 24px #ffbe2144",
          border: "2.5px solid #f78b091f",
        }}>
          <h3 style={{
            fontWeight: 700, color: "#ffaa10", marginBottom: 18,
            fontSize: 26, textShadow: "0 1px 8px #ffbf3052"
          }}>
            📦 Assigned Collections & Deliveries
          </h3>
          {loading ? (
            <div style={{ color: "#fc0", padding: "2rem" }}>
              Loading bookings...
            </div>
          ) : error ? (
            <div style={{ color: "#fb4141", fontWeight: 600 }}>{error}</div>
          ) : legs.length === 0 ? (
            <div style={{ color: "#c69e6d", fontSize: 17 }}>
              No legs found for Fast Freight.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table table-dark table-striped" style={{
                width: "100%",
                background: "#21180ecc",
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
                  </tr>
                </thead>
                <tbody>
                  {legs.map((b) => (
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td>
                        {Array.isArray(b.collections) ? b.collections.map((c, i) =>
                          <div key={i}>
                            <b>{c.postcode}</b> <span style={{ color: "#ffad30" }}>{c.address}</span>
                          </div>
                        ) : "-"}
                      </td>
                      <td>
                        {Array.isArray(b.deliveries) ? b.deliveries.map((d, i) =>
                          <div key={i}>
                            <b>{d.postcode}</b> <span style={{ color: "#ffad30" }}>{d.address}</span>
                          </div>
                        ) : "-"}
                      </td>
                      <td>{b.status || "pending"}</td>
                      <td>
                        {b.allocated_to_haulsmart
                          ? <span style={{ color: "#0fa" }}>HaulSmart</span>
                          : <span style={{ color: "#fb5e3c" }}>Fast Freight</span>}
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
        body { background: #140c08 !important; }
        .neon-card { border-radius: 28px; box-shadow: 0 10px 50px #ff9d1015; }
        table.table { border-collapse: separate; border-spacing: 0; }
        th, td { vertical-align: middle; font-size: 1.06em; }
        th { background: #4e3311; color: #ffa011; letter-spacing: .03em; font-size: 1.05em; }
        td { background: #23190bde; }
        tr { border-radius: 12px !important; }
      `}</style>
    </div>
  );
}
