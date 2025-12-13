
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useUser, useFirestore } from '@/firebase';
import { getMarketingCampaigns, toggleCampaignTaskCompletion, type MarketingCampaign } from '@/lib/firestore/marketing-campaigns';
import { generateCampaignTaskAudio } from '@/ai/flows/generate-campaign-task-audio';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Target, Workflow, HelpCircle, Play, Pause } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

const AudioPlayerWithProgress = ({
    isLoading,
    isPlaying,
    progress,
    onPlayClick,
    onPauseClick,
    onGenerateClick
}: {
    isLoading: boolean,
    isPlaying: boolean,
    progress: number,
    onPlayClick: () => void,
    onPauseClick: () => void,
    onGenerateClick: () => void
}) => {
    if (isLoading) {
        return (
            <Button size="icon" variant="ghost" disabled className="h-10 w-10">
                <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
        );
    }

    if (progress > 0) {
        return (
            <div className="relative h-10 w-10">
                <svg className="absolute inset-0" viewBox="0 0 36 36">
                    <path
                        className="text-secondary"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.83
                          a 15.9155 15.9155 0 0 1 0 -31.83"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    <path
                        className="text-primary"
                        strokeDasharray={`${progress}, 100`}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.83
                          a 15.9155 15.9155 0 0 1 0 -31.83"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={isPlaying ? onPauseClick : onPlayClick}
                    className="absolute inset-0 m-auto h-8 w-8 rounded-full bg-secondary/50 hover:bg-secondary"
                >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
            </div>
        );
    }

    return (
        <Button size="sm" variant="outline" onClick={onGenerateClick}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Necesito ayuda
        </Button>
    );
};

function SavedCampaignsList() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    
    // State to manage the active audio
    const [activeAudio, setActiveAudio] = useState<{ key: string; url: string; } | null>(null);
    const [isAudioLoading, setIsAudioLoading] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
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

    const handleAudioHelp = async (campaign: MarketingCampaign, task: string) => {
        const audioKey = `${campaign.id}-${task}`;

        if (!user || !firestore) return;

        if (activeAudio?.key === audioKey && audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            return;
        }
        
        setIsAudioLoading(audioKey);

        try {
            const result = await generateCampaignTaskAudio({
                campaignTitle: campaign.campaignIdea.title,
                campaignChannel: campaign.campaignIdea.channel,
                campaignMessage: campaign.campaignIdea.keyMessage,
                taskToExplain: task,
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
        if (audioRef.current) {
            audioRef.current.play();
        }
    };

    const handlePause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };


    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;
    
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => {
            setIsPlaying(false);
            setAudioProgress(0);
        };
        const onTimeUpdate = () => {
            if (audioElement.duration > 0) {
                setAudioProgress((audioElement.currentTime / audioElement.duration) * 100);
            }
        };
    
        audioElement.addEventListener('play', onPlay);
        audioElement.addEventListener('pause', onPause);
        audioElement.addEventListener('ended', onEnded);
        audioElement.addEventListener('timeupdate', onTimeUpdate);
    
        return () => {
            audioElement.removeEventListener('play', onPlay);
            audioElement.removeEventListener('pause', onPause);
            audioElement.removeEventListener('ended', onEnded);
            audioElement.removeEventListener('timeupdate', onTimeUpdate);
        };
    }, []);


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
                                                 const audioKey = `${campaign.id}-${task}`;
                                                 const isCurrentAudio = activeAudio?.key === audioKey;
                                                 
                                                 return (
                                                    <div key={index} className="p-4 bg-secondary/50 rounded-md flex items-start justify-between gap-4">
                                                        <div className="flex items-start gap-3 flex-1">
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
                                                        <AudioPlayerWithProgress
                                                            isLoading={isAudioLoading === audioKey}
                                                            isPlaying={isCurrentAudio && isPlaying}
                                                            progress={isCurrentAudio ? audioProgress : 0}
                                                            onPlayClick={handlePlay}
                                                            onPauseClick={handlePause}
                                                            onGenerateClick={() => handleAudioHelp(campaign, task)}
                                                        />
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
