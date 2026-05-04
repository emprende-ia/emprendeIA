'use client';

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BookOpen, Palette, Megaphone, DollarSign, Search, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";
import { ProveedoresModule } from "@/components/app/modules/proveedores";
import { GuiaPasoAPasoModule } from "@/components/app/modules/guia-paso-a-paso";
import { IdentidadDigitalModule } from "@/components/app/modules/identidad-digital";
import { CampanasMarketingModule } from "@/components/app/modules/campanas-marketing";
import { AdministracionRecursosModule } from "@/components/app/modules/administracion-recursos";
import { useUser, useFirestore } from "@/firebase";
import { AppHeader } from "@/components/app/header";
import { Separator } from "@/components/ui/separator";
import { getBrandIdentity, BRAND_IDENTITY_UPDATED_EVENT, type BrandIdentity } from '@/lib/firestore/identity';
import { useRouter } from "next/navigation";

type ModuleAccent = 'violet' | 'emerald' | 'rose' | 'amber' | 'sky';

const accentClasses: Record<ModuleAccent, {
  tile: string;
  hoverBorder: string;
  stripe: string;
  label: string;
}> = {
  violet: {
    tile: 'bg-violet-100 text-violet-700 ring-violet-200/70 dark:bg-violet-950/60 dark:text-violet-300 dark:ring-violet-800/40',
    hoverBorder: 'hover:border-violet-300/70 dark:hover:border-violet-700/50',
    stripe: 'from-violet-500 to-fuchsia-500',
    label: 'text-violet-700 bg-violet-100/80 dark:text-violet-300 dark:bg-violet-950/60',
  },
  emerald: {
    tile: 'bg-emerald-100 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800/40',
    hoverBorder: 'hover:border-emerald-300/70 dark:hover:border-emerald-700/50',
    stripe: 'from-emerald-500 to-teal-500',
    label: 'text-emerald-700 bg-emerald-100/80 dark:text-emerald-300 dark:bg-emerald-950/60',
  },
  rose: {
    tile: 'bg-rose-100 text-rose-700 ring-rose-200/70 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800/40',
    hoverBorder: 'hover:border-rose-300/70 dark:hover:border-rose-700/50',
    stripe: 'from-rose-500 to-pink-500',
    label: 'text-rose-700 bg-rose-100/80 dark:text-rose-300 dark:bg-rose-950/60',
  },
  amber: {
    tile: 'bg-amber-100 text-amber-700 ring-amber-200/70 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800/40',
    hoverBorder: 'hover:border-amber-300/70 dark:hover:border-amber-700/50',
    stripe: 'from-amber-500 to-orange-500',
    label: 'text-amber-700 bg-amber-100/80 dark:text-amber-300 dark:bg-amber-950/60',
  },
  sky: {
    tile: 'bg-sky-100 text-sky-700 ring-sky-200/70 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-800/40',
    hoverBorder: 'hover:border-sky-300/70 dark:hover:border-sky-700/50',
    stripe: 'from-sky-500 to-cyan-500',
    label: 'text-sky-700 bg-sky-100/80 dark:text-sky-300 dark:bg-sky-950/60',
  },
};

interface ModuleCardProps {
  accent: ModuleAccent;
  icon: React.ReactNode;
  category: string;
  title: string;
  description: string;
  illustration: string;
  illustrationAlt: string;
  illustrationBg: string;
  children: React.ReactNode;
}

