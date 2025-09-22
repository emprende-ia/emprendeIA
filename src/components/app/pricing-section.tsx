import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Gem } from "lucide-react";

const entrepreneurFeatures = [
  "Descuentos Exclusivos con proveedores",
  "Acceso Prioritario a proveedores verificados",
  "Reportes de Mercado Avanzados",
  "Análisis de viabilidad con IA mejorado",
];

const supplierFeatures = [
  "Mayor Visibilidad en las búsquedas",
  "Distintivo 'Proveedor Premium'",
  "Datos de Tendencias de mercado",
  "Analíticas Detalladas de perfil",
];

export function PricingSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30 rounded-lg">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">Planes Premium para Impulsar tu Crecimiento</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Desbloquea herramientas exclusivas tanto para emprendedores como para proveedores y lleva tu negocio al siguiente nivel.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-stretch gap-8 py-12 sm:grid-cols-2">
          <Card className="flex flex-col shadow-md">
            <CardHeader className="items-center text-center">
              <Crown className="h-10 w-10 text-primary" />
              <CardTitle className="font-headline text-2xl pt-2">EmprendeIA Plus</CardTitle>
              <CardDescription>Para Emprendedores</CardDescription>
              <div className="flex items-baseline gap-2 pt-4">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-sm text-muted-foreground">/mes</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <ul className="space-y-3 text-sm">
                {entrepreneurFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-accent" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full font-bold">Obtener Plan Emprendedor</Button>
            </CardFooter>
          </Card>
          <Card className="flex flex-col border-2 border-primary shadow-2xl">
            <CardHeader className="items-center text-center">
              <Gem className="h-10 w-10 text-primary" />
              <CardTitle className="font-headline text-2xl pt-2">Proveedor Premium</CardTitle>
              <CardDescription>Para Proveedores</CardDescription>
              <div className="flex items-baseline gap-2 pt-4">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-sm text-muted-foreground">/mes</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <ul className="space-y-3 text-sm">
                {supplierFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-accent" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full font-bold">Obtener Plan Proveedor</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
