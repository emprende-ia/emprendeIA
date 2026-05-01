'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Rocket, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function StartPage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4 sm:p-6">
      <div className="aurora-orb aurora-orb-primary -left-32 -top-32 h-[420px] w-[420px] animate-aurora-shift" />
      <div className="aurora-orb aurora-orb-accent -bottom-32 -right-32 h-[400px] w-[400px] animate-aurora-shift" style={{ animationDelay: '8s' }} />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center space-y-10 text-center animate-fade-in-up">

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Empecemos por lo que necesitas
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
            Elige tu <span className="text-aurora">camino</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Cuéntanos en qué momento estás para darte las herramientas correctas.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">

          <Card className="group relative overflow-hidden border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/70 hover:shadow-aurora-lg dark:hover:border-violet-700/50">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-70 transition-opacity group-hover:opacity-100" />
            <Link href="/new-venture" className="block h-full p-8">
              <CardHeader className="items-center p-0">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-aurora transition-transform group-hover:scale-105">
                  <Rocket className="h-10 w-10" />
                </div>
                <CardTitle className="font-headline text-2xl">Emprendimiento nuevo</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-3">
                <CardDescription className="text-base leading-relaxed">
                  Análisis de viabilidad, identidad de marca y plan de acción desde cero.
                </CardDescription>
                <div className="mt-5 flex items-center justify-center gap-1.5 text-sm font-semibold text-violet-700 dark:text-violet-300">
                  Empezar
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="group relative overflow-hidden border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/70 hover:shadow-aurora-lg dark:hover:border-emerald-700/50">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500 opacity-70 transition-opacity group-hover:opacity-100" />
            <Link href="/existing-venture" className="block h-full p-8">
              <CardHeader className="items-center p-0">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-aurora transition-transform group-hover:scale-105">
                  <TrendingUp className="h-10 w-10" />
                </div>
                <CardTitle className="font-headline text-2xl">Potenciar negocio</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-3">
                <CardDescription className="text-base leading-relaxed">
                  Descubre oportunidades de crecimiento y estrategias para escalar tus ventas.
                </CardDescription>
                <div className="mt-5 flex items-center justify-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Empezar
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        <div className="w-full max-w-sm pt-2">
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Ir directo al panel
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
