
'use client';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Loader2, Sparkles } from "lucide-react";

export function GuiaPasoAPasoModule() {
  return (
    <div className="space-y-4">
        <Textarea placeholder="Describe tu idea y la IA te dará un plan..." className="min-h-[100px]"/>
        <Button size="sm" className="w-full font-bold">
            <Sparkles className="mr-2 h-4 w-4" />
            Generar Guía
        </Button>
    </div>
  );
}
