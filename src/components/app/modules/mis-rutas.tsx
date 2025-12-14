

'use client';

import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { getLearningPaths, toggleTaskCompletion, type LearningPath } from '@/lib/firestore/learning-paths';
import { generateTaskAudio } from '@/ai/flows/generate-task-audio';
import { Loader2, Route, BookOpen, GraduationCap, Calendar, Video, FileText, BarChart2, Info, HelpCircle, AudioWaveform, Play, Pause, Award, Sparkles, Rocket, PartyPopper } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

const getIconForType = (type: string) => {
    switch (type) {
        case 'infografia': return <BarChart2 className="h-5 w-5 text-blue-500" />;
        case 'video_corto': return <Video className="h-5 w-5 text-purple-500" />;
        case 'guia_paso_a_paso': return <FileText className="h-5 w-5 text-green-500" />;
        case 'mini_ebook': return <BookOpen className="h-5 w-5 text-orange-500" />;
        default: return <Info className="h-5 w-5 text-gray-500" />;
    }
}

const motivationalMessages = {
    25: {
        title: "¡Has dado el primer gran paso!",
        description: "“El secreto para salir adelante es empezar.” - Mark Twain. Ya completaste el 25%, ¡la inercia está de tu lado!",
        icon: <Sparkles className="h-10 w-10 text-yellow-500" />
    },
    50: {
        title: "¡Estás a mitad de camino!",
        description: "“Estoy convencido de que la mitad de lo que separa a los emprendedores exitosos de los no exitosos es la pura perseverancia.” - Steve Jobs. ¡Sigue adelante!",
        icon: <Award className="h-10 w-10 text-blue-500" />
    },
    75: {
        title: "¡La meta está a la vista!",
        description: "“Si puedes soñarlo, puedes hacerlo.” - Walt Disney. Estás a solo un paso de consolidar todo este conocimiento. ¡No te detengas ahora!",
        icon: <Rocket className="h-10 w-10 text-purple-500" />
    },
    100: {
        title: "¡Felicidades, Misión Cumplida!",
        description: "“El éxito es la suma de pequeños esfuerzos repetidos día tras día.” - Robert Collier. Has completado tu ruta. ¡Aplica lo aprendido y ve por tu sueño!",
        icon: <PartyPopper className="h-10 w-10 text-green-500" />
    },
};

