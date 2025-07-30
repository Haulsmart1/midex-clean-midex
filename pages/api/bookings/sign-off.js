import { supabase } from '@/lib/supabaseClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getCommission } from '@/utils/commission';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session)
    return res.status(401).json({ error: 'Not signed in' });

  const { booking_id } = req.body;
  if (!booking_id)
    return res.status(400).json({ error: 'Missing booking_id' });

  const { data: booking, error: bookingFetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', booking_id)
    .eq('forwarder_id', session.user.id)
    .single();

  if (bookingFetchError || !booking)
    return res.status(404).json({ error: 'Booking not found or not owned' });

  // --- RELAXED: Allow sign-off if not already signed_off and docs_uploaded ---
  if (booking.status === 'signed_off')
    return res.status(400).json({ error: 'Booking already signed off' });

  if (!booking.docs_uploaded)
    return res.status(400).json({ error: 'Required documents not uploaded' });

  // Allow "booked", "delivered", "ready", etc. (for demo/dev)
  // In real prod, restrict as needed.
  // --- END RELAXED ---

  const { data: settingsData, error: settingsError } = await supabase
    .from('settings')
    .select('*')
    .eq('key', 'company')
    .single();

  if (settingsError || !settingsData)
    return res.status(500).json({ error: 'Company settings missing' });
  const company = settingsData.value || {};

  const { commissionAmount, commissionPercent } = getCommission(booking, {
    default_commission: {
      ferry: 10,
      land: 5,
    }
  });

  const invoiceTo = {
    name: booking.customer || '', // adjust field as needed
    address: booking.customer_address || '',
  };

  try {
    // (1) Create invoice FIRST
    const { error: invoiceError } = await supabase.from('invoices').insert({
      booking_id: booking.id,
      forwarder_id: booking.forwarder_id,
      invoice_number: '',
      invoice_from: company,
      invoice_to: invoiceTo,
      subtotal: booking.total_cost || 0,
      commission_amount: commissionAmount,
      commission_percent: commissionPercent,
      vat: booking.vat || 0,
      total: booking.total_cost || 0,
      status: 'draft'
    });

    if (invoiceError) {
      console.error('Invoice creation error:', invoiceError);
      throw new Error(invoiceError.message || 'Failed to create invoice');
    }

    // (2) Only update booking status to signed_off if invoice was created
    const { error: bookingUpdateError } = await supabase
      .from('bookings')
      .update({ status: 'signed_off' })
      .eq('id', booking_id)
      .eq('forwarder_id', session.user.id);

    if (bookingUpdateError) {
      console.error('Booking update error:', bookingUpdateError);
      throw new Error(bookingUpdateError.message || 'Failed to update booking status');
    }

    return res.status(200).json({ success: true, booking_id: booking.id });

  } catch (err) {
    console.error('Sign-off API error:', err);
    return res.status(500).json({ error: err.message || 'Unknown server error' });
  }
}
