'use client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Star, Ticket } from 'lucide-react';
import { BadgeCheck } from 'lucide-react';
import type { SuggestRelevantSuppliersOutput } from '@/ai/flows/suggest-relevant-suppliers';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

type Supplier = SuggestRelevantSuppliersOutput['suppliers'][0];

interface SupplierCardProps {
  supplier: Supplier;
  isVerified?: boolean;
}

export function SupplierCard({ supplier, isVerified = false }: SupplierCardProps) {
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    // Generate random rating on client to avoid hydration mismatch
    setRating(parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)));
    setReviewCount(Math.floor(Math.random() * 200) + 10);
  }, []);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(supplier.location)}`;

  return (
    <Card className="flex h-full flex-col bg-card transition-shadow duration-300 hover:shadow-2xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-headline text-xl">{supplier.name}</CardTitle>
          {isVerified && (
            <Badge variant="outline" className="flex-shrink-0 border-green-500 bg-green-100/80 text-green-700 dark:bg-green-900/50 dark:text-green-400">
              <BadgeCheck className="mr-1 h-4 w-4" />
              Verificado
            </Badge>
          )}
        </div>
        {rating > 0 && (
          <CardDescription className="flex items-center gap-2 pt-1">
            <div className="flex items-center gap-0.5 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-current' : ''}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{rating} ({reviewCount} reseñas)</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-sm text-muted-foreground">{supplier.description}</p>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{supplier.location}</span>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{supplier.contactInfo}</span>
          </div>
          {supplier.specialOffers && (
            <div className="flex items-start gap-3 rounded-md border border-accent/50 bg-accent/10 p-3">
              <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span className="font-semibold text-accent-foreground">{supplier.specialOffers}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="w-full">
          Contactar
        </Button>
        <Button asChild className="w-full">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            <MapPin className="mr-2 h-4 w-4" />
            Ver en Mapa
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
