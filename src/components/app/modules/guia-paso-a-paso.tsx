
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, BookOpen } from "lucide-react";
import { generateActionPlan } from '@/ai/flows/generate-action-plan';
import type { GenerateActionPlanOutput } from '@/ai/flows/generate-action-plan';

const formSchema = z.object({
  businessIdea: z.string().min(10, {
    message: 'Tu idea de negocio debe tener al menos 10 caracteres.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function GuiaPasoAPasoModule() {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionPlan, setActionPlan] = useState<GenerateActionPlanOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessIdea: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setActionPlan(null);
    try {
      const result = await generateActionPlan(data);
      setActionPlan(result);
      setIsModalOpen(true);
    } catch (e) {
      toast({
          title: "Error al generar la guía",
          description: "Hubo un problema con la IA. Por favor, inténtalo de nuevo.",
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
            name="businessIdea"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea placeholder="Describe tu idea y la IA te dará un plan..." {...field} className="min-h-[100px]"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="sm" className="w-full font-bold" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Generar Guía</>
            )}
          </Button>
        </form>
      </Form>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center gap-2"><BookOpen/> Tu Plan de Acción</DialogTitle>
            <DialogDescription>
              Aquí tienes una guía paso a paso generada por IA para lanzar tu negocio.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-1">
             {actionPlan && actionPlan.plan && (
                <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                    {actionPlan.plan.map((step, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="font-semibold">
                                Paso {step.step}: {step.title}
                            </AccordionTrigger>
                            <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                                {step.description}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
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
