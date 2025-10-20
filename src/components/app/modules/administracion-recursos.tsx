
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Sparkles, DollarSign, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { generateResourcePlan } from '@/ai/flows/generate-resource-plan';
import type { GenerateResourcePlanOutput } from '@/ai/flows/generate-resource-plan';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const resourceFormSchema = z.object({
  businessDescription: z.string().min(20, {
    message: 'La descripción debe tener al menos 20 caracteres.',
  }),
});
type ResourceFormValues = z.infer<typeof resourceFormSchema>;


export function AdministracionRecursosModule() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [resourcePlan, setResourcePlan] = useState<GenerateResourcePlanOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: { businessDescription: '' },
  });

  const onSubmit: SubmitHandler<ResourceFormValues> = async (data) => {
    setIsLoading(true);
    setResourcePlan(null);
    try {
      const result = await generateResourcePlan(data);
      setResourcePlan(result);
    } catch (e) {
      toast({
          title: "Error al generar el presupuesto",
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
      setResourcePlan(null);
      setIsLoading(false);
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full font-bold"><Sparkles className="mr-2 h-4 w-4" /> Estimar Presupuesto</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2"><DollarSign /> Administración de Recursos</DialogTitle>
          <DialogDescription>
            Describe los recursos que necesitas y la IA te ayudará a crear un presupuesto estimado para tu negocio.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="businessDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Ej: 'Una cafetería pequeña con 3 empleados, necesito equipo de café, mobiliario básico, marketing inicial y registrar la marca.'" {...field} className="min-h-[100px]"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm" className="w-full font-bold" disabled={isLoading}>
                {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Estimando...</>
                ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Generar Presupuesto</>
                )}
                </Button>
              </form>
            </Form>
            
            {resourcePlan && (
                <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
                    <Alert>
                        <DollarSign className="h-4 w-4" />
                        <AlertTitle className="font-bold">Resumen Financiero</AlertTitle>
                        <AlertDescription>
                            <p className="font-semibold">Costo Total Estimado: {resourcePlan.totalEstimatedCost}</p>
                            <p className="mt-1">{resourcePlan.summary}</p>
                        </AlertDescription>
                    </Alert>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Costo Estimado</TableHead>
                                <TableHead>Justificación</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resourcePlan.budgetItems.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.category}</TableCell>
                                    <TableCell>{item.item}</TableCell>
                                    <TableCell>{item.estimatedCost}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{item.justification}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
