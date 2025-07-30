import { useState } from 'react';
import axios from 'axios';

const TRAILERS = ['TRAILER_ONE', 'TRAILER_TWO', 'TRAILER_THREE'];

export default function ExportControlPanel() {
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
    <div style={{
      backgroundColor: '#111',
      padding: '2rem',
      borderRadius: '8px',
      color: 'white',
      marginTop: '2rem',
      fontFamily: 'sans-serif'
    }}>
      <h2>🚛 Export Trailer Control</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Trailer:</label>
        <select
          value={selectedTrailer}
          onChange={(e) => setSelectedTrailer(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px' }}
        >
          {TRAILERS.map(trailer => (
            <option key={trailer} value={trailer}>{trailer}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={testMode}
            onChange={() => setTestMode(!testMode)}
            style={{ marginRight: '0.5rem' }}
          />
          🧪 Test Mode
        </label>
      </div>

      <button
        onClick={fireExport}
        style={{
          padding: '10px 20px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        🚀 Fire Export Now
      </button>

      {exportStatus && (
        <p style={{ marginTop: '1rem', color: exportStatus.includes('❌') ? 'red' : '#0f0' }}>
          {exportStatus}
        </p>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3>📜 Recent Export Logs</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {logs.map((log, i) => (
            <li key={i} style={{ fontSize: '0.9rem' }}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
