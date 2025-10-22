
'use client';

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, DollarSign, Loader2, PlusCircle, MinusCircle, History, TrendingUp, TrendingDown, Wallet, MoreHorizontal, Edit, Trash2, PiggyBank, Calculator } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { generateResourcePlan } from '@/ai/flows/generate-resource-plan';
import { analyzeBreakevenPoint } from '@/ai/flows/analyze-breakeven-point';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser, useFirestore } from '@/firebase';
import { getTransactions, deleteTransaction, Transaction, addTransaction } from '@/lib/firestore/transactions';
import { TransactionForm } from './transaction-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from "@/components/ui/input";

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { GenerateResourcePlanOutput } from '@/ai/flows/generate-resource-plan';
import type { AnalyzeBreakevenPointOutput } from '@/ai/flows/analyze-breakeven-point';


const resourceFormSchema = z.object({
  businessDescription: z.string().min(20, {
    message: 'La descripción debe tener al menos 20 caracteres.',
  }),
});
type ResourceFormValues = z.infer<typeof resourceFormSchema>;

const capitalFormSchema = z.object({
  amount: z.coerce.number().positive({ message: 'El capital debe ser un número positivo.' }),
});
type CapitalFormValues = z.infer<typeof capitalFormSchema>;

const breakevenFormSchema = z.object({
  averageSalePrice: z.coerce.number().positive({ message: 'El precio debe ser un número positivo.' }),
});
type BreakevenFormValues = z.infer<typeof breakevenFormSchema>;


