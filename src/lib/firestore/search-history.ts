'use client';

import { createClient } from '@/lib/supabase/client';

export interface SearchHistory {
  id?: string;
  term: string;
  timestamp: Date;
  resultingKeywords?: string[];
}

export function saveSearchHistory(
  _firestore: unknown,
  userId: string,
  searchData: Omit<SearchHistory, 'id' | 'timestamp'>
): void {
  if (!userId) return;
  const supabase = createClient();
  void supabase
    .from('search_history')
    .insert({
      user_id: userId,
      term: searchData.term,
      resulting_keywords: searchData.resultingKeywords ?? [],
    })
    .then(({ error }) => {
      if (error) console.error('saveSearchHistory:', error.message);
    });
}

export function deleteSearchHistory(
  _firestore: unknown,
  userId: string,
  searchId: string
): void {
  if (!userId || !searchId) return;
  const supabase = createClient();
  void supabase
    .from('search_history')
    .delete()
    .eq('id', searchId)
    .eq('user_id', userId)
    .then(({ error }) => {
      if (error) console.error('deleteSearchHistory:', error.message);
    });
}

export function getSearchHistory(
  _firestore: unknown,
  userId: string,
  count: number = 10,
  onUpdate: (history: SearchHistory[]) => void
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const supabase = createClient();

  const fetchAll = async () => {
    const { data, error } = await supabase
      .from('search_history')
      .select('id, term, resulting_keywords, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(count);

    if (error) {
      console.error('getSearchHistory:', error.message);
      onUpdate([]);
      return;
    }

    onUpdate(
      (data ?? []).map((row) => ({
        id: row.id,
        term: row.term,
        timestamp: new Date(row.created_at),
        resultingKeywords: row.resulting_keywords ?? [],
      }))
    );
  };

  fetchAll();

  const channel = supabase
    .channel(`search_history:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'search_history',
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
