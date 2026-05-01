'use client';

import { Button } from '@/components/ui/button';
import { User, LogIn, PlayCircle, Gem, UserCircle, Sparkles, ArrowRight } from 'lucide-react';
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
    if (user && !isUserLoading) {
      router.push('/start');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4">
      {/* Ambient orbs — sutiles, animadas */}
      <div className="aurora-orb aurora-orb-primary -left-32 top-0 h-[440px] w-[440px] animate-aurora-shift" />
      <div className="aurora-orb aurora-orb-accent -right-32 bottom-0 h-[400px] w-[400px] animate-aurora-shift" style={{ animationDelay: '8s' }} />

      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <SettingsMenu />
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/pricing">
            <Gem className="mr-1.5 h-3.5 w-3.5" />
            Planes
          </Link>
        </Button>
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center space-y-7 text-center animate-fade-in-up">

        {/* Pill superior */}
        <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          IA para emprendedores · México
        </div>

        {/* Logo + título */}
        <div className="space-y-5">
          <div className="relative inline-block">
            <div className="absolute inset-0 -z-10 rounded-full bg-aurora-gradient opacity-50 blur-2xl" />
            <Image
              src="https://i.postimg.cc/wxVbJF5r/Gemini-Generated-Image-19a6sy19a6sy19a6.png"
              alt="EmprendeIA Logo"
              width={120}
              height={120}
              className="relative animate-float rounded-full border-4 border-primary/30 object-cover shadow-aurora-lg"
            />
          </div>

          <div className="space-y-2">
            <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl">
              <span className="text-aurora">EmprendeIA</span>
            </h1>
            <p className="text-lg font-medium text-foreground/90">
              Convierte tus ideas en negocios reales.
            </p>
          </div>
        </div>

        <p className="max-w-md text-base text-muted-foreground">
          Valida, lanza y haz crecer tu negocio con un copiloto de inteligencia artificial diseñado para ti.
        </p>

        {/* CTAs */}
        <div className="flex w-full flex-col gap-2.5 pt-2">
          <Button asChild size="lg" className="w-full text-base font-bold shadow-aurora transition-all hover:shadow-aurora-lg">
            <Link href="/register">
              <User className="mr-2 h-4 w-4" />
              Registrarme gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full text-base font-semibold">
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Iniciar sesión
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="w-full text-sm text-muted-foreground hover:text-foreground">
            <Link href="/dashboard">
              <UserCircle className="mr-2 h-4 w-4" />
              Continuar como invitado
            </Link>
          </Button>
        </div>

        {/* Tutorial */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="link" size="sm" className="text-sm font-semibold text-foreground/80 hover:text-foreground">
              <PlayCircle className="mr-2 h-4 w-4" />
              Ver tutorial de bienvenida
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Tutorial de EmprendeIA</DialogTitle>
              <DialogDescription>
                Descubre cómo aprovechar al máximo todas las herramientas.
              </DialogDescription>
            </DialogHeader>
            <div className="aspect-video w-full overflow-hidden rounded-lg border">
              <iframe
                className="h-full w-full"
                src={TUTORIAL_VIDEO_URL}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </DialogContent>
        </Dialog>

        {/* Legales sutiles */}
        <div className="space-y-1 pt-2 text-center text-xs text-muted-foreground">
          <p>
            <Link href="https://emprendeia.app/terminos" target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-foreground hover:underline">
              Términos
            </Link>
            <span className="mx-2">·</span>
            <Link href="https://emprendeia.app/privacidad" target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-foreground hover:underline">
              Privacidad
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
