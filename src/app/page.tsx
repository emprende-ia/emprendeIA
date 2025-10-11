import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
          <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger className="p-6 text-2xl font-headline data-[state=closed]:rounded-b-lg data-[state=closed]:border-b-0 hover:no-underline">
                Comienza Aquí: Genera Recomendaciones
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-12">
                  <MainContent />
                  <PricingSection />
                  <AppFooter />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
    </div>
  );
}