// Simple function to play a success sound
const playSuccessSound = () => {
    if (typeof window !== 'undefined') {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (!audioContext) return;

        const playNote = (frequency: number, startTime: number, duration: number) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;
            gainNode.gain.setValueAtTime(0.2, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, startTime + duration);

            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };

        const now = audioContext.currentTime;
        playNote(523.25, now, 0.1); // C5
        playNote(659.25, now + 0.1, 0.1); // E5
        playNote(783.99, now + 0.2, 0.15); // G5
    }
};

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const AudioPlayer = ({
  taskKey,
  onGenerate,
}: {
  taskKey: string;
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

  if (isLoading) {
    return (
      <Button size="sm" variant="outline" disabled className="w-full justify-start">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Generando audio...
      </Button>
    );
  }
  
  if (isCurrentAudio && activeAudio?.url) {
    return (
      <div className="flex w-full items-center gap-2 rounded-lg bg-primary/10 p-2 border border-primary/20 hover:bg-primary/20 transition-colors">
        <Button
          size="icon"
          variant="ghost"
          onClick={isPlaying ? handlePause : handlePlay}
          className="h-8 w-8 flex-shrink-0 rounded-full text-primary hover:bg-primary/20 hover:text-primary"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div className="flex-grow space-y-1">
            <div className="relative h-1 w-full bg-primary/20 rounded-full">
                <div 
                    className="absolute h-1 bg-primary rounded-full"
                    style={{ width: `${audioProgress}%`}}
                />
            </div>
            <div className="flex justify-between text-xs text-primary/80">
                <span>{formatTime(audioTime.currentTime)}</span>
                <span>{formatTime(audioTime.duration)}</span>
            </div>
        </div>
      </div>
    );
  }

  return (
    <Button size="sm" variant="outline" onClick={() => onGenerate(taskKey)} className="w-full justify-start">
      <AudioWaveform className="mr-2 h-4 w-4" />
      Audio-guía de la tarea
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

    const handlePlay = () => audioRef.current?.play();
    const handlePause = () => audioRef.current?.pause();

    const generateAndPlayAudio = async (
        taskKey: string,
        generatorFn: () => Promise<{ audioUrl: string }>
    ) => {
        if (activeAudio?.key === taskKey && audioRef.current) {
            isPlaying ? handlePause() : handlePlay();
            return;
        }

        setIsAudioLoading(taskKey);
        setAudioProgress(0);
        setAudioTime({ currentTime: 0, duration: 0 });
        try {
            const { audioUrl } = await generatorFn();
            setActiveAudio({ key: taskKey, url: audioUrl });
            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.play();
            }
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
        handlePlay,
        handlePause,
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


function SavedPathsList() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [paths, setPaths] = useState<LearningPath[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // State for motivational alert
    const [alertContent, setAlertContent] = useState<{ title: string, description: string, icon: React.ReactNode } | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    // Track shown milestones to prevent re-showing alerts {pathId: [milestone1, milestone2]}
    const [shownMilestones, setShownMilestones] = useState<Record<string, number[]>>({});

    const { generateAndPlayAudio } = useAudioPlayer();

    useEffect(() => {
        if (user && firestore) {
            setIsLoading(true);
            const unsubscribe = getLearningPaths(firestore, user.uid, (newPaths) => {
                // Check for milestone completion when paths are updated
                newPaths.forEach(path => {
                    const totalTasks = path.pathData.ruta_aprendizaje.length;
                    const completedTasksCount = path.completedTasks.length;
                    const progress = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;
                    const milestones = [25, 50, 75, 100];
                    
                    const shownForThisPath = shownMilestones[path.id] || [];

                    for (const milestone of milestones) {
                        if (progress >= milestone && !shownForThisPath.includes(milestone)) {
                            setAlertContent(motivationalMessages[milestone as keyof typeof motivationalMessages]);
                            setIsAlertOpen(true);
                            playSuccessSound();
                            // Mark this milestone as shown for this path
                            setShownMilestones(prev => ({
                                ...prev,
                                [path.id]: [...(prev[path.id] || []), milestone]
                            }));
                            // We only show one alert at a time
                            break;
                        }
                    }
                });

                setPaths(newPaths);
                setIsLoading(false);
            });
            return () => unsubscribe();
        } else if (!user) {
            setIsLoading(false);
            setPaths([]);
        }
    }, [user, firestore, shownMilestones]);
    
    const handleTaskToggle = (pathId: string, taskTitle: string, isCompleted: boolean) => {
        if (!user || !firestore) return;
        toggleTaskCompletion(firestore, user.uid, pathId, taskTitle, isCompleted);
    };

    const handleAudioHelp = (path: LearningPath, step: LearningPath['pathData']['ruta_aprendizaje'][0]) => {
        const taskKey = `${path.id}-${step.tarea_del_dia}`;
        generateAndPlayAudio(taskKey, () => generateTaskAudio({
            taskTitle: step.titulo,
            taskObjective: step.objetivo_de_aprendizaje,
            taskContent: step.contenido_clave.join(', '),
            taskAction: step.tarea_del_dia,
        }));
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user) {
        return <p className="text-center text-muted-foreground">Inicia sesión para ver tus rutas guardadas.</p>;
    }

    if (paths.length === 0) {
        return <p className="text-center text-muted-foreground">Aún no has guardado ninguna guía de aprendizaje.</p>;
    }

    return (
        <div className="space-y-4">
            {paths.map(path => {
                const totalTasks = path.pathData.ruta_aprendizaje.length;
                const completedTasksCount = path.completedTasks.length;
                const progress = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;

                return (
                    <Card key={path.id} className="bg-card">
                        <CardHeader>
                            <CardTitle className="text-lg">Ruta para: {path.pathData.perfil_usuario.giro}</CardTitle>
                            <CardDescription>
                                Guardada {formatDistanceToNow(path.createdAt, { addSuffix: true, locale: es })}
                            </CardDescription>
                            <div className="pt-2 space-y-1">
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-muted-foreground">{Math.round(progress)}% completado ({completedTasksCount} de {totalTasks} tareas)</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {path.pathData.ruta_aprendizaje.map((step, index) => {
                                    const taskKey = step.tarea_del_dia;
                                    const isCompleted = path.completedTasks.includes(taskKey);
                                    
                                    return (
                                        <AccordionItem value={`item-${index}`} key={index}>
                                            <AccordionTrigger>
                                                <div className="flex items-center gap-3">
                                                    {getIconForType(step.tipo)}
                                                    <span className={isCompleted ? "line-through text-muted-foreground" : ""}>{step.titulo}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-4 pl-8">
                                                <div className="flex items-start justify-between gap-4 p-4 bg-secondary/50 rounded-md">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <Checkbox 
                                                            id={`task-${path.id}-${index}`}
                                                            checked={isCompleted}
                                                            onCheckedChange={(checked) => handleTaskToggle(path.id, taskKey, !!checked)}
                                                            className="mt-1"
                                                        />
                                                        <label htmlFor={`task-${path.id}-${index}`} className="flex-1">
                                                            <p className="font-semibold">Tarea del Día:</p>
                                                            <p className={`text-sm ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>{taskKey}</p>
                                                        </label>
                                                    </div>
                                                     <AudioPlayer 
                                                        taskKey={`${path.id}-${taskKey}`}
                                                        onGenerate={() => handleAudioHelp(path, step)}
                                                     />
                                                </div>
                                                
                                                <div>
                                                    <h4 className="font-semibold text-sm">Contenido Clave:</h4>
                                                    <ul className="list-disc list-inside text-sm text-muted-foreground pl-2">
                                                        {step.contenido_clave.map((item, i) => <li key={i}>{item}</li>)}
                                                    </ul>
                                                </div>
                                                
                                                 {step.herramientas_sugeridas.length > 0 && (
                                                    <div>
                                                        <h4 className="font-semibold text-sm">Herramientas Sugeridas:</h4>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {step.herramientas_sugeridas.map((tool, i) => <Badge key={i} variant="secondary">{tool}</Badge>)}
                                                        </div>
                                                    </div>
                                                 )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                            <Separator className="my-6" />
                            <div>
                                <h3 className="font-headline text-md mb-2 flex items-center gap-2"><GraduationCap />Recomendaciones Educativas UTEL</h3>
                                <div className="space-y-3">
                                    {path.pathData.recomendaciones_utel.map((rec, index) => (
                                         <Card key={index} className="bg-secondary/50">
                                            <CardHeader className="p-4">
                                                <CardTitle className="text-sm">{rec.nombre}</CardTitle>
                                                <CardDescription>
                                                    <Badge variant="default" className="text-xs">{rec.tipo}</Badge>
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <p className="text-xs text-muted-foreground mb-3">{rec.por_que_encaja}</p>
                                                <Button size="sm" variant="outline" asChild><a href={rec.link_placeholder} target="_blank" rel="noopener noreferrer">Ver {rec.tipo}</a></Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}

            {alertContent && (
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                            {alertContent.icon}
                        </div>
                        <AlertDialogTitle className="text-center font-headline text-2xl">{alertContent.title}</AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-base pt-2">
                           {alertContent.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setIsAlertOpen(false)}>¡Continuar!</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            )}
        </div>
    );
}

interface MisRutasModuleProps {
  isMenuItem?: boolean;
}

export function MisRutasModule({ isMenuItem = false }: MisRutasModuleProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const TriggerComponent = isMenuItem ? 'div' : Button;
  const triggerProps = isMenuItem
    ? { className: "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full" }
    : { className: "w-full font-bold" };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <TriggerComponent {...triggerProps}>
          <BookOpen className="mr-2 h-4 w-4" /> Mis Rutas
        </TriggerComponent>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Route /> Mis Rutas de Aprendizaje</DialogTitle>
          <DialogDescription>
            Aquí puedes ver y dar seguimiento a las guías que has guardado. ¡Marca tus tareas y avanza!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[70vh] overflow-y-auto">
            <AudioPlayerProvider>
                <SavedPathsList />
            </AudioPlayerProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
