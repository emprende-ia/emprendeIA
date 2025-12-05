
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, LayoutDashboard, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function StartPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-8 text-center max-w-4xl">
        <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl">
            Elige tu camino
        </h1>
        <p className="text-xl text-foreground/90">
            Cuéntanos sobre tu situación actual para darte las herramientas que necesitas.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full pt-4">
            <Card className="hover:border-primary transition-all cursor-pointer bg-white/5 backdrop-blur-lg border border-white/10 group">
                 <Link href="/new-venture" className="block h-full p-8">
                    <CardHeader className="p-0 items-center text-center">
                        <div className="mb-4 relative w-24 h-24 group-hover:scale-110 transition-transform">
                             <Image 
                                src="https://i.postimg.cc/5yGJdSJv/imagen-boton-1.png" 
                                alt="Empezar nuevo emprendimiento" 
                                fill
                                className="object-contain"
                            />
                        </div>
                        <CardTitle className="font-headline text-2xl">Quiero empezar un emprendimiento nuevo</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-4">
                        <CardDescription>
                            Obtén un análisis de viabilidad, crea tu identidad de marca y recibe un plan de acción para lanzar tu idea desde cero.
                        </CardDescription>
                    </CardContent>
                </Link>
            </Card>

            <Card className="hover:border-primary transition-all cursor-pointer bg-white/5 backdrop-blur-lg border border-white/10 group">
                 <Link href="/existing-venture" className="block h-full p-8">
                    <CardHeader className="p-0 items-center text-center">
                        <div className="mb-4 relative w-24 h-24 group-hover:scale-110 transition-transform">
                             <Image 
                                src="https://i.postimg.cc/TY70xNBB/boton2.jpg" 
                                alt="Potenciar mi emprendimiento" 
                                fill
                                className="object-cover rounded-full border-2 border-primary/30"
                            />
                        </div>
                        <CardTitle className="font-headline text-2xl">Ya tengo un emprendimiento pero quiero potenciarlo</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-4">
                        <CardDescription>
                            Analiza tu negocio actual, descubre oportunidades de crecimiento y obtén estrategias para escalar tus ventas.
                        </CardDescription>
                    </CardContent>
                </Link>
            </Card>
        </div>
        <div className="pt-6 w-full max-w-sm">
            <Button asChild variant="outline" size="lg" className="w-full text-lg">
                <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Ir a mi Panel de Control
                </Link>
            </Button>
        </div>
      </div>
    </main>
  );
}

    