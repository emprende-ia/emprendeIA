'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Rocket, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function StartPage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4">
      {/* Aurora ambient orbs */}
      <div className="aurora-orb aurora-orb-primary -top-32 -left-32 h-[420px] w-[420px] animate-aurora-shift" />
      <div className="aurora-orb aurora-orb-accent -bottom-32 -right-32 h-[400px] w-[400px] animate-aurora-shift" style={{ animationDelay: '6s' }} />

      <div className="relative z-10 flex flex-col items-center space-y-8 text-center max-w-4xl animate-fade-in-up">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
          Elige tu <span className="text-aurora">camino</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Cuéntanos sobre tu situación para darte las herramientas de IA que necesitas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pt-4">
          <Card className="hover:border-primary/60 hover:shadow-aurora-lg transition-all duration-300 cursor-pointer bg-card/80 backdrop-blur-md border border-border/60 group overflow-hidden">
            <Link href="/new-venture" className="block h-full p-8">
              <CardHeader className="p-0 items-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-aurora-gradient text-primary-foreground shadow-aurora group-hover:scale-110 transition-transform">
                  <Rocket className="h-12 w-12" />
                </div>
                <CardTitle className="font-headline text-2xl">Emprendimiento Nuevo</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <CardDescription className="text-base">
                  Análisis de viabilidad, identidad de marca y plan de acción desde cero.
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:border-primary/60 hover:shadow-aurora-lg transition-all duration-300 cursor-pointer bg-card/80 backdrop-blur-md border border-border/60 group overflow-hidden">
            <Link href="/existing-venture" className="block h-full p-8">
              <CardHeader className="p-0 items-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-aurora-gradient text-primary-foreground shadow-aurora group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-12 w-12" />
                </div>
                <CardTitle className="font-headline text-2xl">Potenciar Negocio</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <CardDescription className="text-base">
                  Descubre oportunidades de crecimiento y estrategias para escalar ventas.
                </CardDescription>
              </CardContent>
            </Link>
          </Card>
        </div>

        <div className="pt-6 w-full max-w-sm">
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-5 w-5" /> Ir al Panel de Control
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
