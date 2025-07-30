// components/CountdownClock.js
import { useEffect, useState } from 'react';

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const cutoff = new Date();
      cutoff.setHours(12, 0, 0, 0); // ⏰ New cutoff: 12:00 noon

      if (new Date() > cutoff) {
        cutoff.setDate(cutoff.getDate() + 1);
      }

      const diff = cutoff - new Date();
      const h = Math.floor(diff / 1000 / 60 / 60);
      const m = Math.floor((diff / 1000 / 60) % 60);
      setTimeLeft(`${h}h ${m}m`);
    };

    const timer = setInterval(updateClock, 60000);
    updateClock();

    return () => clearInterval(timer);
  }, []);

  return (
    <p className="deadline-clock" style={{ marginTop: '1rem', fontWeight: 'bold', color: '#ccc' }}>
      Cut-off for depot bookings: {timeLeft}
    </p>
  );
}
