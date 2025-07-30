// pages/dashboard/admin/bookings/create.js

import dynamic from 'next/dynamic';
import AdminLayout from '@/components/layouts/AdminLayout';
const BookingSliderWizard = dynamic(
  () => import('@/components/bookings/BookingSliderWizard'),
  { ssr: false }
);

function AdminCreateBooking() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: '#0cf' }}>📦 Create Booking (Admin)</h2>
      <BookingSliderWizard role="admin" />
    </div>
  );
}

AdminCreateBooking.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminCreateBooking;
