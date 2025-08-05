import { loadStripe } from '@stripe/stripe-js';


export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

/**
 * Mocked checkStripeSubscription function
 * Replace this with real logic (e.g., fetch to your backend)
 */
export async function checkStripeSubscription(userId) {
  try {
    const response = await fetch(`/api/subscription-status?userId=${userId}`);
    const data = await response.json();
    return data?.isActive || false;
  } catch (error) {
    console.error('Subscription check failed', error);
    return false;
  }
}
