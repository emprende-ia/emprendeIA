
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, BookOpen, GraduationCap, Calendar, Target, Clock, Bot, Info, Video, FileText, BarChart2, PlusCircle, RefreshCw } from "lucide-react";
import { generateActionPlan, type GenerateActionPlanOutput } from '@/ai/flows/generate-action-plan';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useUser, useFirestore } from '@/firebase';
import { saveLearningPath } from '@/lib/firestore/learning-paths';

const formSchema = z.object({
  giro: z.string().min(10, { message: 'Describe tu idea/negocio con más detalle.' }),
  etapa: z.string({ required_error: 'Debes seleccionar tu etapa actual.' }),
  objetivo: z.string({ required_error: 'Debes seleccionar un objetivo prioritario.' }),
  tiempo_y_formato: z.string().min(5, { message: 'Especifica tu disponibilidad y formato.' }),
});

type FormValues = z.infer<typeof formSchema>;

const etapaOptions = [
    { value: 'Idea', label: 'Tengo una idea' },
    { value: 'Validación', label: 'Estoy validando mi idea' },
    { value: 'Pre-lanzamiento', label: 'Estoy por lanzar' },
    { value: 'Operando (<6 meses)', label: 'Estoy operando (menos de 6 meses)' },
    { value: 'Operando (≥6 meses)', label: 'Estoy operando (más de 6 meses)' },
];

const objetivoOptions = [
    { value: 'Validar mi idea de negocio', label: 'Validar mi idea de negocio' },
    { value: 'Definir mi identidad de marca', label: 'Definir mi identidad de marca' },
    { value: 'Lanzar un producto mínimo viable (MVP)', label: 'Lanzar un producto mínimo viable (MVP)' },
    { value: 'Conseguir mis primeros clientes', label: 'Conseguir mis primeros clientes' },
    { value: 'Optimizar mis campañas de marketing', label: 'Optimizar mis campañas de marketing' },
    { value: 'Ordenar mis finanzas', label: 'Ordenar mis finanzas' },
];

const getIconForType = (type: string) => {
    switch (type) {
        case 'infografia': return <BarChart2 className="h-5 w-5 text-blue-500" />;
        case 'video_corto': return <Video className="h-5 w-5 text-purple-500" />;
        case 'guia_paso_a_paso': return <FileText className="h-5 w-5 text-green-500" />;
        case 'mini_ebook': return <BookOpen className="h-5 w-5 text-orange-500" />;
        default: return <Info className="h-5 w-5 text-gray-500" />;
    }
}

