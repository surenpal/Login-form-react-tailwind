import Link from "next/link";
import { sampleVocabulary } from "@/data/sample-vocabulary";

export function VocabPreview() {
  const featuredWords = sampleVocabulary.slice(0, 4);

  return (
    <section className="paper-panel rounded-[32px] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent-deep)]">
            Sample Deck
          </p>
          <h2 className="mt-3 font-[var(--font-heading)] text-2xl font-semibold md:text-3xl">
            Vocabulary preview
          </h2>
        </div>
        <Link
          href="/study"
          className="rounded-full border border-[var(--border)] bg-white/75 px-4 py-2 text-sm font-semibold"
        >
          Open deck
        </Link>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {featuredWords.map((word) => (
          <article
            key={word.id}
            className="rounded-[26px] border border-[var(--border)] bg-white/75 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-2xl font-bold">{word.term}</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">{word.reading}</p>
              </div>
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                {word.category}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
              {word.meaning}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
