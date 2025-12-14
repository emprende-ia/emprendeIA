

'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useUser, useFirestore, useStorage } from '@/firebase';
import { getMarketingCampaigns, toggleCampaignTaskCompletion, saveTaskAudioForCampaign, type MarketingCampaign } from '@/lib/firestore/marketing-campaigns';
import { generateCampaignTaskAudio } from '@/ai/flows/generate-campaign-task-audio';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Target, Workflow, Play, Pause, AudioWaveform } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const AudioPlayer = ({
  taskKey,
  initialAudioUrl,
  onGenerate,
}: {
  taskKey: string;
  initialAudioUrl?: string;
  onGenerate: (taskKey: string) => void;
}) => {
  const {
    activeAudio,
    isAudioLoading,
    isPlaying,
    audioProgress,
    audioTime,
    handlePlay,
    handlePause,
  } = useAudioPlayer();

  const isCurrentAudio = activeAudio?.key === taskKey;
  const isLoading = isAudioLoading === taskKey;
  const audioUrl = isCurrentAudio ? activeAudio.url : initialAudioUrl;

  if (isLoading) {
    return (
      <Button size="sm" variant="outline" disabled className="w-full justify-start mt-2">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Generando audio...
      </Button>
    );
  }
  
  if (audioUrl) {
    return (
      <div className="flex w-full items-center gap-2 rounded-lg bg-secondary/80 p-2 border border-border hover:bg-secondary transition-colors mt-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={isPlaying && isCurrentAudio ? handlePause : () => handlePlay(taskKey, audioUrl)}
          className="h-8 w-8 flex-shrink-0 rounded-full text-foreground hover:bg-primary/20 hover:text-primary"
        >
          {isPlaying && isCurrentAudio ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div className="flex-grow space-y-1">
            <div className="relative h-1.5 w-full bg-border rounded-full">
                <div 
                    className="absolute h-1.5 bg-primary rounded-full"
                    style={{ width: `${isCurrentAudio ? audioProgress : 0}%`}}
                />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{isCurrentAudio ? formatTime(audioTime.currentTime) : '0:00'}</span>
                <span>{formatTime(audioTime.duration)}</span>
            </div>
        </div>
      </div>
    );
  }

  return (
    <Button size="sm" variant="outline" onClick={() => onGenerate(taskKey)} className="w-full justify-start mt-2">
      <AudioWaveform className="mr-2 h-4 w-4" />
      Necesito ayuda (Audio-guía)
    </Button>
  );
};


const AudioPlayerContext = React.createContext<ReturnType<typeof useProvideAudioPlayer> | null>(null);

const useProvideAudioPlayer = () => {
    const [activeAudio, setActiveAudio] = useState<{ key: string; url: string } | null>(null);
    const [isAudioLoading, setIsAudioLoading] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioTime, setAudioTime] = useState({ currentTime: 0, duration: 0 });
    const audioRef = useRef<HTMLAudioElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => {
            setIsPlaying(false);
            setAudioProgress(0);
            setAudioTime(prev => ({ ...prev, currentTime: 0 }));
        };
        const onTimeUpdate = () => {
            if (audioElement.duration > 0) {
                setAudioProgress((audioElement.currentTime / audioElement.duration) * 100);
                setAudioTime(prev => ({ ...prev, currentTime: audioElement.currentTime }));
            }
        };
        const onLoadedData = () => {
            setAudioTime({ currentTime: 0, duration: audioElement.duration });
        }

        audioElement.addEventListener('play', onPlay);
        audioElement.addEventListener('pause', onPause);
        audioElement.addEventListener('ended', onEnded);
        audioElement.addEventListener('timeupdate', onTimeUpdate);
        audioElement.addEventListener('loadeddata', onLoadedData);

        return () => {
            audioElement.removeEventListener('play', onPlay);
            audioElement.removeEventListener('pause', onPause);
            audioElement.removeEventListener('ended', onEnded);
            audioElement.removeEventListener('timeupdate', onTimeUpdate);
            audioElement.removeEventListener('loadeddata', onLoadedData);
        };
    }, []);

    const play = (key: string, url: string) => {
        if (audioRef.current) {
            if (activeAudio?.key === key) {
                audioRef.current.play();
            } else {
                setActiveAudio({ key, url });
                audioRef.current.src = url;
                audioRef.current.play();
            }
        }
    };
    const pause = () => audioRef.current?.pause();

    const generateAndPlayAudio = async (
        taskKey: string,
        generatorFn: () => Promise<{ audioUrl: string }>,
        onGenerated: (url: string) => void
    ) => {
        if (isAudioLoading) return;
        setIsAudioLoading(taskKey);
        try {
            const { audioUrl } = await generatorFn();
            play(taskKey, audioUrl);
            onGenerated(audioUrl); // Callback to save the URL
        } catch (error) {
            console.error("Error generating audio:", error);
            toast({ title: 'Error', description: 'No se pudo generar el audio de ayuda.', variant: 'destructive' });
        } finally {
            setIsAudioLoading(null);
        }
    };
    
    return {
        activeAudio,
        audioRef,
        isAudioLoading,
        isPlaying,
        audioProgress,
        audioTime,
        handlePlay: play,
        handlePause: pause,
        generateAndPlayAudio
    };
};

const useAudioPlayer = () => {
    const context = useContext(AudioPlayerContext);
    if (!context) {
        throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
    }
    return context;
};

const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const audioPlayer = useProvideAudioPlayer();
    return (
        <AudioPlayerContext.Provider value={audioPlayer}>
            {children}
            <audio ref={audioPlayer.audioRef} />
        </AudioPlayerContext.Provider>
    );
};


function SavedCampaignsList() {
    const { user } = useUser();
    const firestore = useFirestore();
    const storage = useStorage();
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { generateAndPlayAudio } = useAudioPlayer();
    const { toast } = useToast();

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

    const handleAudioHelp = (campaign: MarketingCampaign, task: string) => {
        if (!user || !firestore || !storage) return;
        const taskKey = `${campaign.id}-${task}`;
        generateAndPlayAudio(taskKey, 
            () => generateCampaignTaskAudio({
                campaignTitle: campaign.campaignIdea.title,
                campaignChannel: campaign.campaignIdea.channel,
                campaignMessage: campaign.campaignIdea.keyMessage,
                taskToExplain: task,
            }),
            async (audioDataUrl) => {
                 try {
                    await saveTaskAudioForCampaign(storage, firestore, user.uid, campaign.id, taskKey, audioDataUrl);
                } catch(e) {
                    toast({title: "Error al guardar", description: "No se pudo guardar el audio en tu cuenta.", variant: "destructive"})
                }
            }
        );
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
                const taskAudiosMap = new Map((campaign.taskAudios || []).map(item => [item.taskKey, item.audioUrl]));

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
                                                 const taskKey = `${campaign.id}-${task}`;
                                                 const audioUrl = taskAudiosMap.get(taskKey);

                                                 return (
                                                    <div key={index} className="p-3 bg-secondary/50 rounded-md">
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
                                                         <AudioPlayer 
                                                            taskKey={taskKey}
                                                            initialAudioUrl={audioUrl}
                                                            onGenerate={() => handleAudioHelp(campaign, task)}
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
            <AudioPlayerProvider>
              <SavedCampaignsList />
            </AudioPlayerProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
