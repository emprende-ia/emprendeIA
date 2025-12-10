
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, FileText, ShieldAlert, CheckCircle, AlertCircle, XCircle, BarChart, ListTodo, Star, Goal, AlertTriangle, ShoppingCart, Info, Loader2 } from 'lucide-react';
import { type AnalyzeBusinessIdeaOutput } from '@/ai/flows/analyze-business-idea';
import { type AnalyzeExistingBusinessOutput } from '@/ai/flows/analyze-existing-business';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { getViabilityAnalysis, type SavedAnalysis, type ViabilityAnalysis } from '@/lib/firestore/analysis';

function AnalysisDisplay({ analysisResult }: { analysisResult: ViabilityAnalysis }) {
    
    // Type guard to check if it's a new venture analysis
    const isNewVentureAnalysis = (analysis: any): analysis is AnalyzeBusinessIdeaOutput => {
        return 'costAnalysis' in analysis.analysis;
    };
    
    // Type guard to check if it's an existing venture analysis
    const isExistingVentureAnalysis = (analysis: any): analysis is AnalyzeExistingBusinessOutput => {
        return 'growthViability' in analysis.analysis;
    };

    const viabilityData = isExistingVentureAnalysis(analysisResult) 
        ? analysisResult.analysis.growthViability
        : (analysisResult as AnalyzeBusinessIdeaOutput).analysis.viability;

    const getViabilityIcon = (level: 'Verde' | 'Amarillo' | 'Rojo') => {
        switch (level) {
          case 'Verde': return <CheckCircle className="h-5 w-5 text-green-500" />;
          case 'Amarillo': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
          case 'Rojo': return <XCircle className="h-5 w-5 text-red-500" />;
          default: return <Bot className="h-5 w-5" />;
        }
    };
    
    const getPriorityBadgeVariant = (priority: 'Alta' | 'Media' | 'Baja'): "destructive" | "secondary" | "outline" => {
        switch (priority) {
          case 'Alta': return 'destructive';
          case 'Media': return 'secondary';
          case 'Baja': return 'outline';
          default: return 'outline';
        }
    }

    return (
        <div className="space-y-6">
            <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle className="font-bold">Comentario de la IA</AlertTitle>
                <AlertDescription className="text-muted-foreground">{analysisResult.analysis.comment}</AlertDescription>
            </Alert>

            {viabilityData && (
                <div className="space-y-6">
                    <h3 className="font-headline text-xl flex items-center gap-2"><ShieldAlert className="h-5 w-5"/>Semáforo de Viabilidad</h3>
                     <Alert className={cn(
                        'border-2',
                        viabilityData.level === 'Verde' && 'border-green-500/50',
                        viabilityData.level === 'Amarillo' && 'border-yellow-500/50',
                        viabilityData.level === 'Rojo' && 'border-red-500/50',
                    )}>
                        <div className="flex items-center gap-3">
                            {getViabilityIcon(viabilityData.level)}
                            <AlertTitle className="font-bold text-xl">{viabilityData.level}: <span className="font-normal">{viabilityData.phrase}</span></AlertTitle>
                        </div>
                    </Alert>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-secondary/50 hover:border-primary/50 transition-colors">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2"><ListTodo className="h-4 w-4"/>Razones</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                    {viabilityData.reasons.map((item, i) => <li key={i}>{item}</li>)}
                                </ol>
                            </CardContent>
                        </Card>
                        <Card className="bg-secondary/50 hover:border-primary/50 transition-colors">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2"><Star className="h-4 w-4"/>Próximos Pasos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                    {viabilityData.nextSteps.map((item, i) => <li key={i}>{item}</li>)}
                                </ol>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Card className="hover:border-primary/50 transition-colors">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2"><Goal className="h-4 w-4"/>
                                  {isExistingVentureAnalysis(analysisResult) ? (
                                      viabilityData.level === 'Verde' ? "Cómo Acelerar el Crecimiento" : "Cómo Estabilizar/Pasar a Crecimiento"
                                  ) : (
                                      viabilityData.level === 'Verde' ? "Cómo Mantenerlo en Verde" : "Cómo Llegar a Verde"
                                  )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                    {viabilityData.howToGetToGreen.map((item, i) => <li key={i}>{item}</li>)}
                                </ol>
                            </CardContent>
                        </Card>
                        {viabilityData.level === 'Rojo' && viabilityData.alternatives && viabilityData.alternatives.length > 0 && (
                            <Card className="hover:border-primary/50 transition-colors">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4"/>
                                        {isExistingVentureAnalysis(analysisResult) ? 'Alternativas Estratégicas' : 'Alternativas Dentro del Giro'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                        {viabilityData.alternatives.map((item, i) => <li key={i}>{item}</li>)}
                                    </ol>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            <Separator className="my-6" />

            <div>
                <h3 className="font-headline text-xl mb-4 flex items-center gap-2"><BarChart className="h-5 w-5"/>Análisis FODA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-green-500/30 hover:border-green-500/80 transition-colors">
                        <CardHeader className="pb-2"><CardTitle className="text-base text-green-500">Fortalezas</CardTitle></CardHeader>
                        <CardContent><ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">{analysisResult.analysis.swot.strengths.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                    </Card>
                     <Card className="border-red-500/30 hover:border-red-500/80 transition-colors">
                        <CardHeader className="pb-2"><CardTitle className="text-base text-red-500">Debilidades</CardTitle></CardHeader>
                        <CardContent><ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">{analysisResult.analysis.swot.weaknesses.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                    </Card>
                     <Card className="border-blue-500/30 hover:border-blue-500/80 transition-colors">
                        <CardHeader className="pb-2"><CardTitle className="text-base text-blue-500">Oportunidades</CardTitle></CardHeader>
                        <CardContent><ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">{analysisResult.analysis.swot.opportunities.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                    </Card>
                     <Card className="border-orange-500/30 hover:border-orange-500/80 transition-colors">
                        <CardHeader className="pb-2"><CardTitle className="text-base text-orange-500">Amenazas</CardTitle></CardHeader>
                        <CardContent><ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">{analysisResult.analysis.swot.threats.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                    </Card>
                </div>
            </div>
          
            {isNewVentureAnalysis(analysisResult) && analysisResult.analysis.costAnalysis && (
                <div>
                     <Separator className="my-6" />
                     <h3 className="font-headline text-xl mb-4 flex items-center gap-2"><ShoppingCart /> Presupuesto de Inversión Inicial</h3>
                     <Alert variant="default" className="mb-4">
                        <Info className="h-4 w-4"/>
                        <AlertTitle className="font-bold">Análisis de Inversión de la IA</AlertTitle>
                        <AlertDescription>{analysisResult.analysis.costAnalysis.summary}</AlertDescription>
                     </Alert>
                     <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Prioridad</TableHead>
                                    <TableHead>Insumo / Gasto</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Costo Estimado (MXN)</TableHead>
                                    <TableHead>Justificación</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analysisResult.analysis.costAnalysis.items.map((item, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Badge variant={getPriorityBadgeVariant(item.priority)}>{item.priority}</Badge></TableCell>
                                        <TableCell className="font-medium">{item.item}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell>{item.costRange}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{item.justification}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     </div>
                </div>
            )}
        </div>
    );
}

interface ViabilityAnalysisViewerProps {
    isMenuItem?: boolean;
}

export function ViabilityAnalysisViewer({ isMenuItem = false }: ViabilityAnalysisViewerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [savedAnalysis, setSavedAnalysis] = useState<SavedAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    useEffect(() => {
        if (!isOpen) return;

        setIsLoading(true);
        if (user && firestore) {
            const unsubscribe = getViabilityAnalysis(firestore, user.uid, (analysis) => {
                setSavedAnalysis(analysis);
                setIsLoading(false);
            });
            return () => unsubscribe();
        } else {
            // Fallback for guest users
            try {
                const localData = localStorage.getItem('viabilityAnalysis');
                if (localData) {
                    setSavedAnalysis({
                        id: 'latest',
                        analysis: JSON.parse(localData),
                        type: 'new-venture', // Assume new-venture for local data
                        savedAt: new Date(),
                    });
                } else {
                    setSavedAnalysis(null);
                }
            } catch (error) {
                console.error("Failed to parse local analysis", error);
                setSavedAnalysis(null);
            }
            setIsLoading(false);
        }
    }, [isOpen, user, firestore]);

    const handleTriggerClick = () => {
        setIsOpen(true);
    };

    const TriggerComponent = isMenuItem ? 'div' : Button;
    const triggerProps = isMenuItem
        ? { className: "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" }
        : { variant: "outline" as any, className: "w-full" };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <TriggerComponent {...triggerProps} onClick={handleTriggerClick}>
                    <FileText className="mr-2 h-4 w-4" /> Mi Análisis
                </TriggerComponent>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Análisis de Viabilidad Guardado</DialogTitle>
                    <DialogDescription>
                        Este es el último análisis de viabilidad que generaste.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[70vh] overflow-y-auto pr-4">
                    {isLoading || isUserLoading ? (
                        <div className="flex items-center justify-center h-40">
                           <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : savedAnalysis ? (
                        <AnalysisDisplay analysisResult={savedAnalysis.analysis} />
                    ) : (
                        <p className="text-center text-muted-foreground py-10">No se encontró ningún análisis guardado. Genera uno desde la página de inicio.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
