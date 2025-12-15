
'use client';

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { BookOpen, Palette, Megaphone, DollarSign, Search } from "lucide-react";
import { ProveedoresModule } from "@/components/app/modules/proveedores";
import { GuiaPasoAPasoModule } from "@/components/app/modules/guia-paso-a-paso";
import { IdentidadDigitalModule } from "@/components/app/modules/identidad-digital";
import { CampanasMarketingModule } from "@/components/app/modules/campanas-marketing";
import { AdministracionRecursosModule } from "@/components/app/modules/administracion-recursos";
import { useUser, useFirestore } from "@/firebase";
import { Loader2 } from "lucide-react";
import { AppHeader } from "@/components/app/header";
import { Separator } from "@/components/ui/separator";
import { getBrandIdentity, type BrandIdentity } from '@/lib/firestore/identity';
<<<<<<< HEAD
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
=======
>>>>>>> f963ad0f5301c7d7f0a5b779f37b7ca989ef3d99
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
<<<<<<< HEAD
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
=======
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                    <div className="h-32 w-full relative">
                        <Image 
                            src="https://i.postimg.cc/3NSYtR4d/identidad-digital.jpg" 
                            alt="Identidad Digital" 
                            fill
                            className="object-cover"
                        />
>>>>>>> f963ad0f5301c7d7f0a5b779f37b7ca989ef3d99
                    </div>
                    <CardHeader className="relative z-10 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-primary/10 p-2 rounded-lg border border-primary/20"><Palette className="h-8 w-8 text-primary" /></div>
                            <CardTitle className="text-2xl">Identidad Digital</CardTitle>
                        </div>
                        <CardDescription>Crea un nombre, eslogan y paleta de colores para tu marca.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 flex-grow p-6 pt-0 flex items-end">
                        {/* Content can be added here if needed */}
                    </CardContent>
                    <CardFooter className="relative z-10 p-6 pt-0 mt-auto">
                        <IdentidadDigitalModule />
                    </CardFooter>
                </Card>

                <Card className="flex flex-col hover:border-primary transition-colors relative bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden group">
<<<<<<< HEAD
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
=======
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                    <div className="h-32 w-full relative">
                        <Image 
                            src="https://i.postimg.cc/76R2jx2b/asistente-financiero.jpg" 
                            alt="Asistente Financiero" 
                            fill
                            className="object-cover"
                        />
>>>>>>> f963ad0f5301c7d7f0a5b779f37b7ca989ef3d99
                    </div>
                    <CardHeader className="relative z-10 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-primary/10 p-2 rounded-lg border border-primary/20"><DollarSign className="h-8 w-8 text-primary" /></div>
                            <CardTitle className="text-2xl">Asistente Financiero</CardTitle>
                        </div>
                        <CardDescription>Obtén un presupuesto y analiza el punto de equilibrio.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 flex-grow p-6 pt-0 flex items-end">
                        {/* Content can be added here if needed */}
                    </CardContent>
                    <CardFooter className="relative z-10 p-6 pt-0 mt-auto">
                        <AdministracionRecursosModule />
                    </CardFooter>
                </Card>

                <Card className="flex flex-col hover:border-primary transition-colors relative bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden group">
<<<<<<< HEAD
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
=======
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                    <div className="h-32 w-full relative">
                        <Image 
                            src="https://i.postimg.cc/QtzfSZNj/disenador-de-camp.jpg" 
                            alt="Generador de Campañas" 
                            fill
                            className="object-cover"
                        />
>>>>>>> f963ad0f5301c7d7f0a5b779f37b7ca989ef3d99
                    </div>
                    <CardHeader className="relative z-10 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-primary/10 p-2 rounded-lg border border-primary/20"><Megaphone className="h-8 w-8 text-primary" /></div>
                            <CardTitle className="text-2xl">Generador de Campañas</CardTitle>
                        </div>
                        <CardDescription>Genera ideas de campañas de marketing y planes de acción.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 flex-grow p-6 pt-0 flex items-end">
                        {/* Content can be added here if needed */}
                    </CardContent>
                    <CardFooter className="relative z-10 p-6 pt-0 mt-auto">
                        <CampanasMarketingModule />
                    </CardFooter>
                </Card>

                <Card className="flex flex-col hover:border-primary transition-colors relative bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden group">
<<<<<<< HEAD
                    <div className="relative h-40 w-full">
                        <Image src="https://i.postimg.cc/LXtDpg2w/proveedores.jpg" alt="Proveedores" layout="fill" objectFit="cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full p-6 pt-2">
                    <CardHeader className="flex-grow p-0">
=======
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                    <div className="h-32 w-full relative">
                        <Image 
                            src="https://i.postimg.cc/LXtDpg2w/proveedores.jpg" 
                            alt="Proveedores" 
                            fill
                            className="object-cover"
                        />
                    </div>
                    <CardHeader className="relative z-10 p-6">
>>>>>>> f963ad0f5301c7d7f0a5b779f37b7ca989ef3d99
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-primary/10 p-2 rounded-lg border border-primary/20"><Search className="h-8 w-8 text-primary" /></div>
                            <CardTitle className="text-2xl">Proveedores</CardTitle>
                        </div>
                        <CardDescription>Encuentra los mejores proveedores para tu negocio con IA.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 flex-grow p-6 pt-0 flex items-end">
                        {/* Content can be added here if needed */}
                    </CardContent>
                    <CardFooter className="relative z-10 p-6 pt-0 mt-auto">
                        <ProveedoresModule />
                    </CardFooter>
                </Card>

                <Card className="flex flex-col hover:border-primary transition-colors relative bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden group">
<<<<<<< HEAD
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
=======
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                    <div className="h-32 w-full relative">
                        <Image 
                            src="https://i.postimg.cc/hv3pyWSQ/guias-paso-apaso.jpg" 
                            alt="Guía Paso a Paso" 
                            fill
                            className="object-cover"
                        />
>>>>>>> f963ad0f5301c7d7f0a5b779f37b7ca989ef3d99
                    </div>
                    <CardHeader className="relative z-10 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-primary/10 p-2 rounded-lg border border-primary/20"><BookOpen className="h-8 w-8 text-primary" /></div>
                            <CardTitle className="text-2xl">Guía Paso a Paso</CardTitle>
                        </div>
                        <CardDescription>Genera un plan de acción detallado para tu idea de negocio.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 flex-grow p-6 pt-0 flex items-end">
                        {/* Content can be added here if needed */}
                    </CardContent>
                    <CardFooter className="relative z-10 p-6 pt-0 mt-auto">
                        <GuiaPasoAPasoModule />
                    </CardFooter>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}

    