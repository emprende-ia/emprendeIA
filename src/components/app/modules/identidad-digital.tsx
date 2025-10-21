
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Palette, PenTool, Bot } from "lucide-react";
import { generateDigitalIdentity } from '@/ai/flows/generate-digital-identity';
import type { GenerateDigitalIdentityOutput } from '@/ai/flows/generate-digital-identity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const identityFormSchema = z.object({
  businessDescription: z.string().min(10, {
    message: 'La descripción de tu negocio debe tener al menos 10 caracteres.',
  }),
});
type IdentityFormValues = z.infer<typeof identityFormSchema>;

export function IdentidadDigitalModule() {
  const [isIdentityLoading, setIsIdentityLoading] = useState(false);
  const [identityResult, setIdentityResult] = useState<GenerateDigitalIdentityOutput | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const identityForm = useForm<IdentityFormValues>({
    resolver: zodResolver(identityFormSchema),
    defaultValues: { businessDescription: '' },
  });
  
  const onIdentitySubmit: SubmitHandler<IdentityFormValues> = async (data) => {
    setIsIdentityLoading(true);
    setIdentityResult(null);
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
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      identityForm.reset();
      setIdentityResult(null);
      setIsIdentityLoading(false);
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
            Describe tu negocio y la IA creará un nombre, eslogan, paleta de colores y una idea para tu logo.
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
                    <Button type="submit" size="sm" className="w-full font-bold" disabled={isIdentityLoading}>
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
                   
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Paleta de Colores</CardTitle>
                            <CardDescription>Colores que reflejan la personalidad de tu marca.</CardDescription>
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
                            <CardDescription>Usa esta descripción (prompt) en un generador de imágenes con IA como Midjourney o DALL-E.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm italic p-4 bg-secondary rounded-md text-muted-foreground font-mono">"{identityResult.logoPrompt}"</p>
                        </CardContent>
                    </Card>

                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
