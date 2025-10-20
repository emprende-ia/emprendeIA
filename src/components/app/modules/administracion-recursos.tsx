
'use client';

import { Button } from "@/components/ui/button";
import { Sparkles, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from "@/components/ui/textarea";

export function AdministracionRecursosModule() {
  // We can add state and logic here later
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full font-bold"><Sparkles className="mr-2 h-4 w-4" /> Estimar Presupuesto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2"><DollarSign /> Administración de Recursos</DialogTitle>
          <DialogDescription>
            (Próximamente) Describe los recursos que necesitas y la IA te ayudará a crear un presupuesto estimado.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <Textarea placeholder="Lista los recursos que necesitas y tu capital inicial..." className="min-h-[150px] bg-background/80 placeholder:text-foreground/70" disabled/>
            <Button size="sm" className="w-full font-bold" disabled>
                <Sparkles className="mr-2 h-4 w-4" />
                Generar Presupuesto (Próximamente)
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
