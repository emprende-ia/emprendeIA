
import { AppHeader } from "@/components/app/header";
import { MainContent } from "@/components/app/main-content";
import { PricingSection } from "@/components/app/pricing-section";
import { AppFooter } from "@/components/app/footer";
import { Separator } from "@/components/ui/separator";
import { HistorySidebar } from "@/components/app/history-sidebar";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col items-center">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <AppHeader />
          <Separator className="my-8" />
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="space-y-12 lg:col-span-2">
              <MainContent />
              <PricingSection />
            </div>
            <div className="lg:col-span-1">
              <HistorySidebar />
            </div>
          </div>
        </div>
        <div className="w-full mt-auto">
          <AppFooter />
        </div>
      </main>
    </div>
  );
}
