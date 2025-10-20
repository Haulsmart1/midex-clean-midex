// pages/dashboard/admin/super/booking/exports/index.js

import Head from "next/head";
import SuperAdminLayout from "@/components/layouts/SuperAdminLayout";
import styles from '@/styles/Exports.module.css';
import { useState } from "react";
import axios from "axios";

const TRAILERS = ["TRAILER_ONE", "TRAILER_TWO", "TRAILER_THREE"];

export default function ExportDashboard() {
  const [selectedTrailer, setSelectedTrailer] = useState("TRAILER_ONE");
  const [exportStatus, setExportStatus] = useState("");
  const [testMode, setTestMode] = useState(true);
  const [logs, setLogs] = useState([]);

  const fireExport = async () => {
    try {
      setExportStatus("⏳ Sending export...");
      const res = await axios.get(
        `/api/export-trailer?trailerId=${selectedTrailer}&test=${testMode}`
      );
      const message = res.data.message || "✅ Export complete!";
      setExportStatus(message);
      setLogs((prev) => [
        `${new Date().toLocaleTimeString()} - ${message}`,
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      const error = `❌ ${err.response?.data?.error || err.message}`;
      setExportStatus(error);
      setLogs((prev) => [
        `${new Date().toLocaleTimeString()} - ${error}`,
        ...prev.slice(0, 4),
      ]);
    }
  };

  return (
    <SuperAdminLayout user={{ role: "super admin" }}>
      <Head>
        <title>🚛 Exports | Super Admin</title>
      </Head>

      <div className={styles.pageBackground}>
        <h1 style={{ marginBottom: "20px" }}>🚛 Freight Export Control Panel</h1>

        <div className={styles.tableWrapper}>
          <label>Select Trailer</label>
          <select
            value={selectedTrailer}
            onChange={(e) => setSelectedTrailer(e.target.value)}
            className="form-select mb-3"
          >
            {TRAILERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div className="form-check form-switch mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              checked={testMode}
              onChange={() => setTestMode(!testMode)}
              id="testMode"
            />
            <label className="form-check-label" htmlFor="testMode">
              🧪 Test Mode
            </label>
          </div>

          <button
            onClick={fireExport}
            style={{
              background: "linear-gradient(to right, #00f7ff, #ff00ff)",
              color: "#000",
              fontWeight: "bold",
              width: "100%",
              padding: "0.75rem",
              border: "none",
              borderRadius: "6px",
              marginBottom: "10px",
            }}
          >
            🚀 Fire Export Now
          </button>

          {exportStatus && (
            <div style={{ marginTop: "15px", color: "white", fontWeight: "500" }}>
              {exportStatus}
            </div>
          )}

          <div className="mt-4">
            <h5>📜 Export Logs</h5>
            <ul>
              {logs.map((log, i) => (
                <li key={i} style={{ color: "#ccc", fontSize: "14px" }}>
                  {log}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
