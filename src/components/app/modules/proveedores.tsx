
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { suggestRelevantSuppliers } from '@/ai/flows/suggest-relevant-suppliers';
import type { SuggestRelevantSuppliersOutput } from '@/ai/flows/suggest-relevant-suppliers';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import { SupplierCard } from '../supplier-card';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import { useUser, useFirestore } from '@/firebase';
import { saveSearchHistory } from '@/lib/firestore/search-history';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Lightbulb } from 'lucide-react';

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

export function ProveedoresModule() {
  const [recommendations, setRecommendations] = useState<SuggestRelevantSuppliersOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        });
      } else {
         saveSearchHistory(firestore, user.uid, {
            term: data.businessPlan,
            resultingKeywords: result.suppliers.map(s => s.name).slice(0, 3),
          });
         setRecommendations(result);
         setIsModalOpen(true);
      }
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
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="businessPlan"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Describe tu idea de negocio..."
                    className="min-h-[100px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="businessLocation"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="¿Dónde se ubica tu negocio?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="sm" className="w-full font-bold" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Buscar Proveedores</>
            )}
          </Button>
        </form>
      </Form>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Proveedores Recomendados</DialogTitle>
            <DialogDescription>
              Aquí tienes una selección de proveedores generada por IA para tu negocio.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-1">
             {recommendations && (
                <div className="space-y-6">
                    {recommendations.combinedRecommendation && (
                        <Alert className="border-accent bg-accent/10">
                        <Lightbulb className="h-4 w-4 text-accent" />
                        <AlertTitle className="font-headline text-accent">Recomendación Estratégica</AlertTitle>
                        <AlertDescription>
                            {recommendations.combinedRecommendation}
                        </AlertDescription>
                        </Alert>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.suppliers?.map((supplier, index) => (
                        <SupplierCard key={index} supplier={supplier} isVerified={index === 0} />
                        ))}
                    </div>
                </div>
             )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
