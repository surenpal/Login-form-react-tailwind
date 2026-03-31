import Stripe from "stripe";

function getStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return key;
}

export function getStripeClient() {
  return new Stripe(getStripeSecretKey(), {
    typescript: true,
  });
}
