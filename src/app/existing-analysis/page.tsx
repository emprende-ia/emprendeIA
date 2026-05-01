'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, Loader2, Bot, Milestone, BrainCircuit, CheckCircle, AlertCircle, XCircle, BarChart, ListTodo, Star, Goal, AlertTriangle, ShieldAlert } from 'lucide-react';
import { analyzeExistingBusiness, type AnalyzeExistingBusinessInput, type AnalyzeExistingBusinessOutput } from '@/ai/flows/analyze-existing-business';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useUser, useFirestore } from '@/firebase';
import { saveViabilityAnalysis } from '@/lib/firestore/analysis';

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
  const { user } = useUser();
  const firestore = useFirestore();

  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeExistingBusinessOutput | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  
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
    setAiError(null);
    try {
      const result = await analyzeExistingBusiness(formData);
      setAnalysisResult(result);
      if (user && firestore) {
        await saveViabilityAnalysis(firestore, user.uid, result, 'existing-venture');
        toast({
          title: "¡Análisis Guardado!",
          description: "Tu análisis se ha guardado en tu cuenta.",
        });
      } else {
        localStorage.setItem('viabilityAnalysis', JSON.stringify(result));
        toast({
          title: "Análisis generado",
          description: "Inicia sesión para guardar este análisis en tu cuenta.",
        });
      }
    } catch (error: any) {
      console.error("Error during analysis:", error);
      const errorMsg = error.message || error.toString();
      if (errorMsg.includes('403') || errorMsg.toLowerCase().includes('forbidden') || errorMsg.includes('blocked')) {
          setAiError("API_KEY_ERROR");
      } else {
          toast({
            title: 'Error en el Análisis',
            description: 'La IA no pudo completar el análisis. Por favor, intenta de nuevo.',
            variant: 'destructive',
          });
      }
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

  const growthViabilityData = analysisResult?.analysis.growthViability;

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center overflow-hidden p-4 py-10 sm:p-8">
      <div className="aurora-orb aurora-orb-primary -left-40 -top-40 h-[420px] w-[420px] animate-aurora-shift" />
      <div className="aurora-orb aurora-orb-accent -bottom-40 -right-40 h-[400px] w-[400px] animate-aurora-shift" style={{ animationDelay: '8s' }} />
      <div className="relative z-10 w-full max-w-4xl space-y-8">
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
        
        {aiError === "API_KEY_ERROR" && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive shadow-lg animate-in fade-in zoom-in duration-300">
                <AlertCircle className="h-6 w-6" />
                <AlertTitle className="font-bold text-xl">Error de Conexión IA (403)</AlertTitle>
                <AlertDescription className="space-y-4 pt-3 text-base">
                    <p>Las solicitudes a la IA están siendo bloqueadas. Verifica lo siguiente:</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Tu <b>API Key</b> de Google AI Studio en el archivo <code>.env</code> es correcta.</li>
                        <li>La <b>Generative Language API</b> está habilitada en tu cuenta de Google Cloud/AI Studio.</li>
                    </ol>
                    <div className="bg-background/50 p-4 rounded-md border border-destructive/20 mt-4">
                        <p className="font-bold mb-2">Pasos para corregir:</p>
                        <p>1. Ve a <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline font-bold">Google AI Studio</a>.</p>
                        <p>2. Genera una nueva <b>API Key</b>.</p>
                        <p>3. Actualiza <code>GOOGLE_GENAI_API_KEY</code> en tu <code>.env</code>.</p>
                    </div>
                    <Button onClick={handleEvaluate} variant="outline" className="w-full mt-4 font-bold border-destructive text-destructive hover:bg-destructive hover:text-white">
                        <RefreshCw className="mr-2 h-4 w-4" /> Reintentar Análisis
                    </Button>
                </AlertDescription>
            </Alert>
        )}

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
                            Evaluar Potencial de Crecimiento
                        </>
                    )}
                </Button>
            </div>
        )}

        {analysisResult && growthViabilityData && (
            <Card className="shadow-2xl animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Análisis de Potencial de Crecimiento</CardTitle>
                    <CardDescription>La IA ha analizado tu negocio. Aquí están los resultados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert>
                        <Bot className="h-4 w-4" />
                        <AlertTitle className="font-bold">Diagnóstico General de la IA</AlertTitle>
                        <AlertDescription className="text-muted-foreground">{analysisResult.analysis.comment}</AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="hover:border-primary/50 transition-colors">
                            <h3 className="font-semibold mb-2 flex items-center gap-2"><BarChart className="h-5 w-5"/>Análisis FODA</h3>
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
                        <div className="space-y-4">
                            <h3 className="font-semibold mb-2 flex items-center gap-2"><ShieldAlert className="h-5 w-5"/>Semáforo de Crecimiento</h3>
                             <Alert className={`border-${growthViabilityData.level.toLowerCase()}-500/50`}>
                                <div className="flex items-center gap-2">
                                    {getViabilityIcon(growthViabilityData.level)}
                                    <AlertTitle className="font-bold text-lg">{growthViabilityData.level}: <span className="font-normal">{growthViabilityData.phrase}</span></AlertTitle>
                                </div>
                            </Alert>
                             <Card className="bg-secondary/50 hover:border-primary/50 transition-colors">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2"><ListTodo className="h-4 w-4"/>Razones</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                        {growthViabilityData.reasons.map((item, i) => <li key={i}>{item}</li>)}
                                    </ol>
                                </CardContent>
                            </Card>
                             <Card className="bg-secondary/50 hover:border-primary/50 transition-colors">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2"><Star className="h-4 w-4"/>Próximos Pasos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                        {growthViabilityData.nextSteps.map((item, i) => <li key={i}>{item}</li>)}
                                    </ol>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <Card className="hover:border-primary/50 transition-colors">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2"><Goal className="h-4 w-4"/>{growthViabilityData.level === 'Verde' ? "Cómo Acelerar el Crecimiento" : "Cómo Estabilizar/Pasar a Crecimiento"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                    {growthViabilityData.howToGetToGreen.map((item, i) => <li key={i}>{item}</li>)}
                                </ol>
                            </CardContent>
                        </Card>
                        {growthViabilityData.level === 'Rojo' && growthViabilityData.alternatives && growthViabilityData.alternatives.length > 0 && (
                            <Card className="hover:border-primary/50 transition-colors">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4"/>Alternativas Estratégicas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                        {growthViabilityData.alternatives.map((item, i) => <li key={i}>{item}</li>)}
                                    </ol>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <Separator className="my-6" />

                    <div className="text-center p-4 bg-secondary rounded-lg">
                        <p className="font-semibold mb-4 text-base">{analysisResult.analysis.recommendation}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button onClick={() => router.push('/dashboard')} size="lg">
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
