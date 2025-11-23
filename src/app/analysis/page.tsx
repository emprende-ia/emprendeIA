
'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, RefreshCw, Loader2, Bot, Milestone, BrainCircuit, ShieldAlert, CheckCircle, AlertCircle, XCircle, BarChart, ListTodo, Star, Goal, AlertTriangle, ShoppingCart, Info } from 'lucide-react';
import { analyzeBusinessIdea, type AnalyzeBusinessIdeaInput, type AnalyzeBusinessIdeaOutput } from '@/ai/flows/analyze-business-idea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const labelMapping: Record<string, string> = {
    idea: 'Tu Idea',
    tipoNegocio: 'Tipo de Negocio',
    capitalInicial: 'Capital Inicial',
    experienciaPrevia: 'Experiencia Previa',
    publicoObjetivo: 'Público Objetivo',
    objetivoPrincipal: 'Objetivo Principal',
    necesidad: 'Necesidad que Resuelve',
    competencia: 'Competencia',
    disponibilidadTiempo: 'Disponibilidad de Tiempo',
    ubicacionNegocio: 'Ubicación del Negocio',
    tieneInsumos: '¿Ya tienes insumos?',
    insumosDetalle: 'Detalle de Insumos',
};

const valueMapping: Record<string, Record<string, string>> = {
    'tipoNegocio': { 'fisico': 'Físico', 'en-linea': 'En Línea', 'ambos': 'Ambos' },
    'disponibilidadTiempo': { 'menos-20': 'Menos de 20h/semana', '20-40': '20-40h/semana', 'mas-40': 'Más de 40h/semana' },
    'tieneInsumos': { 'si': 'Sí', 'no': 'No' },
};

function AnalysisPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeBusinessIdeaOutput | null>(null);
  
  const formData = useMemo(() => {
    const data: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      if (value) data[key] = value;
    }
    return data as unknown as AnalyzeBusinessIdeaInput;
  }, [searchParams]);

  const handleEvaluate = async () => {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeBusinessIdea(formData);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error during analysis:", error);
      toast({
        title: 'Error en el Análisis',
        description: 'La IA no pudo completar el análisis. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
  
  // Filter out 'necesidad' from the display data if it's the same as 'idea'
  const displayFormData = useMemo(() => {
      const { necesidad, ...rest } = formData;
      if (formData.idea === necesidad) {
          return rest;
      }
      return formData;
  }, [formData]);

  const viabilityData = analysisResult?.analysis.viability;
  const costData = analysisResult?.analysis.costAnalysis;


  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-secondary/30 p-4 sm:p-8">
      <div className="w-full max-w-5xl space-y-8">
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Confirmación de Perfil</CardTitle>
            <CardDescription>Este es el resumen de tu idea de negocio. Revisa que todo esté correcto.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.entries(displayFormData).map(([key, value]) => {
                if (!value) return null; // Don't render empty optional fields
                return (
                    <div key={key} className="flex flex-col rounded-lg bg-secondary/50 p-3">
                        <span className="font-semibold text-muted-foreground">{labelMapping[key] || key}</span>
                        <span className="text-foreground">
                            {valueMapping[key]?.[value as string] || (value as string).split(',').map(v => v.trim()).join(', ')}
                        </span>
                    </div>
                )
            })}
          </CardContent>
        </Card>
        
        {!analysisResult && (
            <div className="text-center">
                <Button onClick={handleEvaluate} disabled={isLoading} size="lg" className="font-bold text-lg">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Analizando Idea...
                        </>
                    ) : (
                        <>
                            <BrainCircuit className="mr-2 h-5 w-5" />
                            Evaluar Viabilidad de la Idea
                        </>
                    )}
                </Button>
            </div>
        )}

        {analysisResult && (
            <Card className="shadow-2xl animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Análisis de Viabilidad</CardTitle>
                    <CardDescription>La IA ha analizado tu idea. Aquí están los resultados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                    
                    <Separator className="my-6" />

                    <div className="text-center p-4 bg-secondary rounded-lg">
                        <p className="font-semibold mb-4">¿Qué quieres hacer ahora?</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button onClick={() => router.push('/dashboard')} size="lg">
                                <Milestone className="mr-2 h-5 w-5" />
                                Ir a mi Panel de Control
                            </Button>
                            <Button onClick={() => router.push('/start')} variant="outline" size="lg">
                                <RefreshCw className="mr-2 h-5 w-5" />
                                Reformular Idea
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}
      </div>
    </main>
  );
}

export default function AnalysisPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <AnalysisPageContent />
        </Suspense>
    )
}

    