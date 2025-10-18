
'use client';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

export function CampanasMarketingModule() {
  return (
    <div className="space-y-4">
        <Textarea placeholder="Describe tu público objetivo y producto..." className="min-h-[100px]"/>
        <Button size="sm" className="w-full font-bold">
            <Sparkles className="mr-2 h-4 w-4" />
            Diseñar Campaña
        </Button>
    </div>
  );
}
