// pages/dashboard/users/bookings/create.js

import dynamic from 'next/dynamic';
import UserLayout from '@/components/layouts/UsersLayout';
import BookingReviewSlide from '@/components/common/BookingReviewSlide';
const BookingSliderWizard = dynamic(
  () => import('@/components/bookings/BookingSliderWizard'),
  { ssr: false }
);

function UserCreateBooking() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: '#0cf' }}>🧍 Create Booking</h2>
      <BookingSliderWizard role="user" />
    </div>
  );
}

// 👇 Ensures UsersLayout (with sidebar) wraps the page
UserCreateBooking.getLayout = function getLayout(page) {
  return <UserLayout>{page}</UserLayout>;
};

export default UserCreateBooking;