function InitialCapitalForm({ setOpen }: { setOpen: (open: boolean) => void }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<CapitalFormValues>({
        resolver: zodResolver(capitalFormSchema),
        defaultValues: { amount: '' as any },
    });

    const onSubmit: SubmitHandler<CapitalFormValues> = async (data) => {
        if (!user || !firestore) {
            toast({ title: "Error", description: "Debes iniciar sesión para realizar esta acción.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            addTransaction(firestore, user.uid, {
                description: 'Capital Inicial',
                amount: data.amount,
                type: 'income',
                category: 'Inversión',
            });
            toast({ title: '¡Capital Inicial establecido!', description: 'Tu balance ha sido actualizado.' });
            setOpen(false);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudo establecer el capital inicial.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monto del Capital Inicial (MXN)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="5000.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Guardar Capital
                </Button>
            </form>
        </Form>
    );
}

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
    const [isCapitalFormOpen, setIsCapitalFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    
    // State for Break-even Point analysis
    const [isBreakevenAnalysisLoading, setIsBreakevenAnalysisLoading] = useState(false);
    const [breakevenResult, setBreakevenResult] = useState<AnalyzeBreakevenPointOutput | null>(null);
    const [isBreakevenDialogOpen, setIsBreakevenDialogOpen] = useState(false);

    const { toast } = useToast();

    const breakevenForm = useForm<BreakevenFormValues>({
        resolver: zodResolver(breakevenFormSchema),
        defaultValues: { averageSalePrice: '' as any },
    });

    React.useEffect(() => {
        if (user && firestore) {
          setIsLoading(true);
          const unsubscribe = getTransactions(firestore, user.uid, 100, (newTransactions) => {
            setTransactions(newTransactions);
            setIsLoading(false);
          });
          return () => unsubscribe();
        } else if (!user) {
          setIsLoading(false);
          setTransactions([]);
        }
    }, [user, firestore]);

    const handleBreakevenSubmit = async (data: BreakevenFormValues) => {
        if (transactions.length < 2) {
            toast({ title: "Datos insuficientes", description: "Necesitas registrar más transacciones de ingresos y gastos para un análisis preciso.", variant: "destructive"});
            return;
        }

        setIsBreakevenAnalysisLoading(true);
        setBreakevenResult(null);
        try {
            const result = await analyzeBreakevenPoint({
                transactions: transactions,
                averageSalePrice: data.averageSalePrice,
            });
            setBreakevenResult(result);
        } catch (error) {
            console.error("Break-even analysis error:", error);
            toast({ title: "Error en el Análisis", description: "La IA no pudo completar el análisis del punto de equilibrio.", variant: "destructive" });
        } finally {
            setIsBreakevenAnalysisLoading(false);
        }
    };


    const handleAddNew = () => {
        setEditingTransaction(null);
        setIsFormOpen(true);
    }

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsFormOpen(true);
    }
    
    const handleDeleteRequest = (transaction: Transaction) => {
        setTransactionToDelete(transaction);
        setIsAlertOpen(true);
    }

    const handleConfirmDelete = () => {
        if (!user || !firestore || !transactionToDelete || !transactionToDelete.id) return;
        deleteTransaction(firestore, user.uid, transactionToDelete.id);
        toast({ title: 'Transacción eliminada' });
        setIsAlertOpen(false);
        setTransactionToDelete(null);
    };

    const { totalIncome, totalExpenses, balance, expenseByCategory } = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        
        const expenseCat = transactions
            .filter(t => t.type === 'expense' && t.category)
            .reduce((acc, t) => {
                acc[t.category!] = (acc[t.category!] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        const expenseByCategoryChartData = Object.entries(expenseCat).map(([name, value], index) => ({ name, value, fill: `hsl(var(--chart-${index + 1}))`}));

        return {
            totalIncome: income,
            totalExpenses: expenses,
            balance: income - expenses,
            expenseByCategory: expenseByCategoryChartData,
        };
    }, [transactions]);
    
    const chartConfig: ChartConfig = useMemo(() => {
        const config: ChartConfig = {};
        expenseByCategory.forEach((item, index) => {
            config[item.name] = {
                label: item.name,
                color: `hsl(var(--chart-${index + 1}))`,
            };
        });
        return config;
    }, [expenseByCategory]);
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">+${totalIncome.toLocaleString('es-MX')}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">-${totalExpenses.toLocaleString('es-MX')}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Balance General</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${balance >= 0 ? 'text-foreground' : 'text-red-500'}`}>${balance.toLocaleString('es-MX')}</div>
                    </CardContent>
                </Card>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Distribución de Gastos</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {expenseByCategory.length > 0 ? (
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                            <PieChart>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={60} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                      const RADIAN = Math.PI / 180;
                                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                      const x  = cx + radius * Math.cos(-midAngle * RADIAN);
                                      const y = cy  + radius * Math.sin(-midAngle * RADIAN);
                                 
                                      return (
                                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                          {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                      );
                                    }}
                                >
                                    {expenseByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                       ) : (
                         <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">No hay gastos para mostrar</div>
                       )}
                    </CardContent>
                </Card>
                 <div className="space-y-4">
                    <div className='flex items-center gap-2'>
                        <Button variant="outline" className="font-bold py-6 text-sm w-full" onClick={handleAddNew}>
                            <PlusCircle className="mr-2 h-5 w-5"/> Registrar Nueva Transacción
                        </Button>
                        <Dialog open={isCapitalFormOpen} onOpenChange={setIsCapitalFormOpen}>
                            <DialogTrigger asChild>
                                <Button variant="secondary" className="font-bold py-6 text-sm">
                                    <PiggyBank className="mr-2 h-5 w-5"/> Capital
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Establecer Capital Inicial</DialogTitle>
                                    <DialogDescription>
                                        Ingresa el monto con el que estás iniciando tu emprendimiento. Esto se registrará como un ingreso de tipo "Inversión".
                                    </DialogDescription>
                                </DialogHeader>
                                <InitialCapitalForm setOpen={setIsCapitalFormOpen} />
                            </DialogContent>
                        </Dialog>
                    </div>

                     <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <History className="h-5 w-5" />
                            <h3 className="text-lg font-semibold">Historial Reciente</h3>
                        </div>
                        {isLoading ? (
                            <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
                        ) : transactions.length > 0 ? (
                            <Card>
                                <CardContent className="p-0 max-h-[160px] overflow-y-auto">
                                    <div className="space-y-1">
                                        {transactions.slice(0, 5).map(tx => (
                                            <div key={tx.id} className="flex justify-between items-center p-3 border-b last:border-b-0">
                                                <div>
                                                    <p className="font-medium text-sm">{tx.description}</p>
                                                    <p className="text-xs text-muted-foreground">{tx.category} • {formatDistanceToNow(tx.timestamp, { addSuffix: true, locale: es })}</p>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                  <div className={`font-bold text-sm ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                                      {tx.type === 'income' ? '+' : '-'} ${tx.amount.toLocaleString('es-MX')}
                                                  </div>
                                                  <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                      </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                      <DropdownMenuItem onSelect={() => handleEdit(tx)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Editar
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem onSelect={() => handleDeleteRequest(tx)} className="text-red-500">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                      </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                  </DropdownMenu>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                                <p>Aún no has registrado transacciones.</p>
                            </div>
                        )}
                        <Dialog open={isBreakevenDialogOpen} onOpenChange={setIsBreakevenDialogOpen}>
                            <DialogTrigger asChild>
                                 <Button variant="outline" className="w-full font-bold">
                                    <Calculator className="mr-2 h-4 w-4" /> Calcular Punto de Equilibrio
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Análisis de Punto de Equilibrio</DialogTitle>
                                    <DialogDescription>
                                        Ingresa el precio de venta promedio de tu producto/servicio para que la IA analice tus finanzas.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...breakevenForm}>
                                    <form onSubmit={breakevenForm.handleSubmit(handleBreakevenSubmit)} className="space-y-4">
                                         <FormField
                                            control={breakevenForm.control}
                                            name="averageSalePrice"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Precio de Venta Promedio por Unidad (MXN)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" placeholder="250.00" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" disabled={isBreakevenAnalysisLoading} className="w-full">
                                            {isBreakevenAnalysisLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                            Analizar Ahora
                                        </Button>
                                    </form>
                                </Form>
                                {breakevenResult && (
                                     <Alert className="mt-4">
                                        <Calculator className="h-4 w-4" />
                                        <AlertTitle className="font-bold">Resultado del Análisis</AlertTitle>
                                        <AlertDescription className="space-y-2">
                                            <p>Necesitas vender <span className="font-bold text-primary">{breakevenResult.breakEvenUnits.toFixed(2)} unidades</span> para alcanzar tu punto de equilibrio.</p>
                                            <p>Esto equivale a <span className="font-bold text-primary">${breakevenResult.breakEvenRevenue.toLocaleString('es-MX')}</span> en ingresos.</p>
                                            <p className="pt-2 text-xs text-muted-foreground">Análisis de la IA: {breakevenResult.analysis}</p>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

            </div>

            <TransactionForm 
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                transaction={editingTransaction}
            />

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente la transacción de tus registros.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDelete}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2"><DollarSign /> Administración de Recursos</DialogTitle>
          <DialogDescription>
            Usa el Asistente Financiero para registrar y visualizar tus movimientos, o el Planificador para estimar un presupuesto inicial.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <Tabs defaultValue="assistant">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="assistant">Asistente Financiero</TabsTrigger>
                    <TabsTrigger value="budget">Presupuesto Inicial</TabsTrigger>
                </TabsList>
                <TabsContent value="assistant" className="mt-6 max-h-[70vh] overflow-y-auto p-1">
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
