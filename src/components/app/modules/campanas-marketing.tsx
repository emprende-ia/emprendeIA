
'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Megaphone, Sparkles, Loader2, Workflow } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateMarketingCampaign } from '@/ai/flows/generate-marketing-campaign';
import { saveCampaign, CampaignIdea, CampaignIdeaSchema } from '@/lib/firestore/marketing-campaigns';
import { useUser, useFirestore } from '@/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

const formSchema = z.object({
  productDescription: z.string().min(15, { message: 'Describe tu producto o servicio con al menos 15 caracteres.' }),
});

type FormValues = z.infer<typeof formSchema>;

export function CampanasMarketingModule() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [campaignIdeas, setCampaignIdeas] = useState<z.infer<typeof CampaignIdeaSchema>[]>([]);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { productDescription: '' },
  });

  useEffect(() => {
    if (isOpen) {
      const savedProfile = localStorage.getItem('businessProfile');
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          form.setValue('productDescription', profile.idea || profile.situacionActual || '');
        } catch (e) {
            console.error("Failed to parse business profile from localStorage", e);
        }
      }
    }
  }, [isOpen, form]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setCampaignIdeas([]);
    try {
      const result = await generateMarketingCampaign(data);
      setCampaignIdeas(result.campaigns);
    } catch (e) {
      toast({
        title: "Error al generar ideas",
        description: "Hubo un problema con la IA. Inténtalo de nuevo.",
        variant: "destructive"
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCampaign = async (campaignIdea: CampaignIdea) => {
    if (!user || !firestore) {
      toast({ title: 'Error', description: 'Debes iniciar sesión para guardar una campaña.', variant: 'destructive' });
      return;
    }
    setIsSaving(campaignIdea.title);
    try {
      await saveCampaign(firestore, user.uid, campaignIdea);
      toast({ title: '¡Campaña guardada!', description: 'Tu plan de acción se está generando. Podrás verlo en "Mis Campañas".' });
      setCampaignIdeas(prev => prev.filter(c => c.title !== campaignIdea.title));
      if(campaignIdeas.length === 1) handleClose();

    } catch(e) {
       toast({ title: 'Error', description: 'No se pudo guardar la campaña.', variant: 'destructive' });
       console.error(e);
    } finally {
        setIsSaving(null);
    }
  };


  const handleClose = () => {
    setIsOpen(false);
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
      setCampaignIdeas([]);
      setIsLoading(false);
      setIsSaving(null);
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full font-bold"><Sparkles className="mr-2 h-4 w-4" /> Generar Campañas</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Megaphone/> Generador de Campañas de Marketing</DialogTitle>
          <DialogDescription>
            Describe tu producto o servicio y la IA generará ideas de campañas para atraer a tus primeros clientes.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="productDescription"
                  render={({ field }) => (
                    <FormItem>
                       <FormLabel>Describe tu producto o servicio:</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ej: 'Vendo café orgánico de Chiapas tostado artesanalmente. Mi público son jóvenes preocupados por la sostenibilidad.'" {...field} className="min-h-[100px]"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                  {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando ideas...</>
                  ) : (
                      <><Sparkles className="mr-2 h-4 w-4" /> Generar Ideas de Campaña</>
                  )}
                </Button>
              </form>
            </Form>

            {campaignIdeas.length > 0 && (
                <div className="space-y-4 pt-4 max-h-[55vh] overflow-y-auto pr-2">
                     <Alert>
                        <AlertTitle className="font-bold">¡Aquí tienes algunas ideas!</AlertTitle>
                        <AlertDescription>Elige una campaña para que la IA desarrolle un plan de acción detallado para ti.</AlertDescription>
                    </Alert>
                    {campaignIdeas.map((idea, index) => (
                        <Card key={index} className="bg-secondary/50">
                            <CardHeader>
                                <CardTitle className="text-lg">{idea.title}</CardTitle>
                                <CardDescription>
                                    <Badge variant="outline">{idea.channel}</Badge>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div>
                                    <p className="font-semibold">Mensaje Clave:</p>
                                    <p className="text-muted-foreground">{idea.keyMessage}</p>
                                </div>
                                 <div>
                                    <p className="font-semibold">Público Objetivo:</p>
                                    <p className="text-muted-foreground">{idea.targetAudience}</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" size="sm" onClick={() => handleSaveCampaign(idea)} disabled={!!isSaving}>
                                     {isSaving === idea.title ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando plan...</>
                                     ) : (
                                        <><Workflow className="mr-2 h-4 w-4" /> Quiero trabajar en esta campaña</>
                                     )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
