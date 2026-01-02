
import { BeautyVendor, Product, OrderFees } from '../types';

/**
 * Calculates a dynamic price for a product based on the specific store's tier and location factors.
 * This ensures "flexible" pricing per store as requested.
 */
export const calculateDynamicProductPrice = (product: Product, vendor: BeautyVendor) => {
  const baseMin = product.priceRange.min;
  const baseMax = product.priceRange.max;
  
  // Pricing Multipliers
  let multiplier = 1.0;
  
  // 1. Tier-based adjustments
  if (vendor.pricingTier === 'PREMIUM') multiplier += 0.15; // +15% for premium hubs
  if (vendor.pricingTier === 'ECONOMY') multiplier -= 0.10; // -10% for economy outlets
  
  // 2. Velocity/Demand adjustment (Dynamic surge)
  if (vendor.velocity && vendor.velocity < 15) {
    multiplier += 0.05; // High velocity stores (fast runners) might have a slight premium for convenience
  }
  
  return {
    min: baseMin * multiplier,
    max: baseMax * multiplier
  };
};

/**
 * Calculates the full order fees including dynamic surcharges.
 */
export const calculateOrderFees = (cartItems: { priceRange: { max: number }, quantity: number }[], vendor: BeautyVendor): OrderFees => {
  const shelfPriceEstimate = cartItems.reduce((acc, item) => acc + (item.priceRange.max * item.quantity), 0);
  
  const runnerBase = 4.99;
  const runnerDistanceFee = (vendor.distance || 0) * 0.75; // $0.75 per mile
  const runnFee = runnerBase + runnerDistanceFee;
  
  const serviceFlat = 2.99;
  const serviceVariable = shelfPriceEstimate * 0.08; // 8% service fee
  const serviceFee = serviceFlat + serviceVariable;
  
  // Dynamic Urgency Surcharge based on store velocity
  let urgencySurcharge = 0;
  if (vendor.velocity && vendor.velocity < 10) urgencySurcharge = 2.50;

  const authHoldTotal = shelfPriceEstimate + runnFee + serviceFee + urgencySurcharge;

  return {
    shelfPriceEstimate,
    runnFee,
    serviceFee,
    urgencySurcharge,
    authHoldTotal
  };
};
