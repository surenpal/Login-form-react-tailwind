import { PricingCard } from "@/components/pricing/pricing-card";
import { AppHeader } from "@/components/shared/app-header";

export default function PricingPage() {
  return (
    <main className="pb-16">
      <AppHeader />
      <section className="section-shell mt-8">
        <div className="paper-panel rounded-[32px] p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent-deep)]">
            Pricing
          </p>
          <h1 className="mt-3 font-[var(--font-heading)] text-3xl font-bold md:text-5xl">
            Sell premium access in Japan
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)] md:text-base">
            The checkout flow is wired for one-time JPY payments through Stripe
            Checkout with PayPay enabled. This is a strong launch setup for
            Japanese customers buying a course or lifetime unlock.
          </p>
        </div>
      </section>
      <section className="section-shell mt-6">
        <PricingCard expanded />
      </section>
    </main>
  );
}
