"use client";

import { Check, LoaderCircle, Wallet } from "lucide-react";
import { useCheckout } from "@/components/pricing/use-checkout";

type PricingCardProps = {
  expanded?: boolean;
};

export function PricingCard({ expanded = false }: PricingCardProps) {
  const checkout = useCheckout();

  return (
    <section className="paper-panel rounded-[32px] p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent-deep)]">
            Launch Offer
          </p>
          <h2 className="mt-3 font-[var(--font-heading)] text-2xl font-semibold md:text-3xl">
            Lifetime premium access
          </h2>
        </div>
        <span className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white">
          JPY {checkout.plan.price.toLocaleString("ja-JP")}
        </span>
      </div>

      <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)] md:text-base">
        Sell a one-time unlock for the full vocabulary library, quizzes, and future
        study packs. This is aligned with Stripe&apos;s PayPay support for one-time
        payments in Japan.
      </p>

      <div className="mt-6 grid gap-3">
        {checkout.plan.benefits.map((benefit) => (
          <div
            key={benefit}
            className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-sm text-[var(--foreground)]"
          >
            <Check className="h-4 w-4 text-[var(--teal)]" />
            <span>{benefit}</span>
          </div>
        ))}
      </div>

      <form className="mt-6 grid gap-4" onSubmit={checkout.handleCheckout}>
        <label className="grid gap-2 text-sm font-medium">
          Full name
          <input
            required
            minLength={2}
            value={checkout.customerName}
            onChange={(event) => checkout.setCustomerName(event.target.value)}
            placeholder="Aiko Tanaka"
            className="rounded-2xl border border-[var(--border)] bg-white/85 px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Email
          <input
            required
            type="email"
            value={checkout.email}
            onChange={(event) => checkout.setEmail(event.target.value)}
            placeholder="learner@example.com"
            className="rounded-2xl border border-[var(--border)] bg-white/85 px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
        </label>

        <button
          type="submit"
          disabled={checkout.pending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)] disabled:cursor-wait disabled:opacity-75"
        >
          {checkout.pending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Creating checkout
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4" />
              Pay with card or PayPay
            </>
          )}
        </button>
      </form>

      {checkout.error ? (
        <p className="mt-3 text-sm text-[var(--accent-deep)]">{checkout.error}</p>
      ) : null}

      {expanded ? (
        <p className="mt-5 text-sm leading-7 text-[var(--ink-soft)]">
          To go live, connect your Stripe account in Japan, enable PayPay in the
          Stripe Dashboard, and set the secret keys in your environment file.
        </p>
      ) : null}
    </section>
  );
}
