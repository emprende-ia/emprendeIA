
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  idea: z.string().min(10, { message: 'Describe tu idea con un poco más de detalle.' }),
  tipoNegocio: z.enum(['fisico', 'en-linea', 'ambos'], { required_error: 'Debes seleccionar un tipo de negocio.' }),
  capitalInicial: z.string().optional(),
  experienciaPrevia: z.string().optional(),
  tieneInsumos: z.enum(['si', 'no'], { required_error: 'Debes seleccionar si tienes insumos.' }),
  insumosDetalle: z.string().optional(),
  publicoObjetivo: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'Tienes que seleccionar al menos un público objetivo.',
  }),
  otroPublico: z.string().optional(),
  objetivoPrincipal: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'Tienes que seleccionar al menos un objetivo.',
  }),
  ubicacionNegocio: z.string().optional(),
  competencia: z.string().optional(),
  disponibilidadTiempo: z.enum(['menos-20', '20-40', 'mas-40'], { required_error: 'Debes seleccionar tu disponibilidad de tiempo.' }),
}).refine(data => {
    if (data.publicoObjetivo.includes('Otro') && (!data.otroPublico || data.otroPublico.trim() === '')) {
        return false;
    }
    return true;
}, {
    message: 'Debes especificar el otro público objetivo.',
    path: ['otroPublico'],
}).refine(data => {
    if (data.tieneInsumos === 'si' && (!data.insumosDetalle || data.insumosDetalle.trim() === '')) {
        return false;
    }
    return true;
}, {
    message: 'Debes detallar los insumos que ya tienes.',
    path: ['insumosDetalle'],
});


type FormValues = z.infer<typeof formSchema>;

const publicoObjetivoOptions = [
    { id: 'Mujeres', label: 'Mujeres' },
    { id: 'Hombres', label: 'Hombres' },
    { id: 'Jóvenes', label: 'Jóvenes' },
    { id: 'Adultos', label: 'Adultos' },
    { id: 'Familias / Niños', label: 'Familias / Niños' },
    { id: 'Público en general', label: 'Público en general' },
    { id: '🤔 No estoy seguro', label: '🤔 No estoy seguro' },
    { id: 'Otro', label: 'Otro' },
];

const objetivoPrincipalOptions = [
    { id: 'Organizar gastos para la inversión inicial', label: 'Organizar gastos para la inversión inicial' },
    { id: 'Crear mi marca (nombre, logo, redes sociales)', label: 'Crear mi marca (nombre, logo, redes sociales)' },
    { id: 'Conseguir mis primeros clientes', label: 'Conseguir mis primeros clientes' },
    { id: 'Todo lo anterior', label: 'Todo lo anterior' },
];

