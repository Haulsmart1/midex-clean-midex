// pages/api/invoice/index.js

import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const fields = req.body;

  // Required fields (edit as needed)
  if (!fields.booking_id || !fields.forwarder_id) {
    return res.status(400).json({ error: 'booking_id and forwarder_id are required.' });
  }

  // If you want, fetch settings here for invoice_from (company info)
  // Example: const { data: settings } = await supabase.from('settings').select('*').eq('key', 'company').single();

  const { data, error } = await supabase
    .from('invoices')
    .insert([fields])
    .select('*')
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(data);
}
