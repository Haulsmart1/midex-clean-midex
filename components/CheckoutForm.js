import { useState } from 'react';
import { stripePromise } from '../utils/stripe';

export default function CheckoutForm({ items }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const stripe = await stripePromise;

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: items.bookingId,
          amount: items.amount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Stripe redirect error:', error.message);
      }
    } catch (err) {
      console.error('Checkout error:', err.message);
    }

    setLoading(false);
  };

  return (
    <button onClick={handleCheckout} disabled={loading} style={{
      padding: '10px 20px',
      fontSize: '16px',
      fontWeight: 'bold',
      borderRadius: '6px',
      backgroundColor: loading ? '#666' : '#007bff',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease'
    }}>
      {loading ? 'Processing...' : 'Checkout'}
    </button>
  );
}
