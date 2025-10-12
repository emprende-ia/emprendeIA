import { AppHeader } from "@/components/app/header";
import { MainContent } from "@/components/app/main-content";
import { PricingSection } from "@/components/app/pricing-section";
import { AppFooter } from "@/components/app/footer";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col items-center">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <AppHeader />
          <Separator className="my-8" />
          <div className="space-y-12">
            <MainContent />
            <PricingSection />
            <AppFooter />
          </div>
        </div>
      </main>
    </div>
  );
}
