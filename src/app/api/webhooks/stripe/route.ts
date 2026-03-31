import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return new Response("Missing STRIPE_WEBHOOK_SECRET.", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature.", { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : "Invalid webhook signature.",
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;

        await prisma.purchase.upsert({
          where: {
            stripeCheckoutSessionId: session.id,
          },
          create: {
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
            email:
              session.customer_details?.email ??
              session.customer_email ??
              "unknown@example.com",
            customerName:
              session.metadata?.customerName ??
              session.customer_details?.name ??
              null,
            productId: session.metadata?.productId ?? "unknown-product",
            amount: session.amount_total ?? 0,
            currency: session.currency ?? "jpy",
            status: session.payment_status,
          },
          update: {
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
            status: session.payment_status,
          },
        });
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;

        await prisma.purchase.upsert({
          where: {
            stripeCheckoutSessionId: session.id,
          },
          create: {
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
            email:
              session.customer_details?.email ??
              session.customer_email ??
              "unknown@example.com",
            customerName:
              session.metadata?.customerName ??
              session.customer_details?.name ??
              null,
            productId: session.metadata?.productId ?? "unknown-product",
            amount: session.amount_total ?? 0,
            currency: session.currency ?? "jpy",
            status: "failed",
          },
          update: {
            status: "failed",
          },
        });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : "Webhook handling failed.",
      { status: 500 },
    );
  }

  return new Response("ok", { status: 200 });
}
