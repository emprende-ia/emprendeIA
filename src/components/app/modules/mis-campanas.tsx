
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useUser, useFirestore } from '@/firebase';
import { getMarketingCampaigns, toggleCampaignTaskCompletion, type MarketingCampaign } from '@/lib/firestore/marketing-campaigns';
import { generateCampaignTaskAudio } from '@/ai/flows/generate-campaign-task-audio';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Target, Check, Circle, Workflow, HelpCircle, AudioWaveform, Play, Pause } from "lucide-react";
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
    const [isAudioLoading, setIsAudioLoading] = useState<string | null>(null);
    const { toast } = useToast();
    
    // State to manage the active audio
    const [activeAudio, setActiveAudio] = useState<{ key: string; url: string; } | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);


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

    const handleAudioHelp = async (campaignId: string, taskDescription: string, taskIndex: number) => {
        const audioKey = `${campaignId}-${taskIndex}`;

        if (audioRef.current && activeAudio?.key === audioKey) {
            audioRef.current.play();
            return;
        }
        
        const campaign = campaigns.find(c => c.id === campaignId);
        if (!campaign || !user || !firestore) return;

        setIsAudioLoading(audioKey);
        try {
            const result = await generateCampaignTaskAudio({
                campaignTitle: campaign.campaignIdea.title,
                campaignChannel: campaign.campaignIdea.channel,
                campaignMessage: campaign.campaignIdea.keyMessage,
                taskToExplain: taskDescription,
            });
            
            setActiveAudio({ key: audioKey, url: result.audioUrl });

            if (audioRef.current) {
                audioRef.current.src = result.audioUrl;
                audioRef.current.play();
            }

        } catch (error) {
            console.error("Error generating audio:", error);
            toast({ title: 'Error', description: 'No se pudo generar el audio de ayuda.', variant: 'destructive' });
        } finally {
            setIsAudioLoading(null);
        }
    };
    
    const handlePlay = () => {
        audioRef.current?.play();
    };

    const handlePause = () => {
        audioRef.current?.pause();
    };


    useEffect(() => {
        const audioElement = audioRef.current;
        const onEnded = () => setIsPlaying(false);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        if (audioElement) {
            audioElement.addEventListener('ended', onEnded);
            audioElement.addEventListener('play', onPlay);
            audioElement.addEventListener('pause', onPause);
            return () => {
                audioElement.removeEventListener('ended', onEnded);
                audioElement.removeEventListener('play', onPlay);
                audioElement.removeEventListener('pause', onPause);
            };
        }
    }, [audioRef]);


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
                                                 const audioKey = `${campaign.id}-${index}`;
                                                 const isCurrentAudio = activeAudio?.key === audioKey;
                                                 return (
                                                    <div key={index} className="p-3 bg-secondary/50 rounded-md space-y-3">
                                                        <div className="flex items-start gap-3">
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
                                                        <div className="pl-7 flex items-center gap-2">
                                                          {!isCurrentAudio && (
                                                            <Button size="sm" variant="outline" onClick={() => handleAudioHelp(campaign.id, task, index)} disabled={!!isAudioLoading}>
                                                              {isAudioLoading === audioKey ? (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                              ) : (
                                                                <HelpCircle className="mr-2 h-4 w-4" />
                                                              )}
                                                              {isAudioLoading === audioKey ? 'Generando...' : 'Necesito ayuda'}
                                                            </Button>
                                                          )}
                                                          {isCurrentAudio && !isPlaying && (
                                                            <Button size="sm" variant="outline" onClick={handlePlay}>
                                                              <Play className="mr-2 h-4 w-4" />
                                                              Reproducir
                                                            </Button>
                                                          )}
                                                          {isCurrentAudio && isPlaying && (
                                                            <Button size="sm" variant="outline" onClick={handlePause}>
                                                              <Pause className="mr-2 h-4 w-4" />
                                                              Pausar
                                                            </Button>
                                                          )}
                                                        </div>
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
             <audio ref={audioRef} />
        </div>
    );
}

interface MisCampanasModuleProps {
  isMenuItem?: boolean;
}

export function MisCampanasModule({ isMenuItem = false }: MisCampanasModuleProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const TriggerComponent = isMenuItem ? 'div' : Button;
  const triggerProps = isMenuItem
    ? { className: "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full" }
    : { className: "w-full font-bold" };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <TriggerComponent {...triggerProps}>
          <Workflow className="mr-2 h-4 w-4" /> Mis Campañas
        </TriggerComponent>
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
