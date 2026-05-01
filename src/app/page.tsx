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

const TUTORIAL_VIDEO_URL = "https://www.youtube.com/embed/R9CZPZ_KC_k";

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
      <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4">
        {/* Aurora ambient orbs */}
        <div className="aurora-orb aurora-orb-primary -top-20 -left-20 h-[420px] w-[420px] animate-aurora-shift" />
        <div className="aurora-orb aurora-orb-accent top-1/2 -right-32 h-[360px] w-[360px] animate-aurora-shift" style={{ animationDelay: '4s' }} />
        <div className="aurora-orb aurora-orb-secondary -bottom-32 left-1/3 h-[400px] w-[400px] animate-aurora-shift" style={{ animationDelay: '8s' }} />

        <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
          <SettingsMenu />
          <Button asChild variant="outline" size="sm">
              <Link href="/pricing">
              <Gem className="mr-2 h-4 w-4" />
              Ver Planes
              </Link>
          </Button>
        </div>

        <div className="relative z-10 flex flex-col items-center space-y-8 text-center animate-fade-in-up">

          <Image src="https://i.postimg.cc/wxVbJF5r/Gemini-Generated-Image-19a6sy19a6sy19a6.png" alt="EmprendeIA Logo" width={128} height={128} className="rounded-full object-cover border-4 border-primary/40 shadow-aurora-lg animate-float" />

          <div className="space-y-2">
              <h1 className="font-headline text-6xl font-bold tracking-tighter sm:text-7xl">
                  <span className="text-aurora">EmprendeIA</span>
              </h1>
              <p className="text-xl text-foreground/90 font-medium">
                  Convierte tus ideas en negocios reales.
              </p>
          </div>

          <p className="max-w-xl text-lg text-muted-foreground">
            Transforma tu visión en un negocio exitoso con el poder de la inteligencia artificial.
          </p>

          <div className="flex w-full max-w-sm flex-col gap-3 pt-4">
            <Button asChild size="lg" className="w-full text-lg font-bold shadow-aurora hover:shadow-aurora-lg transition-shadow">
              <Link href="/register">
                  <User className="mr-2 h-5 w-5" />
                  Registrarme gratis
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full text-lg font-semibold">
              <Link href="/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  Iniciar Sesión
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="w-full text-base text-muted-foreground hover:text-foreground">
                <Link href="/dashboard">
                    <UserCircle className="mr-2 h-5 w-5" />
                    Continuar como invitado
                </Link>
            </Button>
             <div className="text-center text-sm text-muted-foreground space-y-1 pt-4">
                <p>
                    <Link href="https://emprendeia.app/terminos" target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline">
                        https://emprendeia.app/terminos
                    </Link>
                </p>
                <p>
                    <Link href="https://emprendeia.app/privacidad" target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline">
                        https://emprendeia.app/privacidad
                    </Link>
                </p>
            </div>
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
                  <iframe
                    className="w-full h-full"
                    src={TUTORIAL_VIDEO_URL}
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
