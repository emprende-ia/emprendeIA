
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Palette, Check } from "lucide-react";
import { generateDigitalIdentity } from '@/ai/flows/generate-digital-identity';
import type { GenerateDigitalIdentityOutput } from '@/ai/flows/generate-digital-identity';

const formSchema = z.object({
  businessDescription: z.string().min(10, {
    message: 'La descripción de tu negocio debe tener al menos 10 caracteres.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function IdentidadDigitalModule() {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [identity, setIdentity] = useState<GenerateDigitalIdentityOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessDescription: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setIdentity(null);
    try {
      const result = await generateDigitalIdentity(data);
      setIdentity(result);
      setIsModalOpen(true);
    } catch (e) {
      toast({
          title: "Error al crear la identidad",
          description: "Hubo un problema con la IA. Por favor, inténtalo de nuevo.",
          variant: "destructive"
        });
      console.error(e);
    } finally {
      setIsLoading(false);
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
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
          <Button type="submit" size="sm" className="w-full font-bold" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Crear Identidad</>
            )}
          </Button>
        </form>
      </Form>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Palette /> Tu Nueva Identidad Digital</DialogTitle>
            <DialogDescription>
              Aquí tienes algunas ideas generadas por IA para tu marca.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
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
