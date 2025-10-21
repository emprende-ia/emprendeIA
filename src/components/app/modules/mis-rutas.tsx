
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { getLearningPaths, toggleTaskCompletion, type LearningPath } from '@/lib/firestore/learning-paths';
import { Loader2, Route, BookOpen, GraduationCap, Calendar, Video, FileText, BarChart2, Info } from "lucide-react";
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

function SavedPathsList() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [paths, setPaths] = useState<LearningPath[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (user && firestore) {
            setIsLoading(true);
            const unsubscribe = getLearningPaths(firestore, user.uid, (newPaths) => {
                setPaths(newPaths);
                setIsLoading(false);
            });
            return () => unsubscribe();
        } else if (!user) {
            setIsLoading(false);
            setPaths([]);
        }
    }, [user, firestore]);
    
    const handleTaskToggle = (pathId: string, taskTitle: string, isCompleted: boolean) => {
        if (!user || !firestore) return;
        toggleTaskCompletion(firestore, user.uid, pathId, taskTitle, isCompleted);
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
        </div>
    );
}

export function MisRutasModule() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full font-bold"><Route className="mr-2 h-4 w-4" /> Mis Rutas</Button>
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
