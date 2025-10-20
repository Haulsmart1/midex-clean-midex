'use client';

import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import styles from '@/styles/SuperAdminSettings.module.css';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-toastify';

export default function SuperAdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase.from('site_settings').select('*').single();
    if (error) {
      toast.error('Failed to load settings');
    } else {
      setSettings(data);
    }
    setLoading(false);
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('site_settings')
      .update(settings)
      .eq('id', settings.id);

    if (error) {
      toast.error('Failed to save settings');
    } else {
      toast.success('✅ Settings saved successfully!');
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className={styles.pageBackground}>
          <div className={styles.settingsWrapper}>Loading settings...</div>
        </div>
      </SuperAdminLayout>
    );
  }

  if (!settings) {
    return (
      <SuperAdminLayout>
        <div className={styles.pageBackground}>
          <div className={styles.settingsWrapper}>No settings found.</div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <Head>
        <title>⚙️ Super Admin Settings</title>
      </Head>

      <div className={styles.pageBackground}>
        <div className={styles.settingsWrapper}>
          <h1 className={styles.pageTitle}>🧠 Super Admin Control Panel</h1>

          <Section title="General Settings">
            <Toggle label="Site Status (Online / Maintenance)" value={settings.siteStatus} onChange={(v) => handleChange('siteStatus', v)} />
            <Select label="Language Default" options={['EN', 'FR', 'DE']} value={settings.language} onChange={(v) => handleChange('language', v)} />
          </Section>

          <Section title="Freight & Booking">
            <Toggle label="Allow Multi-Pallet" value={settings.allowMultiPallet} onChange={(v) => handleChange('allowMultiPallet', v)} />
            <Number label="Booking Window (days ahead)" value={settings.bookingWindowDays} onChange={(v) => handleChange('bookingWindowDays', v)} />
          </Section>

          <Section title="Finance & Pricing">
            <Number label="Base Pallet Rate" value={settings.baseRate} onChange={(v) => handleChange('baseRate', v)} />
            <Toggle label="Stripe Live Mode" value={settings.stripeLive} onChange={(v) => handleChange('stripeLive', v)} />
          </Section>

          <Section title="Notifications">
            <Toggle label="Send Email on Booking" value={settings.notifyBookings} onChange={(v) => handleChange('notifyBookings', v)} />
            <Toggle label="Enable SMS Alerts" value={settings.smsAlerts} onChange={(v) => handleChange('smsAlerts', v)} />
          </Section>

          <Section title="SEO & Geo">
            <Text label="Meta Title" value={settings.metaTitle} onChange={(v) => handleChange('metaTitle', v)} />
            <Text label="Canonical URL" value={settings.canonicalUrl} onChange={(v) => handleChange('canonicalUrl', v)} />
          </Section>

          <Section title="🔐 Access & Admin Control">
            <Toggle label="Enable Role Switching" value={settings.allowRoleSwitch} onChange={(v) => handleChange('allowRoleSwitch', v)} />
            <Select label="Default Admin Role" options={['admin', 'super', 'support']} value={settings.defaultAdminRole} onChange={(v) => handleChange('defaultAdminRole', v)} />
            <Number label="Max Admin Accounts" value={settings.maxAdminAccounts} onChange={(v) => handleChange('maxAdminAccounts', v)} />
            <Toggle label="Allow Admin Invite Emails" value={settings.adminInviteEmails} onChange={(v) => handleChange('adminInviteEmails', v)} />
          </Section>

          <Section title="⚙️ System Settings">
            <Toggle label="Enable Debug Mode" value={settings.debugMode} onChange={(v) => handleChange('debugMode', v)} />
            <Toggle label="Enable Feature Flags" value={settings.featureFlags} onChange={(v) => handleChange('featureFlags', v)} />
            <Toggle label="Show Beta Features" value={settings.showBetaFeatures} onChange={(v) => handleChange('showBetaFeatures', v)} />
            <Number label="Cache TTL (mins)" value={settings.cacheTTL} onChange={(v) => handleChange('cacheTTL', v)} />
          </Section>

          <Section title="💾 Backups & Logs">
            <Toggle label="Enable Auto Backups" value={settings.autoBackups} onChange={(v) => handleChange('autoBackups', v)} />
            <Select label="Backup Frequency" options={['daily', 'weekly', 'monthly']} value={settings.backupFreq} onChange={(v) => handleChange('backupFreq', v)} />
            <Toggle label="Enable Audit Logs" value={settings.auditLogs} onChange={(v) => handleChange('auditLogs', v)} />
            <Number label="Log Retention Days" value={settings.logRetention} onChange={(v) => handleChange('logRetention', v)} />
          </Section>

          <div className="text-end">
            <button onClick={handleSave} className={styles.saveButton}>
              💾 Save All Settings
            </button>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}

/* --- Reusable Components --- */
function Section({ title, children }) {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionTitle}>{title}</div>
      <div className={styles.fieldGroup}>{children}</div>
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="form-check form-switch">
      <input className="form-check-input" type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
      <label className="form-check-label ms-2">{label}</label>
    </div>
  );
}

function Number({ label, value, onChange }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input type="number" className="form-control bg-dark text-light border-secondary" value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function Text({ label, value, onChange }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input type="text" className="form-control bg-dark text-light border-secondary" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <select className="form-select bg-dark text-light border-secondary" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
