import { Sparkles } from 'lucide-react';
import React from 'react';

export function AppHeader() {
  return (
    <header className="flex flex-col items-center justify-center space-y-4 pt-12 text-center">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary p-3 shadow-lg">
          <Sparkles className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
          EmprendeIA Marketplace
        </h1>
      </div>
      <p className="max-w-2xl text-lg text-muted-foreground">
        Desde la idea hasta el proveedor. Conectamos tu visión con oportunidades reales, impulsado por inteligencia artificial.
      </p>
    </header>
  );
}
