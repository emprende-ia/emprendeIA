
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Lightbulb, BookOpen, Palette, Megaphone, DollarSign, Search } from "lucide-react";
import { ProveedoresModule } from "@/components/app/modules/proveedores";
import { GuiaPasoAPasoModule } from "@/components/app/modules/guia-paso-a-paso";
import { IdentidadDigitalModule } from "@/components/app/modules/identidad-digital";
import { CampanasMarketingModule } from "@/components/app/modules/campanas-marketing";
import { AdministracionRecursosModule } from "@/components/app/modules/administracion-recursos";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold">Panel de Control de Emprendimiento</h1>
        <p className="text-muted-foreground mt-2 text-lg">Tus herramientas de IA para lanzar y crecer tu negocio.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <Card className="flex flex-col hover:border-primary transition-colors">
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
        </Card>

        <Card className="flex flex-col hover:border-primary transition-colors">
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
        </Card>

        <Card className="flex flex-col hover:border-primary transition-colors">
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
        </Card>

        <Card className="flex flex-col hover:border-primary transition-colors">
          <CardHeader className="flex-grow">
             <div className="flex items-center gap-3">
                <Megaphone className="h-8 w-8 text-primary" />
                <CardTitle>Campañas de Marketing</CardTitle>
            </div>
            <CardDescription>Diseña una estrategia de marketing digital para llegar a tus clientes.</CardDescription>
          </CardHeader>
          <CardFooter>
            <CampanasMarketingModule />
          </CardFooter>
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

      </div>
    </div>
  );
}
