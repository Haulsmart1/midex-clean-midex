import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';

// ...mockBookings array from earlier

export default function BookingPDF() {
  const router = useRouter();
  const { id } = router.query;
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (id) {
      const found = mockBookings.find(b => b.id === id);
      setBooking(found || null);
    }
  }, [id]);

  if (!booking) return <p className="text-center mt-5">📦 Booking not found</p>;

  return (
    <>
      <Head>
        <title>Booking {booking.id}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      </Head>
      <div className="container mt-5 p-4 border rounded bg-white shadow">
        <h2 className="mb-3">🧾 Booking Summary</h2>
        <p><strong>Consignment ID:</strong> {booking.id}</p>
        <p><strong>Customer:</strong> {booking.customer}</p>
        <p><strong>Status:</strong> {booking.status}</p>
        <p><strong>Collection:</strong> {booking.collection}</p>
        <p><strong>Delivery:</strong> {booking.delivery}</p>
        <p><strong>Pallets:</strong> {booking.pallets} × {booking.palletType}</p>
        <p><strong>Total Value:</strong> {booking.value}</p>
        <p><strong>Customs Required:</strong> {booking.customs ? 'Yes' : 'No'}</p>
        <p><strong>ADR:</strong> {booking.adr ? 'Yes' : 'No'}</p>
        {booking.adrClassSpecial && (
          <p><strong>⚠ Special ADR Class (1 or 7):</strong> Yes — Manual verification required</p>
        )}
        <p><strong>Date Booked:</strong> {booking.date}</p>
        <hr />
        <div className="d-print-none text-end">
          <button className="btn btn-primary" onClick={() => window.print()}>🖨 Print or Save as PDF</button>
        </div>
      </div>
    </>
  );
}
