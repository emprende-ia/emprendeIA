import { AppHeader } from "@/components/app/header";
import { AppFooter } from "@/components/app/footer";
import { PricingSection } from "@/components/app/pricing-section";
import { Separator } from "@/components/ui/separator";

export default function PricingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
       <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <AppHeader />
          <Separator className="my-8" />
          <PricingSection />
        </div>
      </main>
      <div className="mt-auto">
        <AppFooter />
      </div>
    </div>
  );
}
