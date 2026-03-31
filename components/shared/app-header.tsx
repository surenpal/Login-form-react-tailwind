import Link from "next/link";
import { BookText, CreditCard, Sparkles } from "lucide-react";

export function AppHeader() {
  return (
    <header className="section-shell pt-5">
      <div className="paper-panel flex items-center justify-between rounded-full px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--foreground)] text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-[var(--font-heading)] text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">
              N1 Vocabulary
            </p>
            <p className="text-sm text-[var(--ink-soft)]">N1 vocabulary studio</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          <Link
            href="/study"
            className="rounded-full px-4 py-2 text-sm font-medium text-[var(--ink-soft)] transition hover:bg-white/70 hover:text-[var(--foreground)]"
          >
            <span className="inline-flex items-center gap-2">
              <BookText className="h-4 w-4" />
              Study
            </span>
          </Link>
          <Link
            href="/pricing"
            className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            <span className="inline-flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pricing
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
