// File: /pages/dashboard/partner/[partner]/user.js

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient"; // adjust path if needed

export default function PartnerUserBookings() {
  const router = useRouter();
  const { partner } = router.query;
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // 1. Auth + Role Check
  useEffect(() => {
    async function checkAuthAndFetch() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        setError("You must be logged in.");
        setLoading(false);
        router.push("/login");
        return;
      }
      // Fetch user details (from your "users" table)
      const { data: profile, error: profileErr } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (profileErr || !profile) {
        setError("No profile found.");
        setLoading(false);
        return;
      }
      setUser(profile);

      // Role + partner check
      if (
        profile.role !== "user" ||
        profile.partner_type !== partner
      ) {
        setError("No Access");
        setLoading(false);
        return;
      }

      // 2. Fetch bookings for this user (customize as needed)
      const { data: bookingsData, error: bookingsErr } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", session.user.id); // or filter by partner if needed
      if (bookingsErr) {
        setError("Could not fetch bookings.");
        setLoading(false);
        return;
      }
      setBookings(bookingsData);
      setLoading(false);
    }
    if (partner) checkAuthAndFetch();
  }, [partner, router]);

  // 3. UI
  if (loading) return <div style={style.loading}>Loading...</div>;
  if (error) return <div style={style.error}>{error}</div>;

  return (
    <div style={style.container}>
      <h2 style={style.header}>My Bookings ({bookings.length})</h2>
      {bookings.length === 0 ? (
        <div style={style.empty}>No bookings found.</div>
      ) : (
        <table style={style.table}>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Date</th>
              <th>Status</th>
              {/* Add more columns as needed */}
            </tr>
          </thead>
          <tbody>
            {bookings.map((bk) => (
              <tr key={bk.id}>
                <td>{bk.id}</td>
                <td>{new Date(bk.created_at).toLocaleString()}</td>
                <td>{bk.status}</td>
                {/* Add more data as needed */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// --- Inline Styles (quick boilerplate)
const style = {
  container: {
    maxWidth: 600, margin: "50px auto", padding: 30, background: "#181434cc",
    borderRadius: 18, color: "#fff", fontFamily: "Inter, Arial, sans-serif",
  },
  header: { textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 30, color: "#ffd900" },
  loading: { textAlign: "center", marginTop: 50, fontSize: 18, color: "#fff" },
  error: { textAlign: "center", marginTop: 50, fontSize: 18, color: "#ff4677" },
  empty: { textAlign: "center", marginTop: 30, color: "#eee", fontWeight: 500 },
  table: { width: "100%", background: "#232244", borderRadius: 12, overflow: "hidden" }
};
