'use client';

import { createClient } from '@/lib/supabase/client';

export interface Transaction {
  id?: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  timestamp: Date;
}

type NewTransactionData = Omit<Transaction, 'id' | 'timestamp'>;

export function addTransaction(
  _firestore: unknown,
  userId: string,
  transactionData: NewTransactionData
): void {
  if (!userId) return;
  const supabase = createClient();
  void supabase
    .from('transactions')
    .insert({
      user_id: userId,
      description: transactionData.description,
      amount: transactionData.amount,
      type: transactionData.type,
      category: transactionData.category || 'Sin categoría',
    })
    .then(({ error }) => {
      if (error) console.error('addTransaction:', error.message);
    });
}

export function updateTransaction(
  _firestore: unknown,
  userId: string,
  transactionId: string,
  transactionData: NewTransactionData
): void {
  if (!userId || !transactionId) return;
  const supabase = createClient();
  void supabase
    .from('transactions')
    .update({
      description: transactionData.description,
      amount: transactionData.amount,
      type: transactionData.type,
      category: transactionData.category || 'Sin categoría',
    })
    .eq('id', transactionId)
    .eq('user_id', userId)
    .then(({ error }) => {
      if (error) console.error('updateTransaction:', error.message);
    });
}

export function deleteTransaction(
  _firestore: unknown,
  userId: string,
  transactionId: string
): void {
  if (!userId || !transactionId) return;
  const supabase = createClient();
  void supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', userId)
    .then(({ error }) => {
      if (error) console.error('deleteTransaction:', error.message);
    });
}

export function getTransactions(
  _firestore: unknown,
  userId: string,
  count: number = 50,
  onUpdate: (transactions: Transaction[]) => void
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const supabase = createClient();

  const fetchAll = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, description, amount, type, category, occurred_at')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })
      .limit(count);

    if (error) {
      console.error('getTransactions:', error.message);
      onUpdate([]);
      return;
    }

    onUpdate(
      (data ?? []).map((row) => ({
        id: row.id,
        description: row.description,
        amount: Number(row.amount),
        type: row.type,
        category: row.category || 'Sin categoría',
        timestamp: new Date(row.occurred_at),
      }))
    );
  };

  fetchAll();

  const channel = supabase
    .channel(`transactions:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        fetchAll();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
