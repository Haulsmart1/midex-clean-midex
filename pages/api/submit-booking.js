export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      collectionCompany,
      collectionContact,
      collectionAddress,
      collectionPhone,
      collectionAsap,
      deliveryCompany,
      deliveryContact,
      deliveryAddress,
      deliveryPhone,
      deliveryAsap,
      pallets,
      hasForkliftPickup,
      hasForkliftDelivery,
      adr,
      adrClassSpecial,
      quote
    } = req.body;

    if (
      !collectionAddress || !deliveryAddress || !pallets?.length ||
      !quote || typeof quote.total !== 'number'
    ) {
      return res.status(400).json({ error: 'Missing booking fields' });
    }

    // 🧾 This is where you'd store the data in a database, for now just log:
    console.log('📥 NEW BOOKING RECEIVED:', {
      collectionCompany,
      collectionContact,
      collectionAddress,
      collectionPhone,
      collectionAsap,
      deliveryCompany,
      deliveryContact,
      deliveryAddress,
      deliveryPhone,
      deliveryAsap,
      pallets,
      hasForkliftPickup,
      hasForkliftDelivery,
      adr,
      adrClassSpecial,
      quote
    });

    // 🔐 Optional: Save to a database or forward to a webhook/email here

    return res.status(200).json({ success: true, message: 'Booking saved' });

  } catch (err) {
    console.error('❌ Booking Error:', err);
    return res.status(500).json({ error: 'Server error saving booking' });
  }
}
