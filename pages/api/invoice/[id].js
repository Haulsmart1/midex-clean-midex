// pages/api/invoice/[id].js

import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    res.status(400).json({ error: 'Missing invoice id' });
    return;
  }

  if (req.method === 'GET') {
    // 🔍 Fetch one invoice (allow by RLS)
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    // 📝 Update invoice
    const fields = req.body;
    const { data, error } = await supabase
      .from('invoices')
      .update(fields)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    // 🚨 Optional: Only enable if you want deletes!
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
