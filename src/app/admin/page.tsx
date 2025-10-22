
'use client';

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { BookOpen, Palette, Megaphone, DollarSign, Search, Route, Target } from "lucide-react";
import { ProveedoresModule } from "@/components/app/modules/proveedores";
import { GuiaPasoAPasoModule } from "@/components/app/modules/guia-paso-a-paso";
import { IdentidadDigitalModule } from "@/components/app/modules/identidad-digital";
import { CampanasMarketingModule } from "@/components/app/modules/campanas-marketing";
import { AdministracionRecursosModule } from "@/components/app/modules/administracion-recursos";
import { MisRutasModule } from "@/components/app/modules/mis-rutas";
import { MisCampanasModule } from "@/components/app/modules/mis-campanas";
import { useUser } from "@/firebase";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const [brandName, setBrandName] = useState("Emprendimiento");

  useEffect(() => {
    // Apply theme from localStorage on client-side
    const savedIdentity = localStorage.getItem('brandIdentity');
    if (savedIdentity) {
      const { brandName: savedBrandName, colorPalette } = JSON.parse(savedIdentity);
      if (savedBrandName) {
        setBrandName(savedBrandName);
      }
      if (colorPalette && colorPalette[0] && colorPalette[2]) {
        document.documentElement.style.setProperty('--primary', colorPalette[0].hex);
        document.documentElement.style.setProperty('--accent', colorPalette[2].hex);
      }
    }
  }, []);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold">Panel de {brandName}</h1>
          <p className="text-muted-foreground mt-2 text-lg">Tus herramientas de IA para lanzar y crecer tu negocio.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <Card 
              className="flex flex-col hover:border-primary transition-colors relative bg-cover bg-center overflow-hidden"
              style={{ backgroundImage: "url('https://i.postimg.cc/NGJCn4vP/However-technology-has-revolutionized-packers-and.jpg')" }}
          >
            <div className="absolute inset-0 bg-black/60 z-0" />
            <div className="relative z-10 flex flex-col h-full">
              <CardHeader className="flex-grow">
                <div className="flex items-center gap-3">
                    <Search className="h-8 w-8 text-primary" />
                    <CardTitle>Proveedores</CardTitle>
                </div>
                <CardDescription>Encuentra los mejores proveedores para tu negocio con IA.</CardDescription>
              </CardHeader>
              <CardFooter>
                <ProveedoresModule />
              </CardFooter>
            </div>
          </Card>

          <Card 
              className="flex flex-col hover:border-primary transition-colors relative bg-cover bg-center overflow-hidden"
              style={{ backgroundImage: "url('https://i.postimg.cc/3JXfnH9y/e84c22d5-5cb4-4ecd-bd25-2e473f54ee60.jpg')" }}
          >
              <div className="absolute inset-0 bg-black/60 z-0" />
              <div className="relative z-10 flex flex-col h-full">
                  <CardHeader className="flex-grow">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-8 w-8 text-primary" />
                        <CardTitle>Guía Paso a Paso</CardTitle>
                    </div>
                    <CardDescription>Genera un plan de acción detallado para tu idea de negocio.</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <GuiaPasoAPasoModule />
                  </CardFooter>
              </div>
          </Card>

          <Card 
              className="flex flex-col hover:border-primary transition-colors relative bg-cover bg-center overflow-hidden"
              style={{ backgroundImage: "url('https://i.postimg.cc/PxFbSSvD/2245c379-2a35-4366-9584-598eaae9013c.jpg')" }}
          >
              <div className="absolute inset-0 bg-black/60 z-0" />
              <div className="relative z-10 flex flex-col h-full">
                  <CardHeader className="flex-grow">
                      <div className="flex items-center gap-3">
                        <Palette className="h-8 w-8 text-primary" />
                        <CardTitle>Identidad Digital</CardTitle>
                    </div>
                    <CardDescription>Crea un nombre, eslogan y paleta de colores para tu marca.</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <IdentidadDigitalModule />
                  </CardFooter>
              </div>
          </Card>

          <Card 
              className="flex flex-col hover:border-primary transition-colors relative bg-cover bg-center overflow-hidden"
              style={{ backgroundImage: "url('https://i.postimg.cc/2jGNShR6/Grow-Your-Business-with-Powerful-Digital-Marketing.jpg')" }}
          >
              <div className="absolute inset-0 bg-black/60 z-0" />
              <div className="relative z-10 flex flex-col h-full">
                  <CardHeader className="flex-grow">
                      <div className="flex items-center gap-3">
                          <Megaphone className="h-8 w-8 text-primary" />
                          <CardTitle>Generador de Campañas</CardTitle>
                      </div>
                      <CardDescription>Genera ideas de campañas de marketing y planes de acción.</CardDescription>
                  </CardHeader>
                  <CardFooter>
                      <CampanasMarketingModule />
                  </CardFooter>
              </div>
          </Card>

          <Card 
              className="flex flex-col hover:border-primary transition-colors relative bg-cover bg-center overflow-hidden"
              style={{ backgroundImage: "url('https://i.postimg.cc/tTn2P0YH/Inversiones-Internacionales-Asesor-a-Financiera.jpg')" }}
          >
              <div className="absolute inset-0 bg-black/60 z-0" />
              <div className="relative z-10 flex flex-col h-full">
                  <CardHeader className="flex-grow">
                      <div className="flex items-center gap-3">
                          <DollarSign className="h-8 w-8 text-primary" />
                          <CardTitle>Administración de Recursos</CardTitle>
                      </div>
                      <CardDescription>Obtén un presupuesto estimado y plan de recursos.</CardDescription>
                  </CardHeader>
                  <CardFooter>
                      <AdministracionRecursosModule />
                  </CardFooter>
              </div>
          </Card>
          
          <Card 
              className="flex flex-col hover:border-primary transition-colors relative bg-cover bg-center overflow-hidden"
              style={{ backgroundImage: "url('https://i.postimg.cc/d1j3v8g2/Premium-Photo-Road-trip-with-a-car-in-a-sunny-day.jpg')" }}
          >
              <div className="absolute inset-0 bg-black/60 z-0" />
              <div className="relative z-10 flex flex-col h-full">
                  <CardHeader className="flex-grow">
                      <div className="flex items-center gap-3">
                          <Route className="h-8 w-8 text-primary" />
                          <CardTitle>Mis Rutas</CardTitle>
                      </div>
                      <CardDescription>Consulta y da seguimiento a tus planes de aprendizaje.</CardDescription>
                  </CardHeader>
                  <CardFooter>
                      <MisRutasModule />
                  </CardFooter>
              </div>
          </Card>

          <Card 
              className="flex flex-col hover:border-primary transition-colors relative bg-cover bg-center overflow-hidden"
              style={{ backgroundImage: "url('https://i.postimg.cc/Hxbk3bCj/4f40f2e0-c831-4089-923a-344154a3399c.jpg')" }}
          >
              <div className="absolute inset-0 bg-black/60 z-0" />
              <div className="relative z-10 flex flex-col h-full">
                  <CardHeader className="flex-grow">
                      <div className="flex items-center gap-3">
                          <Target className="h-8 w-8 text-primary" />
                          <CardTitle>Mis Campañas</CardTitle>
                      </div>
                      <CardDescription>Da seguimiento a tus campañas de marketing activas.</CardDescription>
                  </CardHeader>
                  <CardFooter>
                      <MisCampanasModule />
                  </CardFooter>
              </div>
          </Card>


        </div>
      </div>
    </div>
  );
}
