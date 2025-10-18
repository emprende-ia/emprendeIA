'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from "lucide-react";
import { generateMarketingImage } from '@/ai/flows/generate-marketing-image';
import Image from 'next/image';

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Tu idea para la imagen debe tener al menos 10 caracteres.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function CampanasMarketingModule() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
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
          <Button type="submit" size="sm" className="w-full font-bold" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando imagen...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Generar Imagen</>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
