import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <main className="section-shell flex min-h-screen items-center py-10">
      <section className="paper-panel mx-auto w-full max-w-2xl rounded-[32px] p-8 text-center">
        <RotateCcw className="mx-auto h-14 w-14 text-[var(--accent)]" />
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent-deep)]">
          Checkout canceled
        </p>
        <h1 className="mt-3 font-[var(--font-heading)] text-3xl font-bold">
          The user can try again any time
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)] md:text-base">
          The payment session was canceled before completion. This page is useful
          for handling returns from card or PayPay checkout without losing the
          sales flow.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/pricing"
            className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Return to pricing
          </Link>
        </div>
      </section>
    </main>
  );
}
