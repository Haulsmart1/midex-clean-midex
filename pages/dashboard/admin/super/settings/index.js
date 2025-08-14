import Head from 'next/head';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import { useState } from 'react';

export default function SuperAdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Midnight Express',
    maintenanceMode: false,
    supportEmail: 'support@midex.com',
  });

  const toggleMaintenance = () => {
    setSettings(prev => ({
      ...prev,
      maintenanceMode: !prev.maintenanceMode,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveSettings = () => {
    // Hook this to your API or Supabase later
    alert('✅ Settings saved (not really, this is just a mock)');
  };

  return (
    <SuperAdminLayout user={{ role: 'super admin' }}>
      <Head>
        <title>Settings | Super Admin</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="mb-4 fw-bold">⚙️ Settings Panel</h1>

        <div className="bg-dark p-4 rounded shadow-lg border border-light" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="mb-3">
            <label htmlFor="siteName" className="form-label fw-semibold">🚀 Site Name</label>
            <input
              type="text"
              id="siteName"
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="supportEmail" className="form-label fw-semibold">📧 Support Email</label>
            <input
              type="email"
              id="supportEmail"
              name="supportEmail"
              value={settings.supportEmail}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-check form-switch mb-4">
            <input
              type="checkbox"
              className="form-check-input"
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={toggleMaintenance}
            />
            <label className="form-check-label fw-semibold" htmlFor="maintenanceMode">
              🛠 Maintenance Mode
            </label>
          </div>

          <button onClick={saveSettings} className="btn w-100 fw-bold" style={{
            background: 'linear-gradient(to right, #00f7ff, #ff00ff)',
            border: 'none',
            color: 'white',
          }}>
            💾 Save Settings
          </button>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
