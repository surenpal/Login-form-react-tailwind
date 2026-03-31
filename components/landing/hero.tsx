import Link from "next/link";
import { ArrowRight, Coins, Smartphone, Trophy } from "lucide-react";

export function Hero() {
  return (
    <section className="section-shell mt-6">
      <div className="paper-panel overflow-hidden rounded-[36px] border border-white/40 p-6 md:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--accent-deep)]">
              Premium Mobile Learning
            </p>
            <h1 className="mt-4 max-w-3xl font-[var(--font-heading)] text-4xl font-semibold leading-tight text-balance md:text-6xl">
              Build a Japanese N1 vocabulary product people can study and buy on
              their phone.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--ink-soft)] md:text-base">
              This project is now structured as a full-stack Next.js app with a
              polished mobile-first experience, sample learning content, and a
              one-time checkout flow ready for PayPay customers in Japan.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/study"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Open Study Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white/70 px-6 py-3 text-sm font-semibold text-[var(--foreground)]"
              >
                See Pricing Flow
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[28px] bg-[var(--foreground)] p-6 text-white shadow-2xl">
              <p className="text-sm uppercase tracking-[0.28em] text-white/65">
                Launch Snapshot
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-3xl bg-white/10 p-4">
                  <Smartphone className="h-5 w-5 text-[var(--accent-soft)]" />
                  <p className="mt-3 text-xl font-semibold">Mobile-first UI</p>
                  <p className="mt-2 text-sm text-white/70">
                    Optimized for lessons, flashcards, and checkout on phones.
                  </p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <Trophy className="h-5 w-5 text-[var(--accent-soft)]" />
                  <p className="mt-3 text-xl font-semibold">JLPT focus</p>
                  <p className="mt-2 text-sm text-white/70">
                    Structured for premium N1 vocabulary learning.
                  </p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <Coins className="h-5 w-5 text-[var(--accent-soft)]" />
                  <p className="mt-3 text-xl font-semibold">Japan payments</p>
                  <p className="mt-2 text-sm text-white/70">
                    Stripe Checkout configured for card + PayPay one-time sales.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
