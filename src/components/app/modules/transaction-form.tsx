
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { saveTransaction } from '@/lib/firestore/transactions';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  description: z.string().min(3, { message: 'La descripción debe tener al menos 3 caracteres.' }),
  amount: z.coerce.number().positive({ message: 'El monto debe ser un número positivo.' }),
  category: z.string().min(1, { message: 'Debes seleccionar una categoría.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  type: 'income' | 'expense';
}

const incomeCategories = [
    { value: 'Ventas', label: 'Ventas' },
    { value: 'Servicios', label: 'Servicios' },
    { value: 'Inversión', label: 'Inversión' },
    { value: 'Otro', label: 'Otro' },
];

const expenseCategories = [
    { value: 'Inventario', label: 'Inventario/Materiales' },
    { value: 'Renta', label: 'Renta' },
    { value: 'Marketing', label: 'Marketing/Publicidad' },
    { value: 'Servicios', label: 'Servicios (luz, agua, internet)' },
    { value: 'Sueldos', label: 'Sueldos' },
    { value: 'Transporte', label: 'Transporte' },
    { value: 'Otro', label: 'Otro' },
];

export function TransactionForm({ isOpen, setIsOpen, type }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: undefined,
      category: '',
    },
  });
  
  // Reset form when the dialog opens or type changes
  useEffect(() => {
    form.reset({
        description: '',
        amount: undefined,
        category: '',
    });
  }, [isOpen, type, form]);


  const onSubmit = (data: FormValues) => {
    if (!user || !firestore) {
      toast({ title: "Error", description: "Debes iniciar sesión para registrar una transacción.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      saveTransaction(firestore, user.uid, {
        ...data,
        type: type,
      });
      toast({
        title: "¡Transacción registrada!",
        description: `Se ha guardado tu ${type === 'income' ? 'venta' : 'gasto'}.`,
      });
      handleClose();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo guardar la transacción.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setIsOpen(false);
  }

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar {type === 'income' ? 'Venta' : 'Gasto'}</DialogTitle>
          <DialogDescription>
            Añade los detalles de tu transacción para un mejor control.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder={type === 'income' ? 'Venta de 3 cafés americanos' : 'Pago de recibo de luz'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto (MXN)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="150.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full !mt-6">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar {type === 'income' ? 'Venta' : 'Gasto'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
