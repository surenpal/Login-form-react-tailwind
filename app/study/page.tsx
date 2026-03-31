import { StudyDeck } from "@/components/study/study-deck";
import { AppHeader } from "@/components/shared/app-header";
import { sampleVocabulary } from "@/data/sample-vocabulary";

export default function StudyPage() {
  return (
    <main className="pb-16">
      <AppHeader />
      <section className="section-shell mt-8">
        <div className="paper-panel rounded-[32px] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent-deep)]">
                Study Mode
              </p>
              <h1 className="mt-3 font-[var(--font-heading)] text-3xl font-bold md:text-5xl">
                JLPT N1 vocabulary trainer
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)] md:text-base">
                This starter includes sample data so the product is usable today.
                When you add your PDF, we can replace these cards with your real
                N1 reference set.
              </p>
            </div>
            <div className="rounded-3xl bg-white/70 px-4 py-3 text-sm text-[var(--ink-soft)]">
              <span className="font-semibold text-[var(--foreground)]">
                {sampleVocabulary.length}
              </span>{" "}
              starter words loaded
            </div>
          </div>
        </div>
      </section>
      <section className="section-shell mt-6">
        <StudyDeck words={sampleVocabulary} />
      </section>
    </main>
  );
}
