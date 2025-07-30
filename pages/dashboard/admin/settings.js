'use client';

import AdminLayout from '@/components/layouts/AdminLayout';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-toastify';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings') // 🔥 YOUR TABLE NAME
      .select('*')
      .single(); // Get 1 record

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
      .eq('id', settings.id); // Assuming you have `id` field

    if (error) {
      toast.error('Failed to save settings');
    } else {
      toast.success('✅ Settings saved successfully!');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container py-4 text-white">Loading settings...</div>
      </AdminLayout>
    );
  }

  if (!settings) {
    return (
      <AdminLayout>
        <div className="container py-4 text-white">No settings found.</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Admin Settings | Midnight Express</title>
      </Head>

      <div className="container py-4">
        <h1 className="mb-4">⚙️ Admin Control Panel</h1>

        {/* General Settings */}
        <Section title="General Settings">
          <Toggle label="Site Status (Online / Maintenance)" value={settings.siteStatus} onChange={(v) => handleChange('siteStatus', v)} />
          <Select label="Language Default" options={['EN', 'FR', 'DE']} value={settings.language} onChange={(v) => handleChange('language', v)} />
          <Number label="Max Daily Bookings" value={settings.maxBookings} onChange={(v) => handleChange('maxBookings', v)} />
          <Number label="Booking Window (days ahead)" value={settings.bookingWindowDays} onChange={(v) => handleChange('bookingWindowDays', v)} />
        </Section>

        {/* Freight */}
        <Section title="Booking & Freight">
          <Toggle label="Allow Multi-Pallet" value={settings.allowMultiPallet} onChange={(v) => handleChange('allowMultiPallet', v)} />
          <Toggle label="Require ADR Toggle" value={settings.requireADR} onChange={(v) => handleChange('requireADR', v)} />
          <Toggle label="Allow Document Upload" value={settings.allowUpload} onChange={(v) => handleChange('allowUpload', v)} />
          <Text label="Booking Cutoff Time (HH:mm)" value={settings.cutoffTime} onChange={(v) => handleChange('cutoffTime', v)} />
        </Section>

        {/* Finance */}
        <Section title="Finance & Pricing">
          <Select label="Currency" options={['EUR', 'GBP']} value={settings.currency} onChange={(v) => handleChange('currency', v)} />
          <Number label="Fuel Surcharge (%)" value={settings.fuelSurcharge} onChange={(v) => handleChange('fuelSurcharge', v)} />
          <Number label="Base Pallet Rate (€)" value={settings.baseRate} onChange={(v) => handleChange('baseRate', v)} />
          <Toggle label="Stripe Live Mode" value={settings.stripeLive} onChange={(v) => handleChange('stripeLive', v)} />
        </Section>

        {/* User */}
        <Section title="User & Access">
          <Toggle label="Auto-Approve New Users" value={settings.autoApproveUsers} onChange={(v) => handleChange('autoApproveUsers', v)} />
          <Toggle label="Require KYC for Forwarders" value={settings.requireKYC} onChange={(v) => handleChange('requireKYC', v)} />
          <Select label="Default User Role" options={['standard', 'forwarder', 'admin']} value={settings.defaultRole} onChange={(v) => handleChange('defaultRole', v)} />
          <Number label="Session Timeout (minutes)" value={settings.sessionTimeout} onChange={(v) => handleChange('sessionTimeout', v)} />
        </Section>

        {/* Notifications */}
        <Section title="Notifications & Alerts">
          <Toggle label="Send Admin Email on Booking" value={settings.notifyBookings} onChange={(v) => handleChange('notifyBookings', v)} />
          <Select label="Email Frequency" options={['instant', 'daily', 'weekly']} value={settings.emailFreq} onChange={(v) => handleChange('emailFreq', v)} />
          <Toggle label="Enable SMS Alerts" value={settings.smsAlerts} onChange={(v) => handleChange('smsAlerts', v)} />
          <Toggle label="Forwarder Invite Emails" value={settings.forwarderEmails} onChange={(v) => handleChange('forwarderEmails', v)} />
        </Section>

        {/* SEO */}
        <Section title="SEO & Geo">
          <Text label="Meta Title" value={settings.metaTitle} onChange={(v) => handleChange('metaTitle', v)} />
          <Text label="Canonical URL" value={settings.canonicalUrl} onChange={(v) => handleChange('canonicalUrl', v)} />
          <Select label="Geo Target" options={['EU', 'UK', 'Global']} value={settings.geoTarget} onChange={(v) => handleChange('geoTarget', v)} />
          <Select label="Sitemap Frequency" options={['daily', 'weekly', 'monthly']} value={settings.sitemapFreq} onChange={(v) => handleChange('sitemapFreq', v)} />
        </Section>

        {/* Save Button */}
        <div className="text-end">
          <button onClick={handleSave} className="btn btn-primary mt-3">
            💾 Save Settings
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

function Section({ title, children }) {
  return (
    <div className="card bg-dark text-light mb-4 shadow">
      <div className="card-header fw-bold">{title}</div>
      <div className="card-body d-grid gap-3">{children}</div>
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="form-check form-switch">
      <input
        className="form-check-input"
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label className="form-check-label ms-2">{label}</label>
    </div>
  );
}

function Number({ label, value, onChange }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input
        type="number"
        className="form-control"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function Text({ label, value, onChange }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input
        type="text"
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <select
        className="form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
