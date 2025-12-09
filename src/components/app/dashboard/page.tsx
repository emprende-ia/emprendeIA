
'use client';

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { BookOpen, Palette, Megaphone, DollarSign, Search, Route, Target, Lightbulb } from "lucide-react";
import { ProveedoresModule } from "@/components/app/modules/proveedores";
import { GuiaPasoAPasoModule } from "@/components/app/modules/guia-paso-a-paso";
import { IdentidadDigitalModule } from "@/components/app/modules/identidad-digital";
import { CampanasMarketingModule } from "@/components/app/modules/campanas-marketing";
import { AdministracionRecursosModule } from "@/components/app/modules/administracion-recursos";
import { MisRutasModule } from "@/components/app/modules/mis-rutas";
import { MisCampanasModule } from "@/components/app/modules/mis-campanas";
import { useUser, useFirestore } from "@/firebase";
import { Loader2 } from "lucide-react";
import { AppHeader } from "@/components/app/header";
import { Separator } from "@/components/ui/separator";
import { BrandCampaign } from "@/components/app/modules/brand-campaign";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { getBrandIdentity, type BrandIdentity } from '@/lib/firestore/identity';
import Image from "next/image";


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const [brandIdentity, setBrandIdentity] = useState<BrandIdentity | null>(null);
  const [isIdentityLoading, setIsIdentityLoading] = useState(true);

  const brandName = brandIdentity?.brandName || "EmprendeIA";

  useEffect(() => {
    // Apply theme from localStorage on client-side
    const theme = localStorage.getItem('theme');
    if (!theme) {
      localStorage.setItem('theme', 'vibrant-sunset');
    }

    if (user && firestore) {
      setIsIdentityLoading(true);
      const unsubscribe = getBrandIdentity(firestore, user.uid, (identity) => {
        setBrandIdentity(identity);
        setIsIdentityLoading(false);
      });
      return () => unsubscribe();
    } else {
      const savedIdentity = localStorage.getItem('brandIdentity');
      if (savedIdentity) {
        try {
          setBrandIdentity(JSON.parse(savedIdentity));
        } catch (e) {
          console.error("Failed to parse brand identity from localStorage", e);
        }
      }
      setIsIdentityLoading(false);
    }
  }, [user, firestore]);


  if (isUserLoading || isIdentityLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="space-y-8">
        
        <AppHeader />
        <Separator className="my-8" />
        
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold">Panel de {brandName}</h1>
          <p className="text-muted-foreground mt-2 text-lg">Tus herramientas de IA para lanzar y crecer tu negocio.</p>
        </div>

        <div className="pt-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Todas las Herramientas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="flex flex-col hover:border-primary transition-colors relative bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden group">
                    <div className="relative h-40 w-full">
                        <Image src="https://i.postimg.cc/3NSYtR4d/identidad-digital.jpg" alt="Identidad Digital" layout="fill" objectFit="cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full p-6 pt-2">
                        <CardHeader className="flex-grow p-0">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-primary/10 p-2 rounded-lg border border-primary/20"><Palette className="h-8 w-8 text-primary" /></div>
                                <CardTitle className="text-2xl">Identidad Digital</CardTitle>
                            </div>
                            <CardDescription>Crea un nombre, eslogan y paleta de colores para tu marca.</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-0 pt-6">
                            <IdentidadDigitalModule />
                        </CardFooter>
                    </div>
                </Card>

                <Card className="flex flex-col hover:border-primary transition-colors relative bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden group">
                     <div className="relative h-40 w-full">
                        <Image src="https://i.postimg.cc/76R2jx2b/asistente-financiero.jpg" alt="Asistente Financiero" layout="fill" objectFit="cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full p-6 pt-2">
                        <CardHeader className="flex-grow p-0">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-primary/10 p-2 rounded-lg border border-primary/20"><DollarSign className="h-8 w-8 text-primary" /></div>
                                <CardTitle className="text-2xl">Asistente Financiero</CardTitle>
                            </div>
                            <CardDescription>Obtén un presupuesto y analiza el punto de equilibrio.</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-0 pt-6">
                            <AdministracionRecursosModule />
                        </CardFooter>
                    </div>
                </Card>

                <Card className="flex flex-col hover:border-primary transition-colors relative bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden group">
                     <div className="relative h-40 w-full">
                        <Image src="https://i.postimg.cc/QtzfSZNj/disenador-de-camp.jpg" alt="Generador de Campañas" layout="fill" objectFit="cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full p-6 pt-2">
                        <CardHeader className="flex-grow p-0">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-primary/10 p-2 rounded-lg border border-primary/20"><Megaphone className="h-8 w-8 text-primary" /></div>
                                <CardTitle className="text-2xl">Generador de Campañas</CardTitle>
                            </div>
                            <CardDescription>Genera ideas de campañas de marketing y planes de acción.</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-0 pt-6">
                            <CampanasMarketingModule />
                        </CardFooter>
                    </div>
                </Card>

                <Card className="flex flex-col hover:border-primary transition-colors relative bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden group">
                    <div className="relative h-40 w-full">
                        <Image src="https://i.postimg.cc/LXtDpg2w/proveedores.jpg" alt="Proveedores" layout="fill" objectFit="cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full p-6 pt-2">
                    <CardHeader className="flex-grow p-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-primary/10 p-2 rounded-lg border border-primary/20"><Search className="h-8 w-8 text-primary" /></div>
                            <CardTitle className="text-2xl">Proveedores</CardTitle>
                        </div>
                        <CardDescription>Encuentra los mejores proveedores para tu negocio con IA.</CardDescription>
                    </CardHeader>
                    <CardFooter className="p-0 pt-6">
                        <ProveedoresModule />
                    </CardFooter>
                    </div>
                </Card>

                <Card className="flex flex-col hover:border-primary transition-colors relative bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden group">
                    <div className="relative h-40 w-full">
                        <Image src="https://i.postimg.cc/hv3pyWSQ/guias-paso-apaso.jpg" alt="Guía Paso a Paso" layout="fill" objectFit="cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full p-6 pt-2">
                        <CardHeader className="flex-grow p-0">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-primary/10 p-2 rounded-lg border border-primary/20"><BookOpen className="h-8 w-8 text-primary" /></div>
                                <CardTitle className="text-2xl">Guía Paso a Paso</CardTitle>
                            </div>
                            <CardDescription>Genera un plan de acción detallado para tu idea de negocio.</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-0 pt-6">
                            <GuiaPasoAPasoModule />
                        </CardFooter>
                    </div>
                </Card>
                
                <Card className="flex flex-col hover:border-primary transition-colors relative bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                    <div className="relative z-10 flex flex-col h-full p-6">
                        <CardHeader className="flex-grow p-0">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-primary/10 p-2 rounded-lg border border-primary/20"><Lightbulb className="h-8 w-8 text-primary" /></div>
                                <CardTitle className="text-2xl">Conceptos de Marketing</CardTitle>
                            </div>
                            <CardDescription>Aprende los fundamentos para potenciar tu marca.</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-0 pt-6">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full font-bold">Ver Conceptos</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle className="font-headline text-2xl">Conceptos Clave de Marketing</DialogTitle>
                                        <DialogDescription>
                                            Una guía rápida para entender los pilares del marketing digital.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4 max-h-[70vh] overflow-y-auto">
                                        <BrandCampaign />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </div>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
