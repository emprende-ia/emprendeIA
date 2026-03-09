'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function StartPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background">
      <div className="flex flex-col items-center space-y-8 text-center max-w-4xl">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">Elige tu camino</h1>
        <p className="text-xl text-muted-foreground">Cuéntanos sobre tu situación para darte las herramientas de IA que necesitas.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full pt-4">
            <Card className="hover:border-primary transition-all cursor-pointer bg-card/50 backdrop-blur-lg border border-border group">
                 <Link href="/new-venture" className="block h-full p-8">
                    <CardHeader className="p-0 items-center">
                        <div className="mb-4 relative w-24 h-24 group-hover:scale-110 transition-transform">
                             <Image src="https://picsum.photos/seed/startup/200/200" alt="Nuevo" fill className="object-contain rounded-full" data-ai-hint="startup rocket" />
                        </div>
                        <CardTitle className="font-headline text-2xl">Emprendimiento Nuevo</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-4">
                        <CardDescription>Análisis de viabilidad, identidad de marca y plan de acción desde cero.</CardDescription>
                    </CardContent>
                </Link>
            </Card>

            <Card className="hover:border-primary transition-all cursor-pointer bg-card/50 backdrop-blur-lg border border-border group">
                 <Link href="/existing-venture" className="block h-full p-8">
                    <CardHeader className="p-0 items-center">
                        <div className="mb-4 relative w-24 h-24 group-hover:scale-110 transition-transform">
                             <Image src="https://picsum.photos/seed/scale/200/200" alt="Escalar" fill className="object-cover rounded-full" data-ai-hint="business growth" />
                        </div>
                        <CardTitle className="font-headline text-2xl">Potenciar Negocio</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-4">
                        <CardDescription>Descubre oportunidades de crecimiento y estrategias para escalar ventas.</CardDescription>
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