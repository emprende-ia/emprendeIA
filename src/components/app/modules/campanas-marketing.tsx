'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from "lucide-react";
import { generateMarketingImage } from '@/ai/flows/generate-marketing-image';
import { generateMarketingCampaign } from '@/ai/flows/generate-marketing-campaign';
import type { GenerateMarketingCampaignOutput } from '@/ai/flows/generate-marketing-campaign';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const imageFormSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Tu idea para la imagen debe tener al menos 10 caracteres.',
  }),
});
type ImageFormValues = z.infer<typeof imageFormSchema>;

const campaignFormSchema = z.object({
  productDescription: z.string().min(10, {
    message: 'La descripción de tu producto debe tener al menos 10 caracteres.',
  }),
});
type CampaignFormValues = z.infer<typeof campaignFormSchema>;

export function CampanasMarketingModule() {
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isCampaignLoading, setIsCampaignLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [campaignIdeas, setCampaignIdeas] = useState<GenerateMarketingCampaignOutput | null>(null);
  const { toast } = useToast();

  const imageForm = useForm<ImageFormValues>({
    resolver: zodResolver(imageFormSchema),
    defaultValues: { prompt: '' },
  });

  const campaignForm = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: { productDescription: '' },
  });

  const onImageSubmit: SubmitHandler<ImageFormValues> = async (data) => {
    setIsImageLoading(true);
    setGeneratedImage(null);
    try {
      const result = await generateMarketingImage(data);
      setGeneratedImage(result.imageUrl);
      toast({
        title: "¡Imagen generada!",
        description: "Tu nueva imagen de marketing está lista.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error al generar la imagen",
        description: "No se pudo generar la imagen. Asegúrate de que tu proyecto de Google Cloud tenga la facturación habilitada.",
        variant: "destructive"
      });
    } finally {
      setIsImageLoading(false);
    }
  };
  
  const onCampaignSubmit: SubmitHandler<CampaignFormValues> = async (data) => {
    setIsCampaignLoading(true);
    setCampaignIdeas(null);
    try {
      const result = await generateMarketingCampaign(data);
      setCampaignIdeas(result);
      toast({
        title: "¡Estrategia generada!",
        description: "Aquí tienes algunas ideas para tu campaña.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error al generar la estrategia",
        description: "Hubo un problema con la IA. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsCampaignLoading(false);
    }
  };

  return (
    <Tabs defaultValue="strategy" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="strategy">Estrategia</TabsTrigger>
        <TabsTrigger value="image">Generar Imagen</TabsTrigger>
      </TabsList>
      <TabsContent value="strategy">
        <div className="space-y-4 pt-2">
            <Form {...campaignForm}>
            <form onSubmit={campaignForm.handleSubmit(onCampaignSubmit)} className="space-y-4">
                <FormField
                control={campaignForm.control}
                name="productDescription"
                render={({ field }) => (
                    <FormItem>
                    <FormControl>
                        <Textarea placeholder="Describe tu producto o servicio..." {...field} className="min-h-[100px]"/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" size="sm" className="w-full font-bold" disabled={isCampaignLoading}>
                {isCampaignLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analizando...</>
                ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Generar Estrategia</>
                )}
                </Button>
            </form>
            </Form>
            {campaignIdeas && (
                <div className="space-y-4 pt-4">
                    {campaignIdeas.campaigns.map((campaign, index) => (
                        <Card key={index} className="bg-secondary/50">
                            <CardHeader>
                                <CardTitle className="text-lg">{campaign.title}</CardTitle>
                                <CardDescription>Canal: {campaign.channel}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <p><span className="font-semibold">Mensaje Clave:</span> {campaign.keyMessage}</p>
                                <p><span className="font-semibold">Público Objetivo:</span> {campaign.targetAudience}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      </TabsContent>
      <TabsContent value="image">
        <div className="space-y-4 pt-2">
            {generatedImage && (
                <div className="rounded-md overflow-hidden border border-border">
                <Image 
                    src={generatedImage} 
                    alt="Imagen de marketing generada por IA"
                    width={500}
                    height={500}
                    className="w-full h-auto object-cover aspect-square"
                />
                </div>
            )}
            <Form {...imageForm}>
                <form onSubmit={imageForm.handleSubmit(onImageSubmit)} className="space-y-4">
                <FormField
                    control={imageForm.control}
                    name="prompt"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                        <Input placeholder="Una imagen de..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" size="sm" className="w-full font-bold" disabled={isImageLoading}>
                    {isImageLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando imagen...</>
                    ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Generar Imagen</>
                    )}
                </Button>
                </form>
            </Form>
        </div>
      </TabsContent>
    </Tabs>
  );
}