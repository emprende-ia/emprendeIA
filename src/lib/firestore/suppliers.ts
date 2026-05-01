'use client';

import { createClient } from '@/lib/supabase/client';
import type { SuggestRelevantSuppliersOutput } from '@/ai/flows/suggest-relevant-suppliers';

export type SavedSupplierData = SuggestRelevantSuppliersOutput['suppliers'][0];

export interface SavedSupplier extends SavedSupplierData {
  id: string;
  savedAt: Date;
}

export async function saveSupplier(
  _firestore: unknown,
  userId: string,
  supplierData: SavedSupplierData
): Promise<void> {
  if (!userId) {
    return Promise.reject(new Error('User ID is required to save a supplier.'));
  }
  const supabase = createClient();

  // Mapear los campos comunes a columnas y guardar el resto en `raw`.
  const name = (supplierData as { name?: string }).name ?? '';
  const contact = (supplierData as { contact?: string }).contact ?? null;
  const location = (supplierData as { location?: string }).location ?? null;
  const reasoning = (supplierData as { reasoning?: string }).reasoning ?? null;

  const { error } = await supabase.from('saved_suppliers').insert({
    user_id: userId,
    name,
    contact,
    location,
    reasoning,
    raw: supplierData as unknown as never,
  });

  if (error) {
    console.error('saveSupplier:', error.message);
    throw error;
  }
}

export function getSavedSuppliers(
  _firestore: unknown,
  userId: string,
  onUpdate: (suppliers: SavedSupplier[]) => void
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const supabase = createClient();

  const fetchAll = async () => {
    const { data, error } = await supabase
      .from('saved_suppliers')
      .select('id, raw, saved_at')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) {
      console.error('getSavedSuppliers:', error.message);
      onUpdate([]);
      return;
    }

    onUpdate(
      (data ?? []).map((row) => ({
        id: row.id,
        ...(row.raw as SavedSupplierData),
        savedAt: new Date(row.saved_at),
      }))
    );
  };

  fetchAll();

  const channel = supabase
    .channel(`saved_suppliers:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'saved_suppliers',
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
