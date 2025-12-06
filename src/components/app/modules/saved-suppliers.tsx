
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useUser, useFirestore } from '@/firebase';
import { getSavedSuppliers, type SavedSupplier } from '@/lib/firestore/suppliers';
import { Loader2, Bookmark, MapPin, Phone, Ticket, Quote } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

function SavedSuppliersList() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [suppliers, setSuppliers] = useState<SavedSupplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && firestore) {
            setIsLoading(true);
            const unsubscribe = getSavedSuppliers(firestore, user.uid, (newSuppliers) => {
                setSuppliers(newSuppliers);
                setIsLoading(false);
            });
            return () => unsubscribe();
        } else {
            setIsLoading(false);
            setSuppliers([]);
        }
    }, [user, firestore]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user) {
        return <p className="text-center text-muted-foreground">Inicia sesión para ver tus proveedores guardados.</p>;
    }

    if (suppliers.length === 0) {
        return <p className="text-center text-muted-foreground">Aún no has guardado ningún proveedor.</p>;
    }

    return (
        <div className="space-y-4">
            {suppliers.map(supplier => (
                <Card key={supplier.id} className="bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg">{supplier.name}</CardTitle>
                        <CardDescription>
                            Guardado {formatDistanceToNow(supplier.savedAt, { addSuffix: true, locale: es })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="rounded-md border-l-4 border-primary bg-primary/10 p-3 text-sm italic text-muted-foreground">
                            <div className="flex items-start gap-3">
                                <Quote className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{supplier.summaryIA}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>{supplier.location}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>{supplier.contactInfo}</span>
                        </div>
                        {supplier.specialOffers && (
                            <div className="flex items-start gap-3 text-amber-600 dark:text-amber-400">
                                <Ticket className="mt-0.5 h-4 w-4 shrink-0" />
                                <span className="font-semibold">{supplier.specialOffers}</span>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                         <Button asChild variant="secondary" className="w-full">
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(supplier.location)}`} target="_blank" rel="noopener noreferrer">
                                <MapPin className="mr-2 h-4 w-4" />
                                Ver en Mapa
                            </a>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}

export function SavedSuppliersModule() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Bookmark className="mr-2 h-4 w-4" />
          Ver Guardados
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Bookmark /> Mis Proveedores Guardados</DialogTitle>
          <DialogDescription>
            Aquí puedes ver la lista de todos los proveedores que has guardado.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[70vh] overflow-y-auto">
            <SavedSuppliersList />
        </div>
      </DialogContent>
    </Dialog>
  );
}
