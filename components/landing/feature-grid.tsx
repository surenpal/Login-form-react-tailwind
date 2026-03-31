import { BookOpenText, BrainCircuit, Database, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: BookOpenText,
    title: "Structured learning",
    description:
      "Vocabulary cards include kana, meaning, tags, and examples so the app feels like a proper study product, not just a static word list.",
  },
  {
    icon: BrainCircuit,
    title: "Study experience",
    description:
      "Search, save, filter, and reveal answers inside a touch-friendly interface that works well on phones and tablets.",
  },
  {
    icon: Database,
    title: "Backend ready",
    description:
      "Prisma models are included for purchases and progress so we can extend this into accounts, analytics, and gated content cleanly.",
  },
  {
    icon: ShieldCheck,
    title: "Production payment flow",
    description:
      "Stripe webhooks handle fulfillment events server-side, which is the reliable path for real purchases and access control.",
  },
];

export function FeatureGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {features.map((feature) => (
        <article
          key={feature.title}
          className="paper-panel rounded-[28px] p-6 transition hover:-translate-y-0.5"
        >
          <feature.icon className="h-6 w-6 text-[var(--accent)]" />
          <h2 className="mt-4 font-[var(--font-heading)] text-2xl font-semibold">
            {feature.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)] md:text-base">
            {feature.description}
          </p>
        </article>
      ))}
    </div>
  );
}
