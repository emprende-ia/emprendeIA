
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
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
  const [isOpen, setIsOpen] = useState(false);
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

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
      setActionPlan(null);
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full font-bold"><Sparkles className="mr-2 h-4 w-4" /> Generar Guía</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2"><BookOpen/> Tu Plan de Acción</DialogTitle>
          <DialogDescription>
            Describe tu idea de negocio y la IA generará una guía paso a paso para ayudarte a empezar.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="businessIdea"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea placeholder="Ej: 'Una marca de ropa sostenible hecha con materiales reciclados para jóvenes.'" {...field} className="min-h-[100px]"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="sm" className="w-full font-bold" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Generar Plan de Acción</>
                )}
              </Button>
            </form>
          </Form>

          {actionPlan && actionPlan.plan && (
            <div className="max-h-[50vh] overflow-y-auto p-1 pt-4">
              <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                  {actionPlan.plan.map((step, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="font-semibold text-left">
                              Paso {step.step}: {step.title}
                          </AccordionTrigger>
                          <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                              {step.description}
                          </AccordionContent>
                      </AccordionItem>
                  ))}
              </Accordion>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
