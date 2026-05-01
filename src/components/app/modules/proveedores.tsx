'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { suggestRelevantSuppliers } from '@/ai/flows/suggest-relevant-suppliers';
import type { SuggestRelevantSuppliersOutput } from '@/ai/flows/suggest-relevant-suppliers';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Lightbulb, Search, AlertTriangle, Info } from 'lucide-react';
import { SupplierCard } from '../supplier-card';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import { useUser, useFirestore } from '@/firebase';
import { saveSearchHistory } from '@/lib/firestore/search-history';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { SavedSuppliersModule } from './saved-suppliers';

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
  const [isOpen, setIsOpen] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
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

  useEffect(() => {
    if (isOpen) {
      const savedProfile = localStorage.getItem('businessProfile');
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          form.setValue('businessPlan', profile.idea || profile.situacionActual || '');
        } catch (e) {
            console.error("Failed to parse business profile from localStorage", e);
        }
      }
    }
  }, [isOpen, form]);


  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setRecommendations(null);
    setAiError(null);

    try {
      const result = await suggestRelevantSuppliers(data);
      if (!result.suppliers || result.suppliers.length === 0) {
        toast({
          title: "No se encontraron proveedores",
          description: "Intenta refinar tu plan de negocio para obtener mejores resultados.",
        });
      } else {
         if (user && firestore) {
          saveSearchHistory(firestore, user.uid, {
              term: data.businessPlan,
              resultingKeywords: result.suppliers.map(s => s.name).slice(0, 3),
            });
         }
         setRecommendations(result);
      }
    } catch (e: any) {
      console.error(e);
      const errorMsg = e.message || e.toString();
      if (errorMsg.includes('403') || errorMsg.toLowerCase().includes('forbidden') || errorMsg.includes('blocked')) {
          setAiError("API_KEY_ERROR");
      } else {
          toast({
              title: "Error Inesperado",
              description: "Hubo un error al generar las recomendaciones. Por favor, inténtalo de nuevo más tarde.",
              variant: "destructive"
            });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
      setRecommendations(null);
      setAiError(null);
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 font-semibold text-white shadow-md hover:from-amber-700 hover:to-orange-700 hover:shadow-lg"><Sparkles className="mr-2 h-4 w-4" /> Buscar proveedores</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Buscador de Proveedores con IA</DialogTitle>
          <DialogDescription>
            La IA analizará tus necesidades, ubicación y calidad deseada para darte recomendaciones personalizadas.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          <div className="space-y-4">
            
            {aiError === "API_KEY_ERROR" && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive mb-4">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertTitle className="font-bold">IA Bloqueada (403)</AlertTitle>
                    <AlertDescription className="text-sm pt-1">
                        La API de Google rechazó la solicitud. Verifica que tu <b>API Key</b> sea válida y tenga la <b>Generative Language API</b> habilitada.
                    </AlertDescription>
                </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="businessPlan"
                  render={({ field }) => (
                    <FormItem>
                       <FormLabel className="font-semibold">1. ¿Qué estás buscando exactamente?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ej: 'Necesito granos de café de alta calidad para una cafetería orgánica, preferiblemente con entrega rápida y precios competitivos.'"
                          className="min-h-[120px] resize-y"
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
                       <FormLabel className="font-semibold">2. Ubicación para el envío</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 'Colonia Roma, CDMX'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex gap-2 pt-2'>
                <Button type="submit" className="w-full font-bold py-6" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analizando Mercado...</>
                  ) : (
                    <><Search className="mr-2 h-4 w-4" /> Buscar con IA</>
                  )}
                </Button>
                <SavedSuppliersModule />
                </div>
              </form>
            </Form>
            
            <Alert variant="default" className="bg-primary/5 border-primary/20">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-xs text-muted-foreground">
                    La IA busca proveedores reales y genera una justificación basada en tus requisitos de calidad y costo.
                </AlertDescription>
            </Alert>
          </div>

          <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
             {recommendations ? (
                <div className="space-y-6">
                    {recommendations.combinedRecommendation && (
                        <Alert className="border-accent bg-accent/10">
                        <Lightbulb className="h-4 w-4 text-accent" />
                        <AlertTitle className="font-headline text-accent">Estrategia de Suministro</AlertTitle>
                        <AlertDescription className="text-muted-foreground text-sm">
                            {recommendations.combinedRecommendation}
                        </AlertDescription>
                        </Alert>
                    )}
                    <div className="grid grid-cols-1 gap-4">
                        {recommendations.suppliers?.map((supplier, index) => (
                        <SupplierCard key={index} supplier={supplier} isVerified={index === 0} />
                        ))}
                    </div>
                </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 rounded-lg border-2 border-dashed">
                  <Search className="h-12 w-12 mb-4 text-muted-foreground/50"/>
                  <p className="font-semibold">Esperando tus datos...</p>
                  <p className="text-sm">Describe tus necesidades para que la IA pueda rastrear los mejores proveedores para ti.</p>
               </div>
             )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
