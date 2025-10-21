
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, DollarSign, Loader2, PlusCircle, MinusCircle, History } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { generateResourcePlan } from '@/ai/flows/generate-resource-plan';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser, useFirestore } from '@/firebase';
import { getTransactions, Transaction } from '@/lib/firestore/transactions';
import { TransactionForm } from './transaction-form';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Budget Estimation Components
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import type { GenerateResourcePlanOutput } from '@/ai/flows/generate-resource-plan';


const resourceFormSchema = z.object({
  businessDescription: z.string().min(20, {
    message: 'La descripción debe tener al menos 20 caracteres.',
  }),
});
type ResourceFormValues = z.infer<typeof resourceFormSchema>;


function BudgetPlanner() {
    const [isLoading, setIsLoading] = useState(false);
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
    
    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Describe los recursos que necesitas y la IA te ayudará a crear un presupuesto estimado para tu negocio.
            </p>
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
                <div className="space-y-4 pt-4">
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
    )
}

function FinancialAssistant() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formType, setFormType] = useState<'income' | 'expense'>('income');

    React.useEffect(() => {
        if (user && firestore) {
          setIsLoading(true);
          const unsubscribe = getTransactions(firestore, user.uid, 20, (newTransactions) => {
            setTransactions(newTransactions);
            setIsLoading(false);
          });
          return () => unsubscribe();
        } else if (!user) {
          setIsLoading(false);
          setTransactions([]);
        }
    }, [user, firestore]);

    const openForm = (type: 'income' | 'expense') => {
        setFormType(type);
        setIsFormOpen(true);
    }
    
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Registra tus ventas y gastos para tener un control claro de tus finanzas.
            </p>
            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="font-bold py-6" onClick={() => openForm('income')}>
                    <PlusCircle className="mr-2 h-5 w-5 text-green-500"/> Registrar Venta
                </Button>
                <Button variant="outline" className="font-bold py-6" onClick={() => openForm('expense')}>
                    <MinusCircle className="mr-2 h-5 w-5 text-red-500"/> Registrar Gasto
                </Button>
            </div>

            <TransactionForm 
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                type={formType}
            />

            <div className="pt-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <History className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Historial de Transacciones</h3>
                </div>
                 {isLoading ? (
                    <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
                 ) : transactions.length > 0 ? (
                    <Card>
                        <CardContent className="p-0">
                             <div className="space-y-1">
                                {transactions.map(tx => (
                                    <div key={tx.id} className="flex justify-between items-center p-3 border-b last:border-b-0">
                                        <div>
                                            <p className="font-medium text-sm">{tx.description}</p>
                                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(tx.timestamp, { addSuffix: true, locale: es })}</p>
                                        </div>
                                        <div className={`font-bold text-sm ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                            {tx.type === 'income' ? '+' : '-'} ${tx.amount.toLocaleString('es-MX')}
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </CardContent>
                    </Card>
                 ) : (
                    <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                        <p>Aún no has registrado transacciones.</p>
                        <p>¡Registra tu primera venta o gasto!</p>
                    </div>
                 )}
            </div>
        </div>
    );
}

export function AdministracionRecursosModule() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full font-bold"><Sparkles className="mr-2 h-4 w-4" /> Asistente Financiero</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2"><DollarSign /> Administración de Recursos</DialogTitle>
          <DialogDescription>
            Usa el Asistente Financiero para registrar tus movimientos o el Planificador para estimar un presupuesto inicial.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <Tabs defaultValue="assistant">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="assistant">Asistente Financiero</TabsTrigger>
                    <TabsTrigger value="budget">Presupuesto Inicial</TabsTrigger>
                </TabsList>
                <TabsContent value="assistant" className="mt-4 max-h-[65vh] overflow-y-auto p-1">
                   <FinancialAssistant />
                </TabsContent>
                <TabsContent value="budget" className="mt-4 max-h-[65vh] overflow-y-auto p-1">
                    <BudgetPlanner />
                </TabsContent>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
