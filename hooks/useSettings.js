// hooks/useSettings.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-toastify';

export const useSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  const fetchSettings = async () => {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) {
      toast.error('Error fetching settings');
      setLoading(false);
      return;
    }
    const map = {};
    data.forEach(({ name, value }) => {
      map[name] = value;
    });
    setSettings(map);
    setLoading(false);
  };

  const updateSetting = async (key, value) => {
    setSavingKey(key);
    setSettings(prev => ({ ...prev, [key]: value }));

    const { error } = await supabase
      .from('settings')
      .upsert([{ name: key, value: String(value), updated_at: new Date().toISOString() }]);

    if (error) {
      toast.error(`❌ Failed to update "${key}"`);
    } else {
      toast.success(`✅ "${key}" updated`);
    }
    setSavingKey(null);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, setSettings, updateSetting, loading, savingKey };
};
