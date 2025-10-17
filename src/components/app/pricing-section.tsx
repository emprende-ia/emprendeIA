'use client';

import { Check, Gem, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { createStripeCheckoutSession } from '@/ai/flows/create-stripe-checkout-session';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';


const plans = [
  {
    name: 'Básico',
    icon: User,
    price: 'Gratis',
    priceId: null,
    description: 'Para empezar a explorar y encontrar tus primeros proveedores.',
    features: [
      'Recomendaciones de IA',
      'Directorio de proveedores',
      'Búsquedas limitadas',
    ],
    cta: 'Comenzar Ahora',
    isPrimary: false,
  },
  {
    name: 'Plus',
    icon: Sparkles,
    price: '$19',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PLUS_PRICE_ID,
    description: 'Ideal para emprendedores que buscan optimizar su cadena de suministro.',
    features: [
      'Recomendaciones priorizadas',
      'Acceso a proveedores verificados',
      'Búsquedas ilimitadas',
      'Soporte por correo electrónico',
    ],
    cta: 'Obtener Plan Plus',
    isPrimary: true,
  },
  {
    name: 'Premium',
    icon: Gem,
    price: '$49',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    description: 'Para negocios que necesitan analítica avanzada y máxima visibilidad.',
    features: [
      'Todo en Plus',
      'Reportes de mercado avanzados',
      'Analíticas de perfil de proveedor',
      'Soporte prioritario 24/7',
    ],
    cta: 'Obtener Plan Premium',
    isPrimary: false,
  },
];

export function PricingSection() {
    const { user } = useUser();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleCheckout = async (priceId: string | null | undefined) => {
        if (!user) {
            toast({
                title: 'Inicia sesión para continuar',
                description: 'Necesitas una cuenta para poder suscribirte a un plan.',
                variant: 'destructive',
            });
            router.push('/login');
            return;
        }

        if (!priceId) {
            toast({
                title: 'Plan no disponible',
                description: 'Este plan no requiere un pago.',
            });
            return;
        }

        setIsLoading(priceId);

        try {
            const { sessionUrl } = await createStripeCheckoutSession({
                priceId,
                userEmail: user.email || '',
                userId: user.uid,
            });

            if (sessionUrl) {
                window.location.href = sessionUrl;
            } else {
                throw new Error('No se pudo obtener la URL de checkout.');
            }
        } catch (error: any) {
             toast({
                title: 'Error al crear la sesión de pago',
                description: error.message || 'No se pudo iniciar el proceso de pago. Por favor, inténtalo de nuevo.',
                variant: 'destructive',
            });
            setIsLoading(null);
        }
    };


  return (
     <section className="py-12">
      <div className="text-center mb-12">
        <h2 className="font-headline text-4xl font-bold">Planes para cada etapa de tu negocio</h2>
        <p className="text-muted-foreground text-lg mt-2">Elige el plan que se adapte a tus necesidades y comienza a crecer.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn('flex flex-col', plan.isPrimary && 'border-primary border-2 shadow-lg')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <plan.icon className="h-8 w-8" />
              </div>
              <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-center mb-6">
                <span className="font-headline text-4xl font-bold">{plan.price}</span>
                {plan.price !== 'Gratis' && <span className="text-muted-foreground">/mes</span>}
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
               <Button
                size="lg"
                className="w-full"
                variant={plan.isPrimary ? 'default' : 'outline'}
                onClick={() => handleCheckout(plan.priceId)}
                disabled={!!isLoading}
              >
                {isLoading === plan.priceId ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  plan.cta
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
