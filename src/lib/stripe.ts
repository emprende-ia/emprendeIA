// This file is the single source of truth for initializing the Stripe client.
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * A function that returns a singleton instance of the Stripe client.
 * It ensures that environment variables are loaded and that the Stripe
 * client is only initialized once.
 * 
 * @returns {Stripe} The initialized Stripe client instance.
 * @throws {Error} If the STRIPE_SECRET_KEY is not set in the environment variables.
 */
export function getStripe(): Stripe {
  // If the instance already exists, return it.
  if (stripeInstance) {
    return stripeInstance;
  }

  // Load the secret key from environment variables.
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  // Check if the key is present. If not, throw an error to stop execution.
  // This is a critical failure, and the application cannot proceed without it.
  if (!stripeSecretKey) {
    throw new Error(
      'FATAL: STRIPE_SECRET_KEY environment variable is not set. Please set the key in your .env file.'
    );
  }

  // Create the new Stripe instance.
  stripeInstance = new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
    // Add any other default configuration for Stripe here.
  });

  return stripeInstance;
}
