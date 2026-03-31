import { FeatureGrid } from "@/components/landing/feature-grid";
import { Hero } from "@/components/landing/hero";
import { VocabPreview } from "@/components/landing/vocab-preview";
import { PricingCard } from "@/components/pricing/pricing-card";
import { AppHeader } from "@/components/shared/app-header";

export default function HomePage() {
  return (
    <main className="pb-16">
      <AppHeader />
      <Hero />
      <section className="section-shell mt-8">
        <FeatureGrid />
      </section>
      <section className="section-shell mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <VocabPreview />
        <PricingCard />
      </section>
    </main>
  );
}
