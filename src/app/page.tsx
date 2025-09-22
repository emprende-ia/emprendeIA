import { AppHeader } from "@/components/app/header";
import { MainContent } from "@/components/app/main-content";
import { PricingSection } from "@/components/app/pricing-section";
import { AppFooter } from "@/components/app/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8 space-y-12 md:space-y-16">
          <AppHeader />
          <MainContent />
          <PricingSection />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
