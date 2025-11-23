
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, FileText, ShieldAlert, CheckCircle, AlertCircle, XCircle, BarChart, ListTodo, Star, Goal, AlertTriangle, ShoppingCart, Info } from 'lucide-react';
import { type AnalyzeBusinessIdeaOutput } from '@/ai/flows/analyze-business-idea';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function AnalysisDisplay({ analysisResult }: { analysisResult: AnalyzeBusinessIdeaOutput }) {
    const viabilityData = analysisResult.analysis.viability;
    const costData = analysisResult.analysis.costAnalysis;

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
                        <Card className="bg-secondary/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2"><ListTodo className="h-4 w-4"/>Razones</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                    {viabilityData.reasons.map((item, i) => <li key={i}>{item}</li>)}
                                </ol>
                            </CardContent>
                        </Card>
                        <Card className="bg-secondary/50">
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
                       <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2"><Goal className="h-4 w-4"/>{viabilityData.level === 'Verde' ? "Cómo Mantenerlo en Verde" : "Cómo Llegar a Verde"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                    {viabilityData.howToGetToGreen.map((item, i) => <li key={i}>{item}</li>)}
                                </ol>
                            </CardContent>
                        </Card>
                        {viabilityData.level === 'Rojo' && viabilityData.alternatives && viabilityData.alternatives.length > 0 && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4"/>Alternativas Dentro del Giro</CardTitle>
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
                    <Card className="border-green-500/30">
                        <CardHeader className="pb-2"><CardTitle className="text-base text-green-500">Fortalezas</CardTitle></CardHeader>
                        <CardContent><ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">{analysisResult.analysis.swot.strengths.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                    </Card>
                     <Card className="border-red-500/30">
                        <CardHeader className="pb-2"><CardTitle className="text-base text-red-500">Debilidades</CardTitle></CardHeader>
                        <CardContent><ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">{analysisResult.analysis.swot.weaknesses.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                    </Card>
                     <Card className="border-blue-500/30">
                        <CardHeader className="pb-2"><CardTitle className="text-base text-blue-500">Oportunidades</CardTitle></CardHeader>
                        <CardContent><ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">{analysisResult.analysis.swot.opportunities.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                    </Card>
                     <Card className="border-orange-500/30">
                        <CardHeader className="pb-2"><CardTitle className="text-base text-orange-500">Amenazas</CardTitle></CardHeader>
                        <CardContent><ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">{analysisResult.analysis.swot.threats.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                    </Card>
                </div>
            </div>
          
            {costData && (
                <div>
                     <Separator className="my-6" />
                     <h3 className="font-headline text-xl mb-4 flex items-center gap-2"><ShoppingCart /> Presupuesto de Inversión Inicial</h3>
                     <Alert variant="default" className="mb-4">
                        <Info className="h-4 w-4"/>
                        <AlertTitle className="font-bold">Análisis de Inversión de la IA</AlertTitle>
                        <AlertDescription>{costData.summary}</AlertDescription>
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
                                {costData.items.map((item, i) => (
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
    const [analysisResult, setAnalysisResult] = useState<AnalyzeBusinessIdeaOutput | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            try {
                const savedAnalysis = localStorage.getItem('viabilityAnalysis');
                if (savedAnalysis) {
                    setAnalysisResult(JSON.parse(savedAnalysis));
                } else {
                    toast({ title: 'No se encontró el análisis', description: 'No hay un análisis de viabilidad guardado para mostrar.', variant: 'destructive'});
                    setIsOpen(false);
                }
            } catch (error) {
                toast({ title: 'Error al cargar el análisis', description: 'No se pudo leer el análisis guardado.', variant: 'destructive'});
                setIsOpen(false);
            }
        }
    }, [isOpen, toast]);

    const TriggerComponent = isMenuItem ? 'div' : Button;
    const triggerProps = isMenuItem
        ? { className: "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" }
        : { variant: "outline" as any, className: "w-full" };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <TriggerComponent {...triggerProps}>
                    <FileText className="mr-2 h-4 w-4" /> Mi Análisis
                </TriggerComponent>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Análisis de Viabilidad Guardado</DialogTitle>
                    <DialogDescription>
                        Este es el último análisis de viabilidad que generaste y guardaste.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[70vh] overflow-y-auto pr-4">
                    {analysisResult ? (
                        <AnalysisDisplay analysisResult={analysisResult} />
                    ) : (
                        <p className="text-center text-muted-foreground">Cargando análisis...</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
    