// FULL FILE — server API; uses a per-request Supabase client bound to the user's access token
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { createClient } from '@supabase/supabase-js';
import { getCommission } from '@/utils/commission';

function supabaseForUser(accessToken) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, anon, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not signed in' });

  const supabase = supabaseForUser(session.user.supabaseAccessToken);

  const { booking_id } = req.body || {};
  if (!booking_id) return res.status(400).json({ error: 'Missing booking_id' });

  // 1) Fetch booking owned by this forwarder
  const { data: booking, error: bookingErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', booking_id)
    .eq('forwarder_id', session.user.id)
    .maybeSingle();

  if (bookingErr) return res.status(400).json({ error: bookingErr.message });
  if (!booking) return res.status(404).json({ error: 'Booking not found or not owned by you' });

  if (booking.status === 'signed_off') {
    return res.status(400).json({ error: 'Booking already signed off' });
  }
  if (!booking.docs_uploaded) {
    return res.status(400).json({ error: 'Documents must be uploaded before signing off' });
  }

  // 2) Load company invoice settings
  const { data: companySetting, error: settingsErr } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'company')
    .maybeSingle();

  if (settingsErr) return res.status(500).json({ error: settingsErr.message });
  if (!companySetting?.value) return res.status(500).json({ error: 'Missing company invoice settings' });

  // 3) Commission
  const { commissionAmount, commissionPercent } = getCommission(booking, {
    default_commission: { ferry: 10, land: 5 },
  });

  const invoice_to = {
    name: booking.customer || '',
    address: booking.customer_address || '',
  };

  // 4) Create invoice (idempotent on (booking_id,user_id) if you have a unique index; else simple insert)
  const { error: invoiceErr } = await supabase.from('invoices').insert({
    booking_id: booking.id,
    user_id: booking.forwarder_id,
    invoice_number: '',
    invoice_from: companySetting.value,
    invoice_to,
    subtotal: booking.total_cost || 0,
    commission_amount: commissionAmount,
    commission_percent: commissionPercent,
    vat: booking.vat || 0,
    total: booking.total_cost || 0,
    status: 'draft',
  });

  if (invoiceErr) return res.status(400).json({ error: invoiceErr.message });

  // 5) Update booking status
  const { error: updateErr } = await supabase
    .from('bookings')
    .update({ status: 'signed_off' })
    .eq('id', booking_id)
    .eq('forwarder_id', session.user.id);

  if (updateErr) return res.status(400).json({ error: updateErr.message });

  return res.status(200).json({ success: true, booking_id: booking.id });
}
