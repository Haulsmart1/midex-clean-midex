import Head from 'next/head';
import SuperAdminLayout from '../../../components/layouts/SuperAdminLayout';
import { useSettings } from '@/hooks/useSettings';
import { settingsFields } from '@/config/settingsFields';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SuperSettings() {
  const { settings, setSettings, updateSetting, loading, savingKey } = useSettings();

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="container py-4 text-white">
          <h1 className="mb-3">System Settings</h1>
          <p>Loading settings...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <Head>
        <title>Settings | Super Admin</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="mb-4">System Settings</h1>

        <div className="row">
          {settingsFields.map(({ key, label, type }) => (
            <div className="col-md-6 mb-4" key={key}>
              {type === 'toggle' ? (
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={key}
                    checked={settings[key] === 'true'}
                    onChange={(e) => updateSetting(key, e.target.checked.toString())}
                  />
                  <label className="form-check-label" htmlFor={key}>
                    {label}
                    {savingKey === key && <span className="ms-2 spinner-border spinner-border-sm" />}
                  </label>
                </div>
              ) : (
                <>
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    className="form-control"
                    value={settings[key] || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
                    onBlur={(e) => updateSetting(key, e.target.value)}
                  />
                </>
              )}
            </div>
          ))}
        </div>

        <ToastContainer />
      </div>
    </SuperAdminLayout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