export function GuiaPasoAPasoModule() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [learningPath, setLearningPath] = useState<GenerateActionPlanOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      giro: '',
      tiempo_y_formato: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setLearningPath(null);
    try {
      const result = await generateActionPlan(data);
      setLearningPath(result);
      toast({
          title: "¡Ruta de aprendizaje generada!",
          description: "Tu plan personalizado está listo.",
      });
    } catch (e) {
      toast({
          title: "Error al generar la guía",
          description: "Hubo un problema con la IA. Por favor, inténtalo de nuevo.",
          variant: "destructive"
        });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePath = () => {
    if (!user || !firestore || !learningPath) {
      toast({ title: 'Error', description: 'No se pudo guardar la guía. Asegúrate de haber iniciado sesión.', variant: 'destructive' });
      return;
    }
    saveLearningPath(firestore, user.uid, learningPath);
    toast({ title: '¡Guía guardada!', description: 'Puedes ver tus guías guardadas en "Mis Rutas".' });
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
      setLearningPath(null);
      setIsLoading(false);
    }
  }

  const resetForm = () => {
    form.reset();
    setLearningPath(null);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full font-bold"><Sparkles className="mr-2 h-4 w-4" /> Generar Guía</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2"><BookOpen/> Tu Guía de Aprendizaje Personalizada</DialogTitle>
          <DialogDescription>
            Responde 4 preguntas y la IA creará una ruta de micro-learning para alcanzar tu próximo objetivo.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          {!learningPath && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField name="giro" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>1. Describe tu idea o negocio actual</FormLabel><FormControl><Textarea placeholder="Ej: 'Una tienda en línea de joyería artesanal' o 'Servicio de consultoría para PyMEs'" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="etapa" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>2. ¿En qué etapa te encuentras?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona tu etapa" /></SelectTrigger></FormControl>
                          <SelectContent>{etapaOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                  )}/>
                    <FormField name="objetivo" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>3. ¿Cuál es tu objetivo prioritario?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona tu objetivo" /></SelectTrigger></FormControl>
                          <SelectContent>{objetivoOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )}/>
                </div>
                <FormField name="tiempo_y_formato" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>4. ¿Cuánto tiempo diario tienes y qué formato prefieres?</FormLabel><FormControl><Input placeholder="Ej: '20 min/día, prefiero leer guías'" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                
                <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando ruta...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Crear Mi Guía</>
                  )}
                </Button>
              </form>
            </Form>
          )}

          {learningPath && (
            <div className="max-h-[65vh] overflow-y-auto p-1 space-y-6 pt-4">
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button onClick={handleSavePath}><PlusCircle className="mr-2 h-4 w-4" /> Quiero empezar a trabajar con esta guía</Button>
                    <Button onClick={resetForm} variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Generar otra guía</Button>
                </div>
                <Alert className="bg-primary/5">
                    <Bot className="h-4 w-4" />
                    <AlertTitle className="font-bold">Razonamiento de la IA</AlertTitle>
                    <AlertDescription className="text-muted-foreground">{learningPath.perfil_usuario.razonamiento_breve}</AlertDescription>
                </Alert>
                
                <Separator />

                <div>
                    <h3 className="font-headline text-lg mb-4">Tu Ruta de Aprendizaje Personalizada</h3>
                    <div className="space-y-3">
                        {learningPath.ruta_aprendizaje.map((step, index) => (
                           <Card key={index} className="bg-secondary/50">
                               <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
                                    {getIconForType(step.tipo)}
                                    <div className="flex-1">
                                       <CardTitle className="text-base">{step.titulo}</CardTitle>
                                       <CardDescription className="text-xs">
                                            {step.tipo.replace(/_/g, ' ')} • {step.duracion_estimada}
                                       </CardDescription>
                                    </div>
                               </CardHeader>
                               <CardContent className="p-4 pt-0">
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger className="text-sm py-2">Ver detalles</AccordionTrigger>
                                            <AccordionContent className="space-y-3 text-sm">
                                                <div>
                                                    <h4 className="font-semibold">Objetivo:</h4>
                                                    <p className="text-muted-foreground">{step.objetivo_de_aprendizaje}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">Contenido Clave:</h4>
                                                    <ul className="list-disc list-inside text-muted-foreground pl-2">
                                                        {step.contenido_clave.map((item, i) => <li key={i}>{item}</li>)}
                                                    </ul>
                                                </div>
                                                 <div>
                                                    <h4 className="font-semibold">Tarea del Día:</h4>
                                                    <p className="text-muted-foreground">{step.tarea_del_dia}</p>
                                                </div>
                                                 <div>
                                                    <h4 className="font-semibold">Métricas de Éxito:</h4>
                                                     <div className="flex flex-wrap gap-2 mt-1">
                                                        {step.metricas_de_exito.map((metric, i) => <Badge key={i} variant="outline">{metric}</Badge>)}
                                                    </div>
                                                </div>
                                                 {step.herramientas_sugeridas.length > 0 && (
                                                    <div>
                                                        <h4 className="font-semibold">Herramientas:</h4>
                                                         <div className="flex flex-wrap gap-2 mt-1">
                                                            {step.herramientas_sugeridas.map((tool, i) => <Badge key={i} variant="secondary">{tool}</Badge>)}
                                                        </div>
                                                    </div>
                                                 )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                               </CardContent>
                           </Card>
                        ))}
                    </div>
                </div>

                <Separator />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5"/> Plan Sugerido para 14 Días</CardTitle>
                        <CardDescription>{learningPath.plan_de_14_dias.resumen}</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                            {learningPath.plan_de_14_dias.hitos.map((hito, i) => <li key={i}>{hito}</li>)}
                        </ul>
                    </CardContent>
                </Card>

                <Separator />
                
                <div>
                     <h3 className="font-headline text-lg mb-4 flex items-center gap-2"><GraduationCap />Recomendaciones Educativas UTEL</h3>
                     <div className="space-y-4">
                        {learningPath.recomendaciones_utel.map((rec, index) => (
                             <Card key={index} className="bg-secondary/50">
                                <CardHeader>
                                    <CardTitle className="text-base">{rec.nombre}</CardTitle>
                                    <CardDescription>
                                        <Badge variant="default" className="text-xs">{rec.tipo}</Badge>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">{rec.por_que_encaja}</p>
                                    <Button size="sm" variant="outline" asChild><a href={rec.link_placeholder} target="_blank" rel="noopener noreferrer">Ver {rec.tipo}</a></Button>
                                </CardContent>
                            </Card>
                        ))}
                     </div>
                </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
