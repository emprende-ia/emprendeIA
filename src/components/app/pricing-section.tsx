'use client';

import { Check, Gem, Sparkles, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type PlanAccent = 'slate' | 'violet' | 'amber';

const plans: Array<{
  name: string;
  icon: typeof User;
  price: string;
  priceId: string | null | undefined;
  description: string;
  features: string[];
  cta: string;
  isPrimary: boolean;
  accent: PlanAccent;
  badge?: string;
}> = [
  {
    name: 'Básico',
    icon: User,
    price: 'Gratis',
    priceId: null,
    description: 'Para empezar a explorar y validar tu idea.',
    features: ['Recomendaciones de IA', 'Directorio de proveedores', 'Búsquedas limitadas'],
    cta: 'Empezar gratis',
    isPrimary: false,
    accent: 'slate',
  },
  {
    name: 'Plan Oro',
    icon: Sparkles,
    price: '$99',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PLUS_PRICE_ID?.trim(),
    description: 'Para emprendedores que quieren acelerar su negocio.',
    features: [
      'Recomendaciones priorizadas',
      'Acceso a proveedores verificados',
      'Búsquedas ilimitadas',
      'Soporte por correo electrónico',
    ],
    cta: 'Obtener Plan Oro',
    isPrimary: true,
    accent: 'violet',
    badge: 'Más popular',
  },
  {
    name: 'Plan Diamante',
    icon: Gem,
    price: '$149',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID?.trim(),
    description: 'Para negocios que necesitan analítica avanzada.',
    features: [
      'Todo lo de Oro',
      'Reportes de mercado avanzados',
      'Analíticas de proveedores',
      'Soporte prioritario 24/7',
    ],
    cta: 'Obtener Plan Diamante',
    isPrimary: false,
    accent: 'amber',
  },
];

const accentMap: Record<PlanAccent, {
  stripe: string;
  iconBg: string;
  iconText: string;
  ring: string;
  badge: string;
  checkText: string;
}> = {
  slate: {
    stripe: 'from-slate-400 to-slate-600',
    iconBg: 'bg-slate-100 dark:bg-slate-900/60',
    iconText: 'text-slate-700 dark:text-slate-300',
    ring: 'ring-slate-200/70 dark:ring-slate-800/40',
    badge: '',
    checkText: 'text-slate-500',
  },
  violet: {
    stripe: 'from-violet-500 via-fuchsia-500 to-pink-500',
    iconBg: 'bg-violet-100 dark:bg-violet-950/60',
    iconText: 'text-violet-700 dark:text-violet-300',
    ring: 'ring-violet-200/70 dark:ring-violet-800/40',
    badge: 'bg-violet-600 text-white',
    checkText: 'text-violet-600 dark:text-violet-400',
  },
  amber: {
    stripe: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-100 dark:bg-amber-950/60',
    iconText: 'text-amber-700 dark:text-amber-300',
    ring: 'ring-amber-200/70 dark:ring-amber-800/40',
    badge: '',
    checkText: 'text-amber-600 dark:text-amber-400',
  },
};

export function PricingSection() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async (priceId: string | null | undefined) => {
    if (!priceId) {
      router.push('/dashboard');
      return;
    }

    if (!user) {
      toast({
        title: 'Inicia sesión para continuar',
        description: 'Necesitas una cuenta para suscribirte a un plan.',
        variant: 'destructive',
      });
      router.push('/login?next=/pricing');
      return;
    }

    setIsLoading(priceId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;

      if (!res.ok || !data?.url) {
        toast({
          title: 'No se pudo iniciar el pago',
          description: data?.error ?? 'Inténtalo de nuevo en unos minutos.',
          variant: 'destructive',
        });
        setIsLoading(null);
        return;
      }

      window.location.assign(data.url);
    } catch (err) {
      console.error('checkout error:', err);
      toast({
        title: 'Error inesperado',
        description: 'No pudimos conectar con el servicio de pagos.',
        variant: 'destructive',
      });
      setIsLoading(null);
    }
  };

  return (
    <section className="py-8 sm:py-12">
      <div className="mb-12 space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <Gem className="h-3.5 w-3.5 text-primary" />
          Planes simples y transparentes
        </div>
        <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
          Planes para cada etapa de tu <span className="text-aurora">negocio</span>
        </h2>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
          Empieza gratis y crece a tu ritmo. Cancela cuando quieras.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const a = accentMap[plan.accent];
          return (
            <Card
              key={plan.name}
              className={cn(
                'group relative flex flex-col overflow-hidden border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-aurora',
                plan.isPrimary && 'shadow-aurora-lg ring-2 ring-violet-500/30 dark:ring-violet-400/20'
              )}
            >
              <div className={cn('absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r opacity-80 transition-opacity group-hover:opacity-100', a.stripe)} />

              {plan.badge && (
                <div className="absolute right-4 top-4 z-10">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider', a.badge)}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <CardHeader className="space-y-3 pt-7 text-center">
                <div className={cn('mx-auto flex h-12 w-12 items-center justify-center rounded-xl ring-1', a.iconBg, a.iconText, a.ring)}>
                  <plan.icon className="h-5 w-5" />
                </div>
                <CardTitle className="font-headline text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <div className="mb-6 flex items-baseline justify-center gap-1">
                  <span className="font-headline text-4xl font-bold tracking-tight">{plan.price}</span>
                  {plan.price !== 'Gratis' && (
                    <span className="text-sm text-muted-foreground">MXN/mes</span>
                  )}
                </div>
                <ul className="space-y-2.5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <Check className={cn('mt-0.5 h-4 w-4 shrink-0', a.checkText)} />
                      <span className="text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-2">
                {plan.priceId ? (
                  <Button
                    size="lg"
                    className={cn(
                      'w-full font-semibold',
                      plan.isPrimary && 'shadow-aurora hover:shadow-aurora-lg'
                    )}
                    variant={plan.isPrimary ? 'default' : 'outline'}
                    onClick={() => handleCheckout(plan.priceId)}
                    disabled={isLoading !== null}
                  >
                    {isLoading === plan.priceId ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      plan.cta
                    )}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="w-full font-semibold"
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                  >
                    {plan.cta}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
