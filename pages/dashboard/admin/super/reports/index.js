// pages/dashboard/admin/super/reports/index.js

import Head from 'next/head';
import { useEffect, useState } from 'react';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import { supabase } from '@/lib/supabaseClient';
import styles from '@/styles/Exports.module.css'; // or Reports.module.css if split later

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, consignment_ref, customer, status, created_at, trailer_id")
        .not("trailer_id", "is", null) // ✅ Only bookings with trailers (exported)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase fetch error:", error.message);
        setError("Failed to fetch export reports.");
      } else {
        setReports(data || []);
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>📋 Reports | Super Admin</title>
      </Head>

      <div className={styles.pageBackground}>
        <h1 style={{ marginBottom: "20px" }}>📋 Export Reports</h1>

        {loading ? (
          <p>Loading reports...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Consignment Ref</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Trailer</th>
                  <th>Exported At</th>
                </tr>
              </thead>
              <tbody>
                {reports.length > 0 ? (
                  reports.map((r) => (
                    <tr key={r.id}>
                      <td>{r.consignment_ref || "-"}</td>
                      <td>{r.customer || "-"}</td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            r.status === "Delivered"
                              ? styles.badgeSuccess
                              : r.status === "In Transit"
                              ? styles.badgeWarning
                              : styles.badgeError
                          }`}
                        >
                          {r.status || "—"}
                        </span>
                      </td>
                      <td>{r.trailer_id || "-"}</td>
                      <td>{new Date(r.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className={styles.emptyText}>
                      No exported bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
