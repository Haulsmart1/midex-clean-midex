// pages/superadmin/exports.js
import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import { useState } from 'react';
import axios from 'axios';

const TRAILERS = ['TRAILER_ONE', 'TRAILER_TWO', 'TRAILER_THREE'];

export default function ExportDashboard() {
  const [selectedTrailer, setSelectedTrailer] = useState('TRAILER_ONE');
  const [exportStatus, setExportStatus] = useState('');
  const [testMode, setTestMode] = useState(true);
  const [logs, setLogs] = useState([]);

  const fireExport = async () => {
    try {
      setExportStatus('⏳ Sending export...');
      const res = await axios.get(`/api/export-trailer?trailerId=${selectedTrailer}&test=${testMode}`);
      const message = res.data.message || '✅ Export complete!';
      setExportStatus(message);
      setLogs(prev => [`${new Date().toLocaleTimeString()} - ${message}`, ...prev.slice(0, 4)]);
    } catch (err) {
      const error = `❌ ${err.response?.data?.error || err.message}`;
      setExportStatus(error);
      setLogs(prev => [`${new Date().toLocaleTimeString()} - ${error}`, ...prev.slice(0, 4)]);
    }
  };

  return (
    <SuperAdminLayout>
      <Head>
        <title>Freight Export | Super Admin</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="mb-4">🚛 Freight Movement Control</h1>

        <div className="bg-dark p-4 rounded border border-light">
          <label className="form-label">Select Trailer</label>
          <select
            value={selectedTrailer}
            onChange={(e) => setSelectedTrailer(e.target.value)}
            className="form-select mb-3"
          >
            {TRAILERS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <div className="form-check form-switch mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              checked={testMode}
              onChange={() => setTestMode(!testMode)}
              id="testMode"
            />
            <label className="form-check-label" htmlFor="testMode">🧪 Test Mode</label>
          </div>

          <button
            onClick={fireExport}
            className="btn btn-primary"
          >
            🚀 Fire Export Now
          </button>

          {exportStatus && <div className="alert alert-info mt-3">{exportStatus}</div>}

          <div className="mt-4">
            <h5>📜 Recent Export Logs</h5>
            <ul className="list-group">
              {logs.map((log, i) => (
                <li key={i} className="list-group-item list-group-item-dark">
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