export default function NewVenturePage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        idea: '',
        tipoNegocio: 'fisico',
        capitalInicial: '',
        experienciaPrevia: '',
        tieneInsumos: 'no',
        insumosDetalle: '',
        publicoObjetivo: ['🤔 No estoy seguro'],
        objetivoPrincipal: ['Conseguir mis primeros clientes'],
        otroPublico: '',
        ubicacionNegocio: '',
        competencia: '',
        disponibilidadTiempo: '20-40',
    },
  });

  const publicoObjetivoValue = form.watch('publicoObjetivo');
  const tieneInsumosValue = form.watch('tieneInsumos');

  function onSubmit(data: FormValues) {
    const publicoFinal = data.publicoObjetivo
      .filter(p => p !== 'Otro')
      .concat(data.otroPublico && data.otroPublico.trim() !== '' ? [data.otroPublico] : [])
      .join(', ');

    const transformedData = {
        idea: data.idea,
        tipoNegocio: data.tipoNegocio,
        capitalInicial: data.capitalInicial || 'No especificado',
        experienciaPrevia: data.experienciaPrevia || 'No especificada',
        tieneInsumos: data.tieneInsumos,
        insumosDetalle: data.insumosDetalle || '',
        publicoObjetivo: publicoFinal,
        objetivoPrincipal: data.objetivoPrincipal.join(', '),
        necesidad: data.idea, 
        ubicacionNegocio: data.ubicacionNegocio || 'No especificada',
        competencia: data.competencia || 'No especificada',
        disponibilidadTiempo: data.disponibilidadTiempo,
    };
    
    localStorage.setItem('businessProfile', JSON.stringify({ ...data, publicoObjetivo: publicoFinal }));

    const params = new URLSearchParams(transformedData);
    router.push(`/analysis?${params.toString()}`);
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-secondary/30 p-4 sm:p-8">
        <Card className="w-full max-w-3xl shadow-2xl">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline text-3xl">Empecemos tu Nuevo Emprendimiento</CardTitle>
                <CardDescription className="pt-2 text-base">Responde estas preguntas para que la IA entienda tu visión.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        
                        <FormField
                            control={form.control}
                            name="idea"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="text-lg font-semibold">1. ¿Cuál es tu idea de emprendimiento?</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Ej: Una cafetería de especialidad con temática de libros..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tipoNegocio"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel className="text-lg font-semibold">2. Tipo de negocio</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="fisico" /></FormControl>
                                        <FormLabel className="font-normal">Físico (tienda, puesto, local, taller)</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="en-linea" /></FormControl>
                                        <FormLabel className="font-normal">En línea (redes sociales, e-commerce, marketplace)</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="ambos" /></FormControl>
                                        <FormLabel className="font-normal">Ambos</FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="capitalInicial"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="text-lg font-semibold">3. ¿Cuál es tu capital inicial aproximado en MXN?</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: $15,000 MXN" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="experienciaPrevia"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="text-lg font-semibold">4. ¿Tienes alguna experiencia previa en el emprendimiento?</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Ej: Trabajé en una cafetería por 2 años, he vendido postres por redes sociales, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tieneInsumos"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel className="text-lg font-semibold">5. ¿Tienes insumos ya destinados para este emprendimiento?</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="si" /></FormControl>
                                        <FormLabel className="font-normal">Sí</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="no" /></FormControl>
                                        <FormLabel className="font-normal">No</FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                {tieneInsumosValue === 'si' && (
                                    <FormField control={form.control} name="insumosDetalle" render={({ field }) => (
                                        <FormItem className="pl-7 pt-2">
                                            <FormControl><Textarea placeholder="Ej: Máquina de espresso, un local pequeño, 10kg de café, etc." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField control={form.control} name="publicoObjetivo" render={() => (
                            <FormItem>
                                <FormLabel className="text-lg font-semibold">6. Público objetivo</FormLabel>
                                <div className="space-y-2">
                                {publicoObjetivoOptions.map((item) => (
                                    <FormField key={item.id} control={form.control} name="publicoObjetivo" render={({ field }) => (
                                        <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter((value) => value !== item.id)); }} /></FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                    )} />
                                ))}
                                {publicoObjetivoValue?.includes('Otro') && (
                                     <FormField control={form.control} name="otroPublico" render={({ field }) => (
                                        <FormItem className="pl-7 pt-2">
                                            <FormControl><Input placeholder="Por favor, especifica" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        
                        <FormField control={form.control} name="objetivoPrincipal" render={() => (
                            <FormItem>
                                <FormLabel className="text-lg font-semibold">7. Objetivo principal</FormLabel>
                                <div className="space-y-2">
                                {objetivoPrincipalOptions.map((item) => (
                                    <FormField key={item.id} control={form.control} name="objetivoPrincipal" render={({ field }) => (
                                        <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter((value) => value !== item.id)); }} /></FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                    )} />
                                ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}/>

                        <FormField
                            control={form.control}
                            name="ubicacionNegocio"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="text-lg font-semibold">8. ¿Dónde has pensado establecer tu negocio?</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: Colonia Roma, CDMX" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="competencia"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="text-lg font-semibold">9. ¿Conoces algún negocio parecido al tuyo?</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Ej: Starbucks, o cafeterías locales como 'El Jarocho'" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="disponibilidadTiempo"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel className="text-lg font-semibold">10. Disponibilidad de tiempo</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="menos-20" /></FormControl>
                                        <FormLabel className="font-normal">Menos de 20 horas a la semana</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="20-40" /></FormControl>
                                        <FormLabel className="font-normal">Entre 20 y 40 horas a la semana</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="mas-40" /></FormControl>
                                        <FormLabel className="font-normal">Más de 40 horas a la semana</FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full font-bold text-lg" size="lg">
                            Generar Perfil y Analizar
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </main>
  );
}
