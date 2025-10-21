
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { saveTransaction } from '@/lib/firestore/transactions';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  description: z.string().min(3, { message: 'La descripción debe tener al menos 3 caracteres.' }),
  amount: z.coerce.number().positive({ message: 'El monto debe ser un número positivo.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  type: 'income' | 'expense';
}

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
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!user || !firestore) {
      toast({ title: "Error", description: "Debes iniciar sesión para registrar una transacción.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      saveTransaction(firestore, user.uid, {
        description: data.description,
        amount: data.amount,
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar {type === 'income' ? 'Venta' : 'Gasto'}</DialogTitle>
          <DialogDescription>
            Añade los detalles de tu transacción.
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
                    <Input type="number" placeholder="150.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar {type === 'income' ? 'Venta' : 'Gasto'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
