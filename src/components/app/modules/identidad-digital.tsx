
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Palette, PenTool, Bot, Image as ImageIcon } from "lucide-react";
import { generateDigitalIdentity, type GenerateDigitalIdentityOutput } from '@/ai/flows/generate-digital-identity';
import { generateOptimizedImage, type GenerateOptimizedImageOutput } from '@/ai/flows/generate-optimized-image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

const identityFormSchema = z.object({
  businessDescription: z.string().min(10, {
    message: 'La descripción de tu negocio debe tener al menos 10 caracteres.',
  }),
});
type IdentityFormValues = z.infer<typeof identityFormSchema>;

export function IdentidadDigitalModule() {
  const [isIdentityLoading, setIsIdentityLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [identityResult, setIdentityResult] = useState<GenerateDigitalIdentityOutput | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GenerateOptimizedImageOutput | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const identityForm = useForm<IdentityFormValues>({
    resolver: zodResolver(identityFormSchema),
    defaultValues: { businessDescription: '' },
  });
  
  const onIdentitySubmit: SubmitHandler<IdentityFormValues> = async (data) => {
    setIsIdentityLoading(true);
    setIdentityResult(null);
    setGeneratedImage(null);
    try {
      const result = await generateDigitalIdentity(data);
      setIdentityResult(result);
      toast({
        title: "¡Identidad Digital Generada!",
        description: "Aquí tienes los elementos clave para tu nueva marca.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error al crear la identidad",
        description: "Hubo un problema con la IA. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsIdentityLoading(false);
    }
  };

  const onImageGenerate = async () => {
      if (!identityResult?.logoPrompt) return;

      setIsImageLoading(true);
      try {
          const result = await generateOptimizedImage({
              prompt: identityResult.logoPrompt,
              creativeType: 'LOGO',
          });
          setGeneratedImage(result);
          toast({
              title: "¡Logo generado!",
              description: "Tu logo está listo para que lo veas."
          });
      } catch (e) {
          console.error(e);
          toast({
              title: "Error al generar la imagen",
              description: "No se pudo crear el logo. Inténtalo de nuevo.",
              variant: "destructive",
          });
      } finally {
          setIsImageLoading(false);
      }
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      identityForm.reset();
      setIdentityResult(null);
      setGeneratedImage(null);
      setIsIdentityLoading(false);
      setIsImageLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full font-bold"><Sparkles className="mr-2 h-4 w-4" /> Crear Identidad</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Palette /> Generador de Identidad Digital</DialogTitle>
          <DialogDescription>
            Describe tu negocio y la IA creará un nombre, eslogan, paleta de colores y hasta un borrador de tu logo.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
            <Form {...identityForm}>
                <form onSubmit={identityForm.handleSubmit(onIdentitySubmit)} className="space-y-4">
                    <FormField
                    control={identityForm.control}
                    name="businessDescription"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <Textarea placeholder="Ej: 'Una marca de ropa sostenible hecha con materiales reciclados para jóvenes conscientes del medio ambiente.'" {...field} className="min-h-[100px]"/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" size="sm" className="w-full font-bold" disabled={isIdentityLoading || isImageLoading}>
                    {isIdentityLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando Magia...</>
                    ) : (
                        <><Sparkles className="mr-2 h-4 w-4" /> Generar Identidad de Marca</>
                    )}
                    </Button>
                </form>
            </Form>

            {identityResult && (
                <div className="space-y-4 pt-4 max-h-[55vh] overflow-y-auto pr-2">
                     <Alert>
                        <Bot className="h-4 w-4" />
                        <AlertTitle className="font-bold">¡Aquí tienes tu nueva Identidad de Marca!</AlertTitle>
                        <AlertDescription>Usa estos elementos como punto de partida para construir una marca sólida y coherente.</AlertDescription>
                    </Alert>

                    {generatedImage ? (
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="aspect-video bg-muted flex items-center justify-center">
                                    <Image src={generatedImage.imageUrl} alt="Logo generado por IA" width={512} height={288} className="object-contain"/>
                                </div>
                                <div className="flex">
                                    {identityResult.colorPalette.map(color => (
                                        <div key={color.hex} style={{ backgroundColor: color.hex }} className="h-4 flex-1"/>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-secondary/50">
                                <CardHeader>
                                    <CardTitle className="text-lg">Nombre de Marca</CardTitle>
                                    <CardDescription>Una sugerencia creativa para tu negocio.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-headline text-2xl text-primary">{identityResult.brandName}</p>
                                </CardContent>
                            </Card>
                             <Card className="bg-secondary/50">
                                <CardHeader>
                                    <CardTitle className="text-lg">Eslogan</CardTitle>
                                    <CardDescription>Una frase corta y memorable.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg italic text-muted-foreground">"{identityResult.slogan}"</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                   
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Paleta de Colores</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            {identityResult.colorPalette.map((color) => (
                                <div key={color.hex} className="flex flex-col items-center gap-2">
                                    <div className="h-16 w-16 rounded-full border-2" style={{ backgroundColor: color.hex }} />
                                    <div className="text-center">
                                        <p className="text-sm font-medium">{color.name}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><PenTool className="h-5 w-5" /> Idea para tu Logo</CardTitle>
                            <CardDescription>Usa esta descripción (prompt) en un generador de imágenes con IA.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm italic p-4 bg-secondary rounded-md text-muted-foreground font-mono">"{identityResult.logoPrompt}"</p>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={onImageGenerate} disabled={isImageLoading || isIdentityLoading} className="w-full">
                                {isImageLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando logo...</>
                                ) : (
                                    <><ImageIcon className="mr-2 h-4 w-4" /> Generar imagen con esta idea</>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
