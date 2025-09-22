import { AppHeader } from "@/components/app/header";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 items-center justify-center">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <AppHeader />
        </div>
      </main>
    </div>
  );
}
