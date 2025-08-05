'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

const partnerColors = {
  atech: "#21eaff",
  fastfreight: "#4ae388",
  bond: "#9b4dff",
  tcr: "#ff79ba",
  alptrans: "#00e0ff",
  '247despatch': "#ffce00",
  dwcook: "#f79021",
  default: "#66e3e8",
};
const financeBg = "#182338";
const currysYellow = "#ffc600";

function getInvoiceWeekEnding(dateString) {
  const d = new Date(dateString);
  const day = d.getDay();
  // Friday = 5
  const diff = (day >= 6) ? day - 5 : (day + 7 - 5) % 7;
  const friday = new Date(d);
  friday.setDate(d.getDate() - diff);
  friday.setHours(23,59,59,999);
  return friday;
}
function getPaymentDueDate(friday) {
  const due = new Date(friday);
  due.setDate(due.getDate() + 21);
  due.setHours(23,59,59,999);
  return due;
}
function formatDate(d) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PartnerFinancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // Hydration guard: don't render until client-side
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || status === 'loading') return;
    if (!session) {
      router.replace('/login');
      return;
    }
    // Partners only!
    const roles = Array.isArray(session.user?.roles)
      ? session.user.roles.map(r => r && r.toLowerCase())
      : [session.user?.role?.toLowerCase()];
    if (!roles.includes('partner') && !roles.includes(session.user?.partner_type)) {
      router.replace('/dashboard');
      return;
    }
  }, [session, status, hydrated, router]);

  useEffect(() => {
    if (!hydrated || !session) return;
    setLoading(true);
    // Only show bookings for this partner
    supabase
      .from('bookings')
      .select('*')
      .eq('transport_partner', session.user.partner_type)
      .eq('status', 'completed')
      .then(({ data }) => {
        setBookings(data || []);
        setLoading(false);
      });
  }, [session, hydrated]);

  // Group bookings by invoice week
  const grouped = {};
  bookings.forEach((b) => {
    const weekEnd = getInvoiceWeekEnding(b.completed_at || b.updated_at || b.created_at);
    const key = weekEnd.toISOString().slice(0, 10);
    if (!grouped[key]) grouped[key] = { weekEnd, bookings: [] };
    grouped[key].bookings.push(b);
  });
  const sortedWeeks = Object.values(grouped).sort((a, b) => b.weekEnd - a.weekEnd);

  const brandColor = partnerColors[session?.user?.partner_type?.toLowerCase()] || partnerColors.default;

  // SSR/CSR mismatch guard: nothing renders until fully loaded & validated!
  if (!hydrated || status === 'loading' || !session) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: financeBg,
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        width: '100vw',
        overflowX: 'hidden',
        paddingBottom: 40,
      }}
    >
      <div style={{
        position: 'fixed',
        top: 32,
        right: 36,
        zIndex: 3,
      }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            background: brandColor,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 30px',
            fontWeight: 700,
            fontSize: 20,
            boxShadow: `0 2px 8px ${brandColor}66`,
            cursor: 'pointer'
          }}
        >
          Log Out
        </button>
      </div>

      {/* Payment Terms Notice */}
      <div style={{
        maxWidth: 800, margin: '0 auto', marginTop: 60, marginBottom: 38,
        background: currysYellow, color: "#182338", padding: 26, borderRadius: 20,
        fontWeight: 700, fontSize: 18, boxShadow: `0 0 18px ${brandColor}70`
      }}>
        <div style={{ color: brandColor, fontSize: 22, fontWeight: 900 }}>
          Partner Self-Billing Payment Terms
        </div>
        <ul style={{ margin: 0, paddingLeft: 24, color: "#241a33", fontWeight: 700 }}>
          <li>All invoices paid <b>3 weeks in arrears</b>.</li>
          <li>Payment cycle closes <b>every Friday at 23:59</b>.</li>
          <li>
            Bookings completed by <b>Friday, {formatDate(getInvoiceWeekEnding(new Date()))}</b>
            {" "}will be paid on <b>Friday, {formatDate(getPaymentDueDate(getInvoiceWeekEnding(new Date())))}</b>.
          </li>
        </ul>
      </div>

      <div style={{ maxWidth: 1050, margin: "0 auto", padding: "0 2vw" }}>
        <h1 style={{ color: brandColor, fontWeight: 900, fontSize: 31, margin: "16px 0 32px" }}>
          Partner Invoices & Payment Cycles
        </h1>
        {loading ? (
          <div style={{ color: currysYellow, fontSize: 22, padding: 44 }}>Loading invoices...</div>
        ) : (
          sortedWeeks.map(({ weekEnd, bookings }, i) => {
            const paymentDue = getPaymentDueDate(weekEnd);
            const now = new Date();
            let status = "Pending";
            if (now >= paymentDue) status = "Due for Payment";
            if (now - paymentDue > 7 * 24 * 60 * 60 * 1000) status = "Paid";
            return (
              <div key={weekEnd} style={{
                background: brandColor,
                marginBottom: 36,
                borderRadius: 16,
                boxShadow: `0 0 18px ${brandColor}7a`,
                padding: 28
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  borderBottom: `2px solid ${currysYellow}`,
                  marginBottom: 16,
                  paddingBottom: 10
                }}>
                  <div>
                    <span style={{ fontSize: 19, fontWeight: 800, color: currysYellow }}>
                      Invoice for week ending: <span style={{ color: "#fff" }}>{formatDate(weekEnd)}</span>
                    </span>
                  </div>
                  <div style={{
                    fontSize: 17,
                    color: status === "Due for Payment" ? "#0fa" : "#ffe29c",
                    fontWeight: 700,
                  }}>
                    Payable: {formatDate(paymentDue)}
                    {" "}{status === "Due for Payment" && "🟢"}
                    {" "}{status === "Paid" && "✅"}
                  </div>
                </div>
                <table style={{
                  width: "100%",
                  background: "#222f45cc",
                  color: '#fff',
                  borderRadius: 12,
                  overflow: "hidden",
                  fontSize: 16,
                  marginBottom: 16,
                }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Booking ID</th>
                      <th style={thStyle}>Completed</th>
                      <th style={thStyle}>Amount</th>
                      <th style={thStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td style={tdStyle}>{b.id}</td>
                        <td style={tdStyle}>{b.completed_at ? formatDate(new Date(b.completed_at)) : "-"}</td>
                        <td style={tdStyle}>{b.amount ? `£${b.amount.toFixed(2)}` : "-"}</td>
                        <td style={tdStyle}>{status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })
        )}

        <Link href="/dashboard/partner" style={{
          color: brandColor,
          textDecoration: "underline",
          fontWeight: 600,
          fontSize: 17,
          display: "inline-block"
        }}>
          ← Back to partner dashboard
        </Link>
      </div>
    </div>
  );
}

const thStyle = {
  background: '#2e698c',
  color: currysYellow,
  padding: '9px 16px',
  fontWeight: 700,
  fontSize: 16
};
const tdStyle = {
  padding: '8px 12px',
  fontWeight: 400
};
