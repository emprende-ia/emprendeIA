
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useUser, useFirestore } from '@/firebase';
import { getMarketingCampaigns, toggleCampaignTaskCompletion, type MarketingCampaign } from '@/lib/firestore/marketing-campaigns';
import { Loader2, Target, Check, Circle, Workflow } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

function SavedCampaignsList() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && firestore) {
            setIsLoading(true);
            const unsubscribe = getMarketingCampaigns(firestore, user.uid, (newCampaigns) => {
                setCampaigns(newCampaigns);
                setIsLoading(false);
            });
            return () => unsubscribe();
        } else {
            setIsLoading(false);
            setCampaigns([]);
        }
    }, [user, firestore]);
    
    const handleTaskToggle = (campaignId: string, taskDescription: string, isCompleted: boolean) => {
        if (!user || !firestore) return;
        toggleCampaignTaskCompletion(firestore, user.uid, campaignId, taskDescription, isCompleted);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user) {
        return <p className="text-center text-muted-foreground">Inicia sesión para ver tus campañas guardadas.</p>;
    }

    if (campaigns.length === 0) {
        return <p className="text-center text-muted-foreground">Aún no has guardado ninguna campaña.</p>;
    }

    return (
        <div className="space-y-4">
            {campaigns.map(campaign => {
                const totalTasks = campaign.campaignPlan.actionableTasks.length;
                const completedTasksCount = campaign.completedTasks.length;
                const progress = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;

                return (
                    <Card key={campaign.id} className="bg-card">
                        <CardHeader>
                            <CardTitle className="text-lg">{campaign.campaignIdea.title}</CardTitle>
                            <CardDescription>
                                Guardada {formatDistanceToNow(campaign.createdAt, { addSuffix: true, locale: es })}
                            </CardDescription>
                             <div className="pt-2 space-y-1">
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-muted-foreground">{Math.round(progress)}% completado ({completedTasksCount} de {totalTasks} tareas)</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="plan">
                                    <AccordionTrigger>Ver Plan de Acción</AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-2">
                                        <div className="space-y-1">
                                            <p className="font-semibold text-sm">Estrategia General:</p>
                                            <p className="text-sm text-muted-foreground">{campaign.campaignPlan.strategy}</p>
                                        </div>
                                         <div className="space-y-1">
                                            <p className="font-semibold text-sm">Contenido Sugerido:</p>
                                             <div className="flex flex-wrap gap-2">
                                                {campaign.campaignPlan.contentSuggestions.map((item, i) => <Badge variant="secondary" key={i}>{item}</Badge>)}
                                            </div>
                                        </div>
                                         <div className="space-y-1">
                                            <p className="font-semibold text-sm">KPIs (Métricas de Éxito):</p>
                                             <div className="flex flex-wrap gap-2">
                                                {campaign.campaignPlan.kpis.map((item, i) => <Badge variant="outline" key={i}>{item}</Badge>)}
                                            </div>
                                        </div>
                                         <div className="space-y-2">
                                            <p className="font-semibold text-sm pt-2">Tareas a Realizar:</p>
                                            {campaign.campaignPlan.actionableTasks.map((task, index) => {
                                                 const isCompleted = campaign.completedTasks.includes(task);
                                                 return (
                                                    <div key={index} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-md">
                                                         <Checkbox 
                                                            id={`task-${campaign.id}-${index}`}
                                                            checked={isCompleted}
                                                            onCheckedChange={(checked) => handleTaskToggle(campaign.id, task, !!checked)}
                                                            className="mt-1"
                                                        />
                                                        <label htmlFor={`task-${campaign.id}-${index}`} className={`flex-1 text-sm ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                                            {task}
                                                        </label>
                                                    </div>
                                                 )
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    );
}


export function MisCampanasModule() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full font-bold"><Workflow className="mr-2 h-4 w-4" /> Ver Campañas</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Target /> Mis Campañas de Marketing</DialogTitle>
          <DialogDescription>
            Aquí puedes ver y dar seguimiento a las campañas que has guardado. ¡Marca tus tareas y avanza!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[70vh] overflow-y-auto">
            <SavedCampaignsList />
        </div>
      </DialogContent>
    </Dialog>
  );
}
