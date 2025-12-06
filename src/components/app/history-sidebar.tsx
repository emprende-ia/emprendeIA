
'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { getSearchHistory, deleteSearchHistory, type SearchHistory } from '@/lib/firestore/search-history';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { History, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '../ui/button';

export function HistorySidebar() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && firestore) {
      setIsLoading(true);
      const unsubscribe = getSearchHistory(firestore, user.uid, 15, (newHistory) => {
        setHistory(newHistory);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else if (!user) {
      setIsLoading(false);
      setHistory([]);
    }
  }, [user, firestore]);

  const handleDelete = (searchId: string) => {
    if (user && firestore && searchId) {
      deleteSearchHistory(firestore, user.uid, searchId);
    }
  };

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-primary" />
            <CardTitle>Historial de Búsqueda</CardTitle>
        </div>
        <CardDescription>Tus ideas y búsquedas más recientes.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : history.length > 0 ? (
          <ul className="space-y-4">
            {history.map((item) => (
              <li key={item.id} className="group relative p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => item.id && handleDelete(item.id)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Borrar</span>
                </Button>
                <p className="font-semibold truncate text-sm pr-6">{item.term}</p>
                <p className="text-xs text-muted-foreground pt-1">
                  {formatDistanceToNow(item.timestamp, { addSuffix: true, locale: es })}
                </p>
                {item.resultingKeywords && item.resultingKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                        {item.resultingKeywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary">{keyword}</Badge>
                        ))}
                    </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-8">
            <p>No tienes búsquedas recientes.</p>
            <p>¡Genera tu primera recomendación!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
