import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { z } from "zod";
import { productCatalog } from "@/lib/products";
import { getStripeClient } from "@/lib/stripe";

const planIds = productCatalog.map((plan) => plan.id) as [string, ...string[]];

const checkoutSchema = z.object({
  planId: z.enum(planIds),
  customerName: z.string().min(2).max(80),
  email: z.email(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = checkoutSchema.parse(json);
    const product = productCatalog.find((plan) => plan.id === payload.planId);

    if (!product) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    const requestUrl = new URL(request.url);
    const origin = process.env.NEXT_PUBLIC_APP_URL?.trim() || requestUrl.origin;
    const stripe = getStripeClient();
    // PayPay is available in Stripe Checkout, but the SDK types can lag preview
    // payment methods, so we narrow-cast to the documented Checkout payload.
    const paymentMethodTypes = [
      "card",
      "paypay",
    ] as unknown as Stripe.Checkout.SessionCreateParams.PaymentMethodType[];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "ja",
      customer_email: payload.email,
      payment_method_types: paymentMethodTypes,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: product.currency,
            unit_amount: product.price,
            product_data: {
              name: product.name,
              description: product.description,
            },
          },
        },
      ],
      metadata: {
        customerName: payload.customerName,
        productId: product.id,
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid checkout payload." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Checkout session creation failed.",
      },
      { status: 500 },
    );
  }
}
