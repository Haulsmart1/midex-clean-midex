// components/forwarder/BookingCard.js
import Link from 'next/link';

export default function BookingCard({ booking, onPodClick, onDocClick, processingId, onMarkDelivered, onSignOff }) {
  return (
    <div className="booking-card neon-card">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold card-title">
            🚚 {booking.booking_ref || `Booking #${booking.id?.slice(0, 8) || booking.id}`}
          </span>
          <span className="date-text">
            {booking.created_at ? new Date(booking.created_at).toLocaleString() : ''}
          </span>
        </div>
        <div className="card-content">
          <div><b>Customer:</b> {booking.customer || 'N/A'}</div>
          <div><b>Destination:</b> {booking.deliveries?.[0]?.postcode || booking.destination || 'N/A'}</div>
          <div><b>Status:</b> {booking.status || 'N/A'}</div>
          {/* More fields as needed */}
        </div>
        {/* Buttons/actions as before */}
        <div className="mt-3 card-actions card-actions-row">
          <Link
            href={`/dashboard/forwarder/bookings/${booking.id}`}
            className="btn btn-gradient-primary btn-sm card-action-btn"
          >✏️ Edit Booking</Link>
          {/* Add more buttons as props, if needed */}
        </div>
      </div>
    </div>
  );
}
