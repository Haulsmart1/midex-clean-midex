'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

async function fetchBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      sender_eori,
      receiver_eori,
      commodity_codes,
      customs_invoice_url,
      customs_packing_url,
      customs_delivery_url
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error.message);
    return [];
  }
  return (data || []).map(row => ({
    id: row.id,
    senderEori: row.sender_eori || '',
    receiverEori: row.receiver_eori || '',
    commodityCodes: row.commodity_codes || [],
    customs_invoice_url: row.customs_invoice_url,
    customs_packing_url: row.customs_packing_url,
    customs_delivery_url: row.customs_delivery_url,
  }));
}

export default function CustomsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [petPhoto, setPetPhoto] = useState(null);
  const [petUrl, setPetUrl] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace('/login');
      return;
    }
    const roles = Array.isArray(session?.user?.roles)
      ? session.user.roles
      : [session?.user?.role].filter(Boolean);
    if (!roles.includes('customs_admin')) {
      router.replace('/dashboard');
      return;
    }
    fetchBookings().then(setBookings);
  }, [session, status, router]);

  const handlePetPhotoChange = (e) => {
    const file = e.target.files[0];
    setPetPhoto(file);
    if (file) setPetUrl(URL.createObjectURL(file));
  };

  if (status === "loading" || !session) return <div className="mt-4">Loading...</div>;
  const roles = Array.isArray(session?.user?.roles)
    ? session.user.roles
    : [session?.user?.role].filter(Boolean);
  if (!roles.includes('customs_admin')) return <div className="mt-4">Redirecting...</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#101214" }}>
      {/* Sidebar */}
      <nav style={{
        minWidth: 230, maxWidth: 250,
        background: "linear-gradient(135deg, #171d2a 70%, #08e7fe33 100%)",
        padding: "2rem 1rem 2rem 1.5rem",
        display: "flex", flexDirection: "column", alignItems: "center",
        borderTopRightRadius: "2.7rem", borderBottomRightRadius: "2.7rem",
        boxShadow: "4px 0 30px #00d4ff21",
      }}>
        <h2 style={{
          color: "#00eaff", fontWeight: 700, marginBottom: "2.8rem", textShadow: "0 2px 12px #011c3e"
        }}>
          <i className="bi bi-shield-lock"></i>
          <span style={{ marginLeft: 6 }}>Customs</span>
        </h2>
        <a href="/dashboard/customs" className="btn btn-gradient-primary mb-4" style={{
          width: "100%", fontWeight: 600, fontSize: "1.08em", borderRadius: 14,
          background: "linear-gradient(90deg, #01cfff 0%, #695afc 100%)",
          color: "#fff", boxShadow: "0 2px 16px #00b8f924"
        }}>
          <i className="bi bi-list-task me-2" />
          Dashboard
        </a>
        <button
          onClick={() => signOut()}
          className="btn btn-gradient-primary"
          style={{ width: "100%", borderRadius: 14, marginTop: "auto" }}>
          <i className="bi bi-box-arrow-right me-2" />
          Log Out
        </button>
        <div style={{
          marginTop: 48, textAlign: "center",
          borderTop: "1px solid #222c", paddingTop: 20, width: "90%"
        }}>
          <div style={{ color: "#0cf", marginBottom: 10, fontWeight: 500 }}>Upload Pet Photo</div>
          <label htmlFor="pet-photo-upload" style={{ cursor: "pointer" }}>
            <div style={{
              width: 80, height: 80, margin: "0 auto 12px", borderRadius: 16,
              border: "2px solid #0af", overflow: "hidden", background: "#191c2a"
            }}>
              {petUrl
                ? <img src={petUrl} alt="Pet" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{
                  color: "#777", fontSize: 30, lineHeight: "80px", display: "block"
                }}>🐾</span>
              }
            </div>
            <input
              id="pet-photo-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePetPhotoChange}
            />
            <div className="btn btn-gradient-primary" style={{ width: "100%" }}>Choose Photo</div>
          </label>
        </div>
      </nav>

      {/* Main content */}
      <main style={{
        flexGrow: 1, padding: "3.2rem 0",
        display: "flex", flexDirection: "column", alignItems: "center"
      }}>
        <h1 style={{
          color: "#08e7fe", fontWeight: 700, marginBottom: 35, fontSize: 32, textShadow: "0 2px 12px #001c2e99"
        }}>
          Customs Agent Dashboard
        </h1>
        <div style={{
          background: "rgba(20,24,38,0.99)",
          borderRadius: 18,
          padding: "2rem 2.2rem",
          boxShadow: "0 8px 36px 0 #0aefff28",
          minWidth: 820, maxWidth: 1100,
        }}>
          <table className="table table-dark table-bordered" style={{
            background: "rgba(25,30,50,0.97)",
            borderRadius: 8,
            overflow: "hidden"
          }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Sender EORI</th>
                <th>Receiver EORI</th>
                <th style={{ minWidth: 170, maxWidth: 220 }}>Commodity Codes</th>
                <th>Invoice</th>
                <th>Packing</th>
                <th>Delivery</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "#09e5fa" }}>No bookings</td>
                </tr>
              ) : (
                bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontSize: 15, fontFamily: "monospace" }}>{b.id}</td>
                    <td>{b.senderEori}</td>
                    <td>{b.receiverEori}</td>
                    <td style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {Array.isArray(b.commodityCodes)
                        ? b.commodityCodes.map(code => (
                          <span key={code} className="badge rounded-pill bg-info text-dark me-2 mb-1" style={{ fontSize: 15, display: 'inline-block' }}>
                            {code}
                          </span>
                        ))
                        : '-'
                      }
                    </td>
                    <td>
                      {b.customs_invoice_url ? <a href={b.customs_invoice_url} target="_blank" rel="noopener noreferrer">Invoice</a> : "-"}
                    </td>
                    <td>
                      {b.customs_packing_url ? <a href={b.customs_packing_url} target="_blank" rel="noopener noreferrer">Packing</a> : "-"}
                    </td>
                    <td>
                      {b.customs_delivery_url ? <a href={b.customs_delivery_url} target="_blank" rel="noopener noreferrer">Delivery</a> : "-"}
                    </td>
                    <td>
                      <a href={`/dashboard/customs/${b.id}`} className="btn btn-gradient-primary btn-sm">Details</a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
      <style jsx global>{`
        body {
          background: #101214 !important;
        }
        .btn-gradient-primary {
          background: linear-gradient(90deg, #01cfff 0%, #695afc 100%);
          color: #fff !important;
          font-weight: 600;
          border: none;
        }
        .btn-gradient-primary:hover, .btn-gradient-primary:focus {
          background: linear-gradient(90deg, #3fffdc 0%, #4d8afd 100%);
          color: #fff;
        }
      `}</style>
    </div>
  );
}
