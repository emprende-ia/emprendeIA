
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { getLearningPaths, toggleTaskCompletion, saveTaskAudioForPath, type LearningPath } from '@/lib/firestore/learning-paths';
import { generateTaskAudio } from '@/ai/flows/generate-task-audio';
import { Loader2, Route, BookOpen, GraduationCap, Calendar, Video, FileText, BarChart2, Info, HelpCircle, AudioWaveform, PlayCircle, Award, Sparkles, Rocket, PartyPopper } from "lucide-react";
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


function SavedPathsList() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [paths, setPaths] = useState<LearningPath[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAudioLoading, setIsAudioLoading] = useState<string | null>(null);
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);
    const { toast } = useToast();
    
    // State for motivational alert
    const [alertContent, setAlertContent] = useState<{ title: string, description: string, icon: React.ReactNode } | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    // Track shown milestones to prevent re-showing alerts {pathId: [milestone1, milestone2]}
    const [shownMilestones, setShownMilestones] = useState<Record<string, number[]>>({});

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

    const handleAudioHelp = async (pathId: string, taskTitle: string, stepIndex: number) => {
        const audioKey = `${pathId}-${stepIndex}`;

        if (playingAudio === audioKey) {
            setPlayingAudio(null);
            return;
        }

        const path = paths.find(p => p.id === pathId);
        if (!path || !user || !firestore) return;

        const cachedAudio = path.taskAudios?.find(audio => audio.taskKey === taskTitle);

        if (cachedAudio) {
            setPlayingAudio(audioKey);
            const audio = new Audio(cachedAudio.audioUrl);
            audio.play();
            audio.onended = () => setPlayingAudio(null);
            return;
        }

        setIsAudioLoading(audioKey);
        try {
            const step = path.pathData.ruta_aprendizaje[stepIndex];
            const result = await generateTaskAudio({
                taskTitle: step.titulo,
                taskObjective: step.objetivo_de_aprendizaje,
                taskContent: step.contenido_clave.join(', '),
                taskAction: step.tarea_del_dia,
            });
            
            await saveTaskAudioForPath(firestore, user.uid, pathId, taskTitle, result.audioUrl);
            setPlayingAudio(audioKey);
            const audio = new Audio(result.audioUrl);
            audio.play();
            audio.onended = () => setPlayingAudio(null);

            toast({ title: '¡Audio de ayuda listo!', description: 'El audio se ha guardado para futuras consultas.' });
        } catch (error) {
            console.error("Error generating audio:", error);
            toast({ title: 'Error', description: 'No se pudo generar el audio de ayuda.', variant: 'destructive' });
        } finally {
            setIsAudioLoading(null);
        }
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
                                    const isCompleted = path.completedTasks.includes(step.tarea_del_dia);
                                    const audioKey = `${path.id}-${index}`;
                                    
                                    return (
                                        <AccordionItem value={`item-${index}`} key={index}>
                                            <AccordionTrigger>
                                                <div className="flex items-center gap-3">
                                                    {getIconForType(step.tipo)}
                                                    <span className={isCompleted ? "line-through text-muted-foreground" : ""}>{step.titulo}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-4 pl-8">
                                                <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-md">
                                                    <Checkbox 
                                                        id={`task-${path.id}-${index}`}
                                                        checked={isCompleted}
                                                        onCheckedChange={(checked) => handleTaskToggle(path.id, step.tarea_del_dia, !!checked)}
                                                        className="mt-1"
                                                    />
                                                    <label htmlFor={`task-${path.id}-${index}`} className="flex-1">
                                                        <p className="font-semibold">Tarea del Día:</p>
                                                        <p className={`text-sm ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>{step.tarea_del_dia}</p>
                                                    </label>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleAudioHelp(path.id, step.tarea_del_dia, index)} disabled={!!isAudioLoading}>
                                                         {isAudioLoading === audioKey ? (
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                         ) : playingAudio === audioKey ? (
                                                             <AudioWaveform className="mr-2 h-4 w-4" />
                                                         ) : (
                                                            <HelpCircle className="mr-2 h-4 w-4" />
                                                         )}
                                                         {playingAudio === audioKey ? 'Reproduciendo...' : 'Necesito ayuda con esta tarea'}
                                                    </Button>
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
            <SavedPathsList />
        </div>
      </DialogContent>
    </Dialog>
  );
}
