
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { suggestRelevantSuppliers } from '@/ai/flows/suggest-relevant-suppliers';
import type { SuggestRelevantSuppliersOutput } from '@/ai/flows/suggest-relevant-suppliers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { SupplierCard } from './supplier-card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useUser, useFirestore } from '@/firebase';
import { saveSearchHistory } from '@/lib/firestore/search-history';


const formSchema = z.object({
  businessPlan: z.string().min(25, {
    message: 'Tu plan de negocio debe tener al menos 25 caracteres.',
  }),
  businessLocation: z.string().min(3, {
    message: "Por favor, ingresa una ubicación válida.",
  }),
  supplierToolSelection: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function MainContent() {
  const [recommendations, setRecommendations] = useState<SuggestRelevantSuppliersOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessPlan: '',
      businessLocation: '',
      supplierToolSelection: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setRecommendations(null);

    if (!user || !firestore) {
      toast({
        title: "Usuario no autenticado",
        description: "Debes iniciar sesión para usar esta función.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await suggestRelevantSuppliers(data);
      if (!result.suppliers || result.suppliers.length === 0) {
        toast({
          title: "No se encontraron proveedores",
          description: "Intenta refinar tu plan de negocio para obtener mejores resultados.",
          variant: "destructive"
        });
      } else {
         // Save the successful search to history
         await saveSearchHistory(firestore, user.uid, {
            term: data.businessPlan,
            resultingKeywords: result.suppliers.map(s => s.name).slice(0, 3), // Example keywords
          });
      }
      setRecommendations(result);
    } catch (e) {
      toast({
          title: "Error Inesperado",
          description: "Hubo un error al generar las recomendaciones. Por favor, inténtalo de nuevo más tarde.",
          variant: "destructive"
        });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <Card className="overflow-hidden border-2 border-primary/20 shadow-lg bg-card">
        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="businessPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-foreground">1. Describe tu idea o plan de negocio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Quiero abrir una cafetería de especialidad en el centro de la ciudad, enfocada en productos orgánicos y un ambiente acogedor para teletrabajadores..."
                        className="min-h-[150px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      La IA analizará tu plan para sugerirte los proveedores más adecuados.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="businessLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-foreground">2. ¿Dónde se ubica tu negocio?</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Ciudad de México, Madrid, Buenos Aires..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Indica tu ciudad o región para encontrar proveedores cercanos a ti.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplierToolSelection"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-foreground">3. ¿Qué tipo de insumos buscas? (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Máquinas de espresso, café orgánico, mobiliario..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Ayuda a la IA a afinar la búsqueda especificando productos o servicios.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full text-lg font-bold transition-transform hover:scale-[1.02]" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-6 w-6" />
                    Obtener Recomendaciones
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>


      {isLoading && (
        <div className="flex flex-col items-center justify-center space-y-4 text-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="font-semibold text-muted-foreground text-lg">Analizando tu plan y buscando los mejores proveedores...</p>
        </div>
      )}
      
      {recommendations && recommendations.suppliers.length > 0 && (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
          <h2 className="font-headline text-4xl font-bold text-center">Proveedores Recomendados para ti</h2>
          
          {recommendations.combinedRecommendation && (
             <Alert className="border-accent bg-accent/10">
              <Lightbulb className="h-4 w-4 text-accent" />
              <AlertTitle className="font-headline text-accent">Recomendación Estratégica</AlertTitle>
              <AlertDescription>
                {recommendations.combinedRecommendation}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {recommendations.suppliers?.map((supplier, index) => (
              <SupplierCard key={index} supplier={supplier} isVerified={index === 0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
