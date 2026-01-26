'use client';

import { Button } from '@/components/ui/button';
import { User, LogIn, PlayCircle, Gem, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SettingsMenu } from '@/components/app/settings-menu';

export default function LandingPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // If the user is logged in and loading is complete, redirect to the start page.
    if (user && !isUserLoading) {
      router.push('/start');
    }
  }, [user, isUserLoading, router]);

  // While loading or if the user is logged in (and about to be redirected), show a loader.
  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If loading is finished and there's no user, show the landing page.
  return (
      <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-secondary/10 p-4">
        
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <SettingsMenu />
          <Button asChild variant="outline" size="sm">
              <Link href="/pricing">
              <Gem className="mr-2 h-4 w-4" />
              Ver Planes
              </Link>
          </Button>
        </div>

        <div className="flex flex-col items-center space-y-8 text-center">
          
          <Image src="https://i.postimg.cc/wxVbJF5r/Gemini-Generated-Image-19a6sy19a6sy19a6.png" alt="EmprendeIA Logo" width={128} height={128} className="rounded-full object-cover border-4 border-primary/50 drop-shadow-[0_5px_15px_rgba(99,102,241,0.5)]" />

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
            <Button asChild variant="ghost" size="lg" className="w-full text-lg">
                <Link href="/dashboard">
                    <UserCircle className="mr-2 h-5 w-5" />
                    Continuar como invitado
                </Link>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="w-full text-lg font-bold">
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Tutorial de bienvenida
                  </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Tutorial de EmprendeIA</DialogTitle>
                  <DialogDescription>
                    Descubre cómo aprovechar al máximo todas las herramientas.
                  </DialogDescription>
                </DialogHeader>
                <div className="aspect-video w-full rounded-lg overflow-hidden border">
                  {/* Placeholder video - replace with your actual video URL */}
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/R9CZPZ_KC_k"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </DialogContent>
            </Dialog>
          </div>

        </div>
      </main>
  );
}
