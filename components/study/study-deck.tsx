"use client";

import { useMemo, useState } from "react";
import { Bookmark, BookOpen, Search, Sparkles } from "lucide-react";
import type { VocabularyWord } from "@/types";

type StudyDeckProps = {
  words: VocabularyWord[];
};

export function StudyDeck({ words }: StudyDeckProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);

  const categories = useMemo(
    () => ["All", ...new Set(words.map((word) => word.category))],
    [words],
  );

  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      const matchesCategory =
        selectedCategory === "All" || word.category === selectedCategory;
      const lookup =
        `${word.term} ${word.reading} ${word.meaning} ${word.example.jp} ${word.example.en}`.toLowerCase();
      return matchesCategory && lookup.includes(query.toLowerCase());
    });
  }, [query, selectedCategory, words]);

  function toggleSaved(id: string) {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
  }

  function toggleReveal(id: string) {
    setRevealedIds((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
  }

  return (
    <section className="grid gap-6">
      <div className="paper-panel rounded-[32px] p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <label className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-white/80 px-4 py-3">
            <Search className="h-4 w-4 text-[var(--ink-soft)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search kanji, kana, meaning, or example"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const active = category === selectedCategory;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--foreground)] text-white"
                      : "border border-[var(--border)] bg-white/75 text-[var(--ink-soft)]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredWords.map((word) => {
          const saved = savedIds.includes(word.id);
          const revealed = revealedIds.includes(word.id);

          return (
            <article key={word.id} className="paper-panel rounded-[28px] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-deep)]">
                    {word.level}
                  </p>
                  <h2 className="mt-2 text-3xl font-bold">{word.term}</h2>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">{word.reading}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSaved(word.id)}
                  className={`rounded-full p-2 transition ${
                    saved
                      ? "bg-[var(--gold)] text-white"
                      : "bg-white/75 text-[var(--ink-soft)]"
                  }`}
                  aria-label={`Save ${word.term}`}
                >
                  <Bookmark className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 rounded-[24px] bg-white/75 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">
                  Meaning
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">
                  {revealed
                    ? word.meaning
                    : "Tap reveal to test yourself before checking the answer."}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {word.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-deep)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 grid gap-3 text-sm leading-7 text-[var(--ink-soft)]">
                <div className="rounded-[24px] border border-[var(--border)] bg-[#fffaf4] p-4">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">
                    <BookOpen className="h-3.5 w-3.5" />
                    Example
                  </p>
                  <p className="mt-2 text-[var(--foreground)]">{word.example.jp}</p>
                  <p className="mt-2">{word.example.en}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Confidence hint
                  </span>
                  <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
                    {word.category}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleReveal(word.id)}
                className="mt-5 w-full rounded-full bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {revealed ? "Hide answer" : "Reveal answer"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
