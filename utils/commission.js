// utils/commission.js

/**
 * Calculate commission for a booking.
 * @param {Object} booking - The booking object (should include .ferry_leg and .total_cost)
 * @param {Object} settings - App/company settings (should include .default_commission: { ferry, land })
 * @param {Object} [forwarder] - (optional) Forwarder config, can override rates
 * @returns {Object} - { commissionAmount: number, commissionPercent: number }
 */
export function getCommission(booking, settings, forwarder = null) {
  // Default to 0 if missing
  let commissionPercent = 0;

  // If a custom per-forwarder rate is passed in, use it
  if (forwarder && booking.ferry_leg && typeof forwarder.commission_percent === 'number') {
    commissionPercent = forwarder.commission_percent;
  } else if (booking.ferry_leg) {
    // Use booking-specific override or default ferry commission
    commissionPercent = booking.commission_percent 
      ?? settings?.default_commission?.ferry 
      ?? 0;
  } else {
    // Use default land commission if no ferry leg
    commissionPercent = settings?.default_commission?.land ?? 0;
  }

  // Calculate commission amount from total_cost
  const commissionAmount = Number(booking.total_cost || 0) * (commissionPercent / 100);

  return { commissionAmount, commissionPercent };
}

/*
USAGE EXAMPLES:

import { getCommission } from '@/utils/commission';

// Example 1: Most common
const { commissionAmount, commissionPercent } = getCommission(booking, settings);

// Example 2: With forwarder-specific rates
const { commissionAmount, commissionPercent } = getCommission(booking, settings, forwarder);

// commissionAmount = value in GBP/EUR/etc
// commissionPercent = % used
*/

