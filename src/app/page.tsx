
'use client';

import { Button } from '@/components/ui/button';
import { User, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // Redirect logged-in users to the start page.
    if (!isUserLoading && user) {
      router.push('/start');
    }
  }, [user, isUserLoading, router]);

  // If the auth state is still loading, or if the user is logged in
  // (and about to be redirected), show the loader.
  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If loading is finished and there's no user, show the landing page.
  if (!isUserLoading && !user) {
    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center bg-secondary/10 p-4">
          <div className="flex flex-col items-center space-y-8 text-center">
            
            <Image src="https://i.postimg.cc/nhbtm52x/Emprende.png" alt="EmprendeIA Logo" width={128} height={128} className="drop-shadow-[0_5px_15px_rgba(99,102,241,0.5)]" />

            <div className="space-y-2">
                <h1 className="font-headline text-6xl font-bold tracking-tighter text-foreground sm:text-7xl">
                    EmprendeIA
                </h1>
                <p className="text-xl text-foreground/90">
                    Convierte tus ideas en negocios reales.
                </p>
            </div>
            
            <p className="max-w-xl text-lg text-foreground/80">
              Transforma tu visión en un negocio exitoso con el poder de la inteligencia artificial.
            </p>

            <div className="flex w-full max-w-sm flex-col gap-4 pt-4">
              <Button asChild size="lg" className="w-full text-lg font-bold">
                <Link href="/register">
                    <User className="mr-2 h-5 w-5" />
                    Registrarme
                </Link>
              </Button>
              <Button asChild size="lg" className="w-full text-lg font-bold">
                <Link href="/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    Iniciar Sesión
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full text-lg font-bold">
                <Link href="/start">
                    Continuar como invitado
                </Link>
              </Button>
            </div>

          </div>
        </main>
    );
  }

  // This is a fallback that should rarely be seen.
  return null;
}