function ModuleCard({ accent, icon, category, title, description, illustration, illustrationAlt, illustrationBg, children }: ModuleCardProps) {
  const a = accentClasses[accent];
  return (
    <Card className={`group relative flex flex-col overflow-hidden border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-aurora ${a.hoverBorder}`}>
      <div className={`absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r ${a.stripe} opacity-70 transition-opacity duration-300 group-hover:opacity-100`} />
      <div className={`relative aspect-[5/3] w-full overflow-hidden ${illustrationBg}`}>
        <Image
          src={illustration}
          alt={illustrationAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <CardHeader className="space-y-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${a.tile}`}>
            {icon}
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${a.label}`}>
            {category}
          </span>
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-xl font-semibold tracking-tight">{title}</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardFooter className="mt-auto pt-2">
        {children}
      </CardFooter>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [brandIdentity, setBrandIdentity] = useState<BrandIdentity | null>(null);
  const [isIdentityLoading, setIsIdentityLoading] = useState(true);

  const brandName = brandIdentity?.brandName || "EmprendeIA";

  useEffect(() => {
    if (user && firestore) {
      setIsIdentityLoading(true);
      const unsubscribe = getBrandIdentity(firestore, user.uid, (identity) => {
        setBrandIdentity(identity);
        setIsIdentityLoading(false);
      });
      return () => unsubscribe();
    } else {
      const loadFromLocalStorage = () => {
        const savedIdentity = localStorage.getItem('brandIdentity');
        if (savedIdentity) {
          try {
            setBrandIdentity(JSON.parse(savedIdentity));
          } catch (e) {
            console.error("Failed to parse brand identity from localStorage", e);
            setBrandIdentity(null);
          }
        } else {
          setBrandIdentity(null);
        }
      };
      loadFromLocalStorage();
      setIsIdentityLoading(false);

      window.addEventListener(BRAND_IDENTITY_UPDATED_EVENT, loadFromLocalStorage);
      return () => {
        window.removeEventListener(BRAND_IDENTITY_UPDATED_EVENT, loadFromLocalStorage);
      };
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
    <div className="relative min-h-screen w-full">
      {/* Ambient orb único, muy sutil */}
      <div className="aurora-orb aurora-orb-primary pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 animate-aurora-shift" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 py-10 sm:py-12">
        <div className="space-y-10">

          <AppHeader />

          {/* Hero de bienvenida */}
          <section className="space-y-3 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Tu copiloto para emprender
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
              Panel de <span className="text-aurora">{brandName}</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              Herramientas de IA para validar, lanzar y crecer tu negocio. Elige el módulo que necesitas.
            </p>
          </section>

          <Separator className="opacity-50" />

          {/* Grid de módulos */}
          <section className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-headline text-2xl font-semibold tracking-tight">Todas las herramientas</h2>
                <p className="text-sm text-muted-foreground">Cinco módulos diseñados para cada etapa de tu emprendimiento.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

              <ModuleCard
                accent="violet"
                icon={<Palette className="h-5 w-5" />}
                category="Marca"
                title="Identidad Digital"
                description="Crea un nombre, eslogan, paleta de colores y un logo profesional para tu marca."
                illustration="/illustrations/identidad-digital.png"
                illustrationAlt="Paleta de colores y pincel flotando"
                illustrationBg="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/40 dark:to-fuchsia-950/40"
              >
                <IdentidadDigitalModule />
              </ModuleCard>

              <ModuleCard
                accent="emerald"
                icon={<DollarSign className="h-5 w-5" />}
                category="Finanzas"
                title="Asistente Financiero"
                description="Obtén un presupuesto, registra ingresos y gastos, y analiza tu punto de equilibrio."
                illustration="/illustrations/finanzas.png"
                illustrationAlt="Monedas y gráfica financiera ascendente"
                illustrationBg="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40"
              >
                <AdministracionRecursosModule />
              </ModuleCard>

              <ModuleCard
                accent="rose"
                icon={<Megaphone className="h-5 w-5" />}
                category="Marketing"
                title="Generador de Campañas"
                description="Genera ideas de campañas y planes de acción concretos para conseguir clientes."
                illustration="/illustrations/marketing.png"
                illustrationAlt="Megáfono y burbujas de notificaciones"
                illustrationBg="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40"
              >
                <CampanasMarketingModule />
              </ModuleCard>

              <ModuleCard
                accent="amber"
                icon={<Search className="h-5 w-5" />}
                category="Operaciones"
                title="Proveedores"
                description="Encuentra los mejores proveedores para tu negocio con búsqueda asistida por IA."
                illustration="/illustrations/proveedores.png"
                illustrationAlt="Cajas de envío conectadas en red"
                illustrationBg="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40"
              >
                <ProveedoresModule />
              </ModuleCard>

              <ModuleCard
                accent="sky"
                icon={<BookOpen className="h-5 w-5" />}
                category="Estrategia"
                title="Guía Paso a Paso"
                description="Genera un plan de acción detallado y tareas claras para hacer realidad tu idea."
                illustration="/illustrations/guia-paso-a-paso.png"
                illustrationAlt="Mapa con ruta y checklist"
                illustrationBg="bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/40 dark:to-cyan-950/40"
              >
                <GuiaPasoAPasoModule />
              </ModuleCard>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
