'use client';
import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";
import { ToastContainer, toast } from 'react-toastify';
import Confetti from "react-confetti"; // yarn add react-confetti
import { FaCopy, FaCheck, FaUserCircle, FaSearch } from "react-icons/fa";

export default function PartnerDashboard({ config }) {
  const { data: session, status } = useSession();
  const [legs, setLegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // --- Fetch all bookings, filter legs per partner config ---
  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    const fetchLegs = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order('created_at', { ascending: false });

      if (error) {
        setError("Failed to load bookings: " + error.message);
        setLoading(false);
        return;
      }
      let foundLegs = [];
      for (const booking of data || []) {
        for (const cp of booking.collections || []) {
          foundLegs.push({
            id: `${booking.id}-COLLECT-${cp.postcode}`,
            booking_id: booking.id,
            type: "Collection → Port",
            collection: cp,
            delivery: booking.deliveries?.[0] || {},
            status: booking.status,
            leg_status: cp.leg_status || booking.status,
            posted_to_exchange: !!cp.posted_to_exchange,
          });
        }
        for (const dp of booking.deliveries || []) {
          foundLegs.push({
            id: `${booking.id}-DELIVER-${dp.postcode}`,
            booking_id: booking.id,
            type: "Port → Delivery",
            collection: booking.collections?.[0] || {},
            delivery: dp,
            status: booking.status,
            leg_status: dp.leg_status || booking.status,
            posted_to_exchange: !!dp.posted_to_exchange,
          });
        }
      }
      setLegs(foundLegs.filter(config.filterLeg));
      setLoading(false);
    };
    fetchLegs();
  }, [session, config]);

  // --- Allocate leg to exchange ---
  const handleAllocateToHaulSmart = async (leg) => {
    try {
      const res = await config.allocateToExchange(leg);
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || "Failed to post to HaulSmart");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1600);
      toast.success("Leg posted to HaulSmart exchange!");
      setLegs(ls => ls.map(l =>
        l.id === leg.id ? { ...l, posted_to_exchange: true, leg_status: "posted_to_exchange" } : l
      ));
    } catch (e) {
      toast.error("Error posting to HaulSmart: " + (e.message || ""));
    }
  };

  // --- Copy helpers ---
  function handleCopy(text, key) {
    navigator.clipboard.writeText(text || "");
    setCopied(key);
    setTimeout(() => setCopied(null), 900);
  }

  // --- Search & filter ---
  const visibleLegs = legs.filter(leg => {
    if (filter !== "all") {
      if (filter === "posted" && !leg.posted_to_exchange) return false;
      if (filter === "pending" && leg.posted_to_exchange) return false;
    }
    const s = search.toLowerCase();
    return (
      !search ||
      leg.collection?.postcode?.toLowerCase().includes(s) ||
      leg.delivery?.postcode?.toLowerCase().includes(s) ||
      leg.booking_id?.toString().includes(s)
    );
  });

  if (status === "loading") {
    return <div className="partner-loading">Loading dashboard...</div>;
  }
  if (!session) {
    return (
      <div className="partner-logout">
        <h2>You are logged out</h2>
        <button onClick={() => window.location.href = "/login"} className="btn btn-primary">Sign In</button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse at top right, ${config.brandColor}10 0%, #111623 100%)`,
        color: "#eaffff",
        padding: "0 0 64px 0",
        fontFamily: "Poppins, Arial, sans-serif"
      }}
    >
      {showConfetti && <Confetti numberOfPieces={180} recycle={false} />}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(20,40,80,0.82)",
        padding: "26px 38px 22px 38px",
        borderBottom: `2.5px solid ${config.brandColor}`,
        boxShadow: `0 2px 24px 0 ${config.brandColor}24`
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span className="partner-brand-glow" style={{
            fontSize: 36, marginRight: 8,
            animation: "brandSpin 3.4s linear infinite"
          }}>{config.icon || "🚚"}</span>
          <span style={{
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: ".03em",
            color: config.brandColor,
            textShadow: `0 0 10px ${config.brandColor}cc`
          }}>
            {config.name} Partner Portal
          </span>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 18
        }}>
          {session?.user?.image
            ? <img src={session.user.image} alt="profile" style={{
                width: 40, height: 40, borderRadius: "50%",
                border: `2px solid ${config.brandColor}`, boxShadow: "0 2px 8px #09e8ff77"
              }}/>
            : <FaUserCircle size={38} color={config.brandColor} style={{ filter: "drop-shadow(0 0 8px #44fff5)" }} />}
          <button
            onClick={() => signOut()}
            className="btn btn-danger"
            style={{ fontWeight: 700, padding: "9px 28px", borderRadius: 12, fontSize: 19 }}
          >Logout</button>
        </div>
      </header>

      <div className="container-xl py-5">
        <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 22 }}>
          <div>
            <h3 style={{ color: config.brandColor, marginBottom: 8 }}>{config.description}</h3>
            <span style={{
              color: "#fff",
              background: `${config.brandColor}22`,
              borderRadius: 12,
              padding: "2px 16px",
              fontWeight: 500
            }}>
              {legs.length} Total Legs
            </span>
          </div>
          <div style={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 14
          }}>
            <div className="leg-search" style={{
              background: "#19244b", borderRadius: 12, padding: "7px 15px",
              display: "flex", alignItems: "center"
            }}>
              <FaSearch style={{ marginRight: 7, color: config.brandColor }} />
              <input
                placeholder="Search postcode, booking ID…"
                style={{
                  border: "none", outline: "none", background: "none",
                  color: "#fff", fontSize: 17, width: 180, fontWeight: 600
                }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              value={filter}
              style={{ maxWidth: 134, fontWeight: 500, borderRadius: 8, color: config.brandColor, border: "none" }}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Not posted</option>
              <option value="posted">Allocated to HaulSmart</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          {loading && <p className="text-info">Loading legs...</p>}
          {error && <div className="alert alert-danger">{error}</div>}
          {!loading && visibleLegs.length === 0 && (
            <div className="alert alert-warning" style={{ marginTop: 24 }}>No legs found in your coverage area.</div>
          )}
          {visibleLegs.map(leg => (
            <div
              key={leg.id}
              className={`leg-card neon-pop ${leg.posted_to_exchange ? "leg-posted" : ""}`}
              style={{
                border: `2.2px solid ${leg.posted_to_exchange ? "#09f6d7" : config.brandColor}`,
                borderRadius: 19,
                marginBottom: 26,
                padding: 22,
                background: "linear-gradient(120deg, #171b27 62%, #1e2c44 100%)",
                boxShadow: leg.posted_to_exchange
                  ? "0 4px 24px #07ffc926"
                  : `0 2px 20px 0 ${config.brandColor}2d`,
                transition: "all .19s"
              }}
            >
              <div style={{ fontSize: 21, fontWeight: 700, marginBottom: 5 }}>
                {leg.type}
                <span className={`leg-pulse ${leg.posted_to_exchange ? "leg-pulse-active" : ""}`} />
                {leg.posted_to_exchange && (
                  <span style={{ color: "#2fffa6", marginLeft: 18, fontSize: 18, fontWeight: 700, letterSpacing: ".01em" }}>
                    <FaCheck style={{ marginBottom: -2, marginRight: 4 }}/> Allocated to HaulSmart
                  </span>
                )}
              </div>
              <div style={{ fontSize: 17, marginBottom: 2 }}>
                <b>Booking ID:</b> {leg.booking_id}
              </div>
              <div style={{ fontSize: 17 }}>
                <b>Collection:</b>
                <span
                  style={{ color: "#00e7ff", marginLeft: 7, cursor: "pointer" }}
                  onClick={() => handleCopy(leg.collection?.address, leg.id + "-col")}
                  title="Copy address"
                >{leg.collection?.address} ({leg.collection?.postcode})</span>
                <span
                  style={{ marginLeft: 7, cursor: "pointer" }}
                  onClick={() => handleCopy(leg.collection?.postcode, leg.id + "-colp")}
                  title="Copy postcode"
                > <FaCopy size={13} style={{ verticalAlign: "middle", opacity: .78 }}/>
                  {copied === leg.id + "-colp" && <span style={{ marginLeft: 2, color: "#0f8" }}>Copied!</span>}
                </span>
              </div>
              <div style={{ fontSize: 17 }}>
                <b>Delivery:</b>
                <span
                  style={{ color: "#ffdc47", marginLeft: 7, cursor: "pointer" }}
                  onClick={() => handleCopy(leg.delivery?.address, leg.id + "-del")}
                  title="Copy address"
                >{leg.delivery?.address} ({leg.delivery?.postcode})</span>
                <span
                  style={{ marginLeft: 7, cursor: "pointer" }}
                  onClick={() => handleCopy(leg.delivery?.postcode, leg.id + "-delp")}
                  title="Copy postcode"
                > <FaCopy size={13} style={{ verticalAlign: "middle", opacity: .78 }}/>
                  {copied === leg.id + "-delp" && <span style={{ marginLeft: 2, color: "#0f8" }}>Copied!</span>}
                </span>
              </div>
              <div style={{ margin: "7px 0 2px 0", fontSize: 16 }}>
                <b>Status:</b> {leg.leg_status}
              </div>
              <div style={{ marginTop: 15 }}>
                {!leg.posted_to_exchange && (
                  <button
                    className="btn btn-info"
                    style={{
                      fontWeight: 700,
                      fontSize: 17,
                      borderRadius: 11,
                      background: "linear-gradient(90deg,#19cfff,#55eafc 100%)",
                      color: "#222",
                      boxShadow: "0 3px 16px #00f3ff1b"
                    }}
                    onClick={() => handleAllocateToHaulSmart(leg)}
                  >
                    Allocate to HaulSmart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <ToastContainer position="bottom-left" />
      </div>
      <style jsx global>{`
        @keyframes brandSpin {
          0% { transform: rotate(-5deg) scale(1.07);}
          40% { transform: rotate(3deg) scale(1.10);}
          65% { transform: rotate(-2deg) scale(1.06);}
          100% { transform: rotate(-5deg) scale(1.07);}
        }
        .btn-danger {
          background: linear-gradient(90deg,#fc3d45,#a72fff 90%);
          border: none;
          color: #fff !important;
        }
        .btn-danger:hover { background: linear-gradient(90deg,#e54c8c,#662fff 100%); }
        .btn-info {
          background: linear-gradient(90deg,#19cfff,#55eafc 100%);
          border: none;
        }
        .btn-info:hover { background: linear-gradient(90deg,#00ffc6,#00eaff 100%); }
        .leg-card { transition: box-shadow .18s, border-color .16s, transform .11s; }
        .leg-card:hover { box-shadow: 0 8px 32px #1fffff46; border-color: #16ffe3; transform: scale(1.012); }
        .leg-posted { border-color: #05ffe3 !important; }
        .partner-loading, .partner-logout { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 65vh; }
        .leg-pulse {
          display: inline-block;
          width: 11px; height: 11px; border-radius: 50%; margin-left: 10px;
          background: #faed5b; box-shadow: 0 0 8px #e3ee46c8;
          animation: pulseGlow 1.7s infinite;
        }
        .leg-pulse-active {
          background: #13ffb0 !important; box-shadow: 0 0 14px #23fff9 !important;
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 4px #d3e660b0, 0 0 0 #fff0;}
          60% { box-shadow: 0 0 16px #fff684, 0 0 8px #ffe99999;}
          100% { box-shadow: 0 0 4px #e3ee46b0, 0 0 0 #fff0;}
        }
      `}</style>
    </div>
  );
}
