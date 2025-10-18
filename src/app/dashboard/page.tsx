
import { AppHeader } from "@/components/app/header";
import { MainContent } from "@/components/app/main-content";
import { HistorySidebar } from "@/components/app/history-sidebar";
import { Separator } from "@/components/ui/separator";
import { AppFooter } from "@/components/app/footer";
import AdminPage from "@/app/admin/page";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1 items-center">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <AppHeader />
          <Separator className="my-8" />
          <AdminPage />
        </div>
      </main>
      <div className="w-full mt-auto">
        <AppFooter />
      </div>
    </div>
  );
}
