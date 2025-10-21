'use client';

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, ArrowRight, RefreshCw, Loader2, Bot, Milestone, BrainCircuit, ShieldAlert, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { analyzeBusinessIdea, type AnalyzeBusinessIdeaInput, type AnalyzeBusinessIdeaOutput } from '@/ai/flows/analyze-business-idea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

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
};

const valueMapping: Record<string, Record<string, string>> = {
    'tipoNegocio': { 'fisico': 'Físico', 'en-linea': 'En Línea', 'ambos': 'Ambos' },
    'capitalInicial': { 'bajo': 'Bajo (< $5,000 MXN)', 'medio': 'Medio ($5,000 - $20,000 MXN)', 'alto': 'Alto (> $20,000 MXN)'},
    'experienciaPrevia': { 'principiante': 'Principiante', 'intermedio': 'Intermedio', 'avanzado': 'Avanzado' },
    'disponibilidadTiempo': { 'menos-10': 'Menos de 10h/semana', '10-20': '10-20h/semana', 'mas-20': 'Más de 20h/semana' },
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
      data[key] = value;
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

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-secondary/30 p-4 sm:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Confirmación de Perfil</CardTitle>
            <CardDescription>Este es el resumen de tu idea de negocio. Revisa que todo esté correcto.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="flex flex-col rounded-lg bg-secondary/50 p-3">
                    <span className="font-semibold text-muted-foreground">{labelMapping[key] || key}</span>
                    <span className="text-foreground">
                        {valueMapping[key]?.[value as string] || (value as string).split(',').map(v => v.trim()).join(', ')}
                    </span>
                </div>
            ))}
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
                        <AlertDescription>{analysisResult.analysis.comment}</AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Análisis FODA</h3>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-green-500">Fortalezas</h4>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground pl-2">{analysisResult.analysis.swot.strengths.map((item, i) => <li key={i}>{item}</li>)}</ul>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-red-500">Debilidades</h4>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground pl-2">{analysisResult.analysis.swot.weaknesses.map((item, i) => <li key={i}>{item}</li>)}</ul>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-blue-500">Oportunidades</h4>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground pl-2">{analysisResult.analysis.swot.opportunities.map((item, i) => <li key={i}>{item}</li>)}</ul>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-orange-500">Amenazas</h4>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground pl-2">{analysisResult.analysis.swot.threats.map((item, i) => <li key={i}>{item}</li>)}</ul>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Semáforo de Viabilidad</h3>
                             <Alert className={`border-${analysisResult.analysis.viability.level.toLowerCase()}-500/50`}>
                                <div className="flex items-center gap-2">
                                    {getViabilityIcon(analysisResult.analysis.viability.level)}
                                    <AlertTitle className="font-bold text-lg">Nivel: {analysisResult.analysis.viability.level}</AlertTitle>
                                </div>
                                <AlertDescription className="pt-2">{analysisResult.analysis.viability.feedback}</AlertDescription>
                            </Alert>
                        </div>
                    </div>
                    
                    <Separator className="my-6" />

                    <div className="text-center p-4 bg-secondary rounded-lg">
                        <p className="font-semibold mb-4">¿Qué quieres hacer ahora?</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button onClick={() => router.push('/admin')} size="lg">
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
