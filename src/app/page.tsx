
'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, User, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // Only redirect if the user is confirmed to be logged in.
    if (!isUserLoading && user) {
      router.push('/start');
    }
  }, [user, isUserLoading, router]);

  // While loading, show a spinner. The rest of the logic handles the display
  // for logged-out users.
  if (isUserLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is logged in, this component will be replaced by a redirect,
  // so we don't need a separate loading state for the logged-in case.
  // We only render the landing page content if the user is definitively logged out.
  if (!user) {
    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center bg-secondary/10 p-4">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary p-4 shadow-lg">
                <Sparkles className="h-10 w-10 text-primary-foreground" />
              </div>
              <h1 className="font-headline text-6xl font-bold tracking-tighter text-foreground sm:text-7xl">
                Emprende Fácil
              </h1>
            </div>
            
            <p className="max-w-xl text-xl text-foreground/90">
              Bienvenido a la búsqueda de tu sueño. Transforma tu idea en un negocio exitoso con el poder de la inteligencia artificial.
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

  // Fallback for the brief moment after loading and before redirect.
  return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
  );
}
