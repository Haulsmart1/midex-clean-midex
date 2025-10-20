// pages/dashboard/admin/super/haulsmart/index.js
import { useEffect, useState } from "react";
import Head from "next/head";
import { supabase } from "@/lib/supabaseClient";
import SuperAdminLayout from "@/components/layouts/SuperAdminLayout";
import tableStyles from "@/styles/Table.module.css";
import pageStyles from "@/styles/HaulSmart.module.css"; // ✅ only used here

export default function HaulSmartPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("id, consignment_ref, customer, status, created_at, total_cost")
          .eq("synced_to_haulsmart", true) // ✅ filter HaulSmart
          .order("created_at", { ascending: false });

        if (error) throw error;
        setShipments(data || []);
      } catch (err) {
        console.error("Supabase fetch error:", err.message);
        setError("Failed to load HaulSmart shipments");
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  return (
    <SuperAdminLayout>
      <Head>
        <title>🚚 HaulSmart | Super Admin</title>
      </Head>

      {/* ✅ Only HaulSmart uses gradient background */}
      <div className={pageStyles.pageBackground}>
        <h1 className={pageStyles.pageTitle}>
          🚚 HaulSmart <span style={{ color: "#ff00ff" }}>Shipments</span>
        </h1>

        {loading ? (
          <p>Loading shipments...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <div className={tableStyles.tableContainer}>
            <div className={tableStyles.tableWrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>Shipment ID</th>
                    <th>Consignment Ref</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Total £</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.length > 0 ? (
                    shipments.map((s) => (
                      <tr key={s.id}>
                        <td>{s.id.slice(0, 8)}...</td>
                        <td>{s.consignment_ref || "-"}</td>
                        <td>{s.customer || "-"}</td>
                        <td>
                          <span
                            className={`${tableStyles.badge} ${
                              s.status === "Delivered"
                                ? tableStyles.badgeSuccess
                                : s.status === "In Transit"
                                ? tableStyles.badgeWarning
                                : tableStyles.badgeError
                            }`}
                          >
                            {s.status || "—"}
                          </span>
                        </td>
                        <td>{new Date(s.created_at).toLocaleDateString()}</td>
                        <td>£{Number(s.total_cost || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className={tableStyles.emptyText}>
                        No HaulSmart shipments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}

