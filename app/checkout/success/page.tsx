import Link from "next/link";
import { CircleCheckBig } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <main className="section-shell flex min-h-screen items-center py-10">
      <section className="paper-panel mx-auto w-full max-w-2xl rounded-[32px] p-8 text-center">
        <CircleCheckBig className="mx-auto h-14 w-14 text-[var(--teal)]" />
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--teal)]">
          Payment received
        </p>
        <h1 className="mt-3 font-[var(--font-heading)] text-3xl font-bold">
          Purchase completed successfully
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)] md:text-base">
          Your payment flow is set up. In production, this page pairs with the
          Stripe webhook to mark the customer as paid and unlock premium content.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/study"
            className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Open Study Mode
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[var(--border)] bg-white/80 px-6 py-3 text-sm font-semibold text-[var(--foreground)]"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
