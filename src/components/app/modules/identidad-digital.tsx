'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Palette, Check } from "lucide-react";
import { generateDigitalIdentity } from '@/ai/flows/generate-digital-identity';
import type { GenerateDigitalIdentityOutput } from '@/ai/flows/generate-digital-identity';
import { generateMarketingImage } from '@/ai/flows/generate-marketing-image';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

const identityFormSchema = z.object({
  businessDescription: z.string().min(10, {
    message: 'La descripción de tu negocio debe tener al menos 10 caracteres.',
  }),
});
type IdentityFormValues = z.infer<typeof identityFormSchema>;

const imageFormSchema = z.object({
  prompt: z.string().min(5, {
    message: 'Tu idea para la imagen debe tener al menos 5 caracteres.',
  }),
});
type ImageFormValues = z.infer<typeof imageFormSchema>;


export function IdentidadDigitalModule() {
  const [isIdentityLoading, setIsIdentityLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [identity, setIdentity] = useState<GenerateDigitalIdentityOutput | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const identityForm = useForm<IdentityFormValues>({
    resolver: zodResolver(identityFormSchema),
    defaultValues: { businessDescription: '' },
  });

  const imageForm = useForm<ImageFormValues>({
    resolver: zodResolver(imageFormSchema),
    defaultValues: { prompt: '' },
  });

  const onIdentitySubmit: SubmitHandler<IdentityFormValues> = async (data) => {
    setIsIdentityLoading(true);
    setIdentity(null);
    setGeneratedImage(null); // Reset image when generating new identity
    try {
      const result = await generateDigitalIdentity(data);
      setIdentity(result);
      // Pre-fill image prompt with brand name
      imageForm.setValue('prompt', `Un logo para una marca llamada "${result.brandName}"`);
      setIsModalOpen(true);
    } catch (e) {
      toast({
          title: "Error al crear la identidad",
          description: "Hubo un problema con la IA. Por favor, inténtalo de nuevo.",
          variant: "destructive"
        });
      console.error(e);
    } finally {
      setIsIdentityLoading(false);
    }
  };

  const onImageSubmit: SubmitHandler<ImageFormValues> = async (data) => {
    setIsImageLoading(true);
    setGeneratedImage(null);
    try {
      const result = await generateMarketingImage(data);
      setGeneratedImage(result.imageUrl);
      toast({
        title: "¡Imagen generada!",
        description: "Tu nueva imagen de marca está lista.",
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copiado",
        description: `"${text}" se ha copiado al portapapeles.`,
    });
  }

  return (
    <>
      <Form {...identityForm}>
        <form onSubmit={identityForm.handleSubmit(onIdentitySubmit)} className="space-y-4">
          <FormField
            control={identityForm.control}
            name="businessDescription"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea placeholder="Describe tu negocio para crear su identidad..." {...field} className="min-h-[100px]"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="sm" className="w-full font-bold" disabled={isIdentityLoading}>
            {isIdentityLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Crear Identidad</>
            )}
          </Button>
        </form>
      </Form>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Palette /> Tu Nueva Identidad Digital</DialogTitle>
            <DialogDescription>
              Aquí tienes un kit de marca completo generado por IA. Haz clic en cualquier elemento para copiarlo.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-1 space-y-6">
            {identity && (
              <>
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">NOMBRE DE MARCA</h3>
                    <p className="text-lg font-bold text-primary cursor-pointer hover:opacity-80" onClick={() => copyToClipboard(identity.brandName)}>{identity.brandName}</p>
                </div>
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">ESLOGAN</h3>
                    <p className="text-lg font-medium italic cursor-pointer hover:opacity-80" onClick={() => copyToClipboard(identity.slogan)}>"{identity.slogan}"</p>
                </div>
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">PALETA DE COLORES</h3>
                    <div className="flex gap-2">
                        {identity.colorPalette.map(color => (
                            <div key={color.hex} className="flex-1 cursor-pointer" onClick={() => copyToClipboard(color.hex)}>
                                <div style={{ backgroundColor: color.hex }} className="h-16 w-full rounded-md border-2 border-transparent hover:border-primary transition-all"/>
                                <p className="text-xs text-center mt-1 font-medium">{color.name}</p>
                                <p className="text-xs text-center text-muted-foreground">{color.hex}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator className="my-6"/>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">GENERA UN LOGO O IMAGEN PARA TU MARCA</h3>
                   {generatedImage && (
                      <div className="rounded-md overflow-hidden border border-border">
                      <Image 
                          src={generatedImage} 
                          alt="Imagen de marca generada por IA"
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
                              <Input placeholder="Un logo para una marca llamada..." {...field} />
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
              </>
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
