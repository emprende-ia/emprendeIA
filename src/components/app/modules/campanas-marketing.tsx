
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Megaphone, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { BrandCampaign } from './brand-campaign';

export function CampanasMarketingModule() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full font-bold"><Sparkles className="mr-2 h-4 w-4" /> Diseñar Estrategia</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Megaphone/> Guía de Campañas de Marketing</DialogTitle>
          <DialogDescription>
            Aprende a planificar, ejecutar y medir estrategias de marketing efectivas para atraer a tus primeros clientes.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[70vh] overflow-y-auto">
            <BrandCampaign />
        </div>
      </DialogContent>
    </Dialog>
  );
}
