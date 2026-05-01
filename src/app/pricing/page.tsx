import { AppHeader } from "@/components/app/header";
import { AppFooter } from "@/components/app/footer";
import { PricingSection } from "@/components/app/pricing-section";

export default function PricingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <div className="aurora-orb aurora-orb-primary pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] animate-aurora-shift" />
      <div className="aurora-orb aurora-orb-accent pointer-events-none absolute -right-32 top-1/3 h-[400px] w-[400px] animate-aurora-shift" style={{ animationDelay: '8s' }} />

      <main className="relative z-10 flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-10">
          <AppHeader />
          <div className="mt-12">
            <PricingSection />
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
