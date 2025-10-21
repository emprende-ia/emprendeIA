'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowRight, RefreshCw, Loader2, Bot, Milestone, BrainCircuit, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { analyzeExistingBusiness, type AnalyzeExistingBusinessInput, type AnalyzeExistingBusinessOutput } from '@/ai/flows/analyze-existing-business';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const labelMapping: Record<string, string> = {
    situacionActual: 'Tipo de Negocio',
    tiempoOperacion: 'Tiempo de Operación',
    nivelVentas: 'Nivel de Ventas',
    canalesVenta: 'Canales de Venta',
    mayorDesafio: 'Mayor Desafío Actual',
    publicoActual: 'Público Actual',
    metaCrecimiento: 'Meta de Crecimiento',
};

const valueMapping: Record<string, Record<string, string>> = {
    'tiempoOperacion': { 'menos-6': 'Menos de 6 meses', '6-24': '6 meses – 2 años', 'mas-24': 'Más de 2 años' },
    'nivelVentas': { 'bajas': 'Bajas (cuesta trabajo vender)', 'estables': 'Estables (vendo, pero no crezco)', 'buenas': 'Buenas (vendo bien, pero quiero escalar)' },
};

function ExistingAnalysisPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeExistingBusinessOutput | null>(null);
  
  const formData = useMemo(() => {
    const data: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      data[key] = value;
    }
    return data as unknown as AnalyzeExistingBusinessInput;
  }, [searchParams]);

  const handleEvaluate = async () => {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeExistingBusiness(formData);
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
            <CardTitle className="font-headline text-3xl">Confirmación de Perfil de Negocio</CardTitle>
            <CardDescription>Este es el resumen de tu negocio actual. Revisa que todo esté correcto.</CardDescription>
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
                            Analizando Potencial...
                        </>
                    ) : (
                        <>
                            <BrainCircuit className="mr-2 h-5 w-5" />
                            Evaluar Potencial de Negocio
                        </>
                    )}
                </Button>
            </div>
        )}

        {analysisResult && (
            <Card className="shadow-2xl animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Análisis de Potencial</CardTitle>
                    <CardDescription>La IA ha analizado tu negocio. Aquí están los resultados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert>
                        <Bot className="h-4 w-4" />
                        <AlertTitle className="font-bold">Diagnóstico General de la IA</AlertTitle>
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
                            <h3 className="font-semibold mb-2">Semáforo de Crecimiento</h3>
                             <Alert className={`border-${analysisResult.analysis.growthViability.level.toLowerCase()}-500/50`}>
                                <div className="flex items-center gap-2">
                                    {getViabilityIcon(analysisResult.analysis.growthViability.level)}
                                    <AlertTitle className="font-bold text-lg">Nivel: {analysisResult.analysis.growthViability.level}</AlertTitle>
                                </div>
                                <AlertDescription className="pt-2">{analysisResult.analysis.growthViability.feedback}</AlertDescription>
                            </Alert>
                        </div>
                    </div>
                    
                    <Separator className="my-6" />

                    <div className="text-center p-4 bg-secondary rounded-lg">
                        <p className="font-semibold mb-4">{analysisResult.analysis.recommendation}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button onClick={() => router.push('/admin')} size="lg">
                                <Milestone className="mr-2 h-5 w-5" />
                                Ir a mi Panel de Control
                            </Button>
                            <Button onClick={() => router.push('/start')} variant="outline" size="lg">
                                <RefreshCw className="mr-2 h-5 w-5" />
                                Reformular mi negocio
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

export default function ExistingAnalysisPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <ExistingAnalysisPageContent />
        </Suspense>
    )
}
