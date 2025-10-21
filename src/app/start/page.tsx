'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Building } from 'lucide-react';
import Link from 'next/link';

export default function StartPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-secondary/30 p-4">
      <div className="flex flex-col items-center space-y-8 text-center max-w-2xl">
        <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl">
            Elige tu camino
        </h1>
        <p className="text-xl text-foreground/90">
            Cuéntanos sobre tu situación actual para darte las herramientas que necesitas.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pt-4">
            <Card className="hover:border-primary transition-all cursor-pointer">
                <Link href="/new-venture" className="block h-full">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        <CardTitle className="font-headline text-2xl">Quiero empezar un emprendimiento nuevo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>
                            Obtén un análisis de viabilidad, crea tu identidad de marca y recibe un plan de acción para lanzar tu idea desde cero.
                        </CardDescription>
                    </CardContent>
                </Link>
            </Card>

            <Card className="border-dashed bg-transparent opacity-60">
                 <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                        <Building className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="font-headline text-2xl">Ya tengo un emprendimiento pero quiero potenciarlo</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        (Próximamente) Analiza tu negocio actual, descubre oportunidades de crecimiento y obtén estrategias para escalar tus ventas.
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
