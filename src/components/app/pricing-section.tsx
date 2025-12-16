'use client';

import { Check, Gem, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { doc, collection, addDoc, onSnapshot, setDoc } from 'firebase/firestore';


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
    name: 'Plan Oro',
    icon: Sparkles,
    price: '$99.00 MXN/mes',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PLUS_PRICE_ID,
    description: 'Ideal para emprendedores que buscan optimizar su cadena de suministro.',
    features: [
      'Recomendaciones priorizadas',
      'Acceso a proveedores verificados',
      'Búsquedas ilimitadas',
      'Soporte por correo electrónico',
    ],
    cta: 'Obtener Plan Oro',
    isPrimary: true,
  },
  {
    name: 'Plan Diamante',
    icon: Gem,
    price: '$149.00 MXN/mes',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    description: 'Para negocios que necesitan analítica avanzada y máxima visibilidad.',
    features: [
      'Todo en Plus',
      'Reportes de mercado avanzados',
      'Analíticas de perfil de proveedor',
      'Soporte prioritario 24/7',
    ],
    cta: 'Obtener Plan Diamante',
    isPrimary: false,
  },
];

export function PricingSection() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleCheckout = async (priceId: string | null | undefined) => {
        if (!user || !firestore) {
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
                title: 'Plan no configurado',
                description: 'El administrador necesita configurar los IDs de precios de Stripe en el archivo .env.',
                variant: 'destructive'
            });
            return;
        }

        setIsLoading(priceId);

        try {
            // Step 1: Ensure the customer document exists.
            const customerDocRef = doc(firestore, 'customers', user.uid);
            await setDoc(customerDocRef, { email: user.email }, { merge: true });

            // Step 2: Create the checkout session document in the sub-collection.
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
            const checkoutSessionsCollection = collection(firestore, 'customers', user.uid, 'checkout_sessions');
            
            const newSessionDoc = await addDoc(checkoutSessionsCollection, {
                price: priceId,
                success_url: `${appUrl}/dashboard?payment=success`,
                cancel_url: `${appUrl}/pricing?payment=cancelled`,
                mode: 'subscription',
                metadata: {
                    firebase_uid: user.uid,
                },
            });
            
            // Step 3: Wait for the Stripe extension to populate the checkout URL.
            const unsubscribe = onSnapshot(
                newSessionDoc,
                (snapshot) => {
                    const data = snapshot.data();
                    if (data?.url) {
                        unsubscribe();
                        window.location.assign(data.url);
                    }
                    if (data?.error) {
                        unsubscribe();
                        console.error("Stripe Extension Error:", data.error.message);
                        toast({
                            title: 'Error al procesar el pago',
                            description: data.error.message || 'No se pudo iniciar el proceso de pago. Inténtalo de nuevo.',
                            variant: 'destructive',
                        });
                        setIsLoading(null);
                    }
                },
                (error) => {
                    unsubscribe();
                    console.error('onSnapshot error:', error);
                    toast({
                        title: 'Error de conexión',
                        description: 'No se pudo conectar con el servicio de pago.',
                        variant: 'destructive',
                    });
                    setIsLoading(null);
                }
            );

            // Add a timeout to prevent the flow from running indefinitely
            setTimeout(() => {
                unsubscribe();
                if (isLoading === priceId) { // Check if we are still loading this specific plan
                    toast({
                        title: 'La solicitud tardó demasiado',
                        description: 'No se pudo obtener la URL de pago. Por favor, revisa la consola y los logs de la extensión de Stripe.',
                        variant: 'destructive',
                    });
                    setIsLoading(null);
                }
            }, 40000); // 40-second timeout

        } catch (error: any) {
            console.error('Error al iniciar el checkout:', error);
            toast({
                title: 'Error Inesperado',
                description: error.message || 'No se pudo iniciar el proceso de pago.',
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
                onClick={() => {
                  if (plan.priceId) {
                    handleCheckout(plan.priceId);
                  } else {
                    router.push('/dashboard');
                  }
                }}
                disabled={isLoading !== null}
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
