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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  idea: z.string().min(10, { message: 'Describe tu idea con un poco más de detalle.' }),
  tipoNegocio: z.enum(['fisico', 'en-linea', 'ambos'], { required_error: 'Debes seleccionar un tipo de negocio.' }),
  capitalInicial: z.enum(['bajo', 'medio', 'alto'], { required_error: 'Debes seleccionar un rango de capital.' }),
  experienciaPrevia: z.enum(['principiante', 'intermedio', 'avanzado'], { required_error: 'Debes seleccionar tu nivel de experiencia.' }),
  publicoObjetivo: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'Tienes que seleccionar al menos un público objetivo.',
  }),
  objetivoPrincipal: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'Tienes que seleccionar al menos un objetivo.',
  }),
  necesidad: z.string().min(10, { message: 'Describe la necesidad que resuelves con más detalle.' }),
  competencia: z.string().optional(),
  disponibilidadTiempo: z.enum(['menos-10', '10-20', 'mas-20'], { required_error: 'Debes seleccionar tu disponibilidad de tiempo.' }),
});

type FormValues = z.infer<typeof formSchema>;

const publicoObjetivoOptions = [
    { id: 'Mujeres', label: 'Mujeres' },
    { id: 'Hombres', label: 'Hombres' },
    { id: 'Jóvenes', label: 'Jóvenes' },
    { id: 'Adultos', label: 'Adultos' },
    { id: 'Familias / Niños', label: 'Familias / Niños' },
    { id: 'Público en general', label: 'Público en general' },
    { id: 'No estoy seguro', label: '🤔 No estoy seguro' },
];

const objetivoPrincipalOptions = [
    { id: 'Organizar gastos e ingresos', label: 'Organizar gastos e ingresos' },
    { id: 'Crear mi marca', label: 'Crear mi marca (nombre, logo, redes sociales)' },
    { id: 'Conseguir más clientes', label: 'Conseguir más clientes y vender más' },
    { id: 'Todo lo anterior', label: 'Todo lo anterior' },
];

export default function NewVenturePage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        idea: '',
        publicoObjetivo: [],
        objetivoPrincipal: [],
        necesidad: '',
        competencia: '',
    },
  });

  function onSubmit(data: FormValues) {
    const transformedData = {
        ...data,
        publicoObjetivo: data.publicoObjetivo.join(', '),
        objetivoPrincipal: data.objetivoPrincipal.join(', '),
    };
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
                                <FormLabel className="text-lg font-semibold">1. 👉 ¿Cuál es tu idea de emprendimiento?</FormLabel>
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
                                <FormLabel className="text-lg font-semibold">Tipo de negocio</FormLabel>
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
                                <FormItem className="space-y-3">
                                <FormLabel className="text-lg font-semibold">Capital inicial</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="bajo" /></FormControl>
                                        <FormLabel className="font-normal">Bajo (menos de $5,000 MXN)</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="medio" /></FormControl>
                                        <FormLabel className="font-normal">Medio ($5,000 – $20,000 MXN)</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="alto" /></FormControl>
                                        <FormLabel className="font-normal">Alto (más de $20,000 MXN)</FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="experienciaPrevia"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel className="text-lg font-semibold">Experiencia previa</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="principiante" /></FormControl>
                                        <FormLabel className="font-normal">Principiante (nunca he tenido negocio)</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="intermedio" /></FormControl>
                                        <FormLabel className="font-normal">Intermedio (ya he vendido algo antes)</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="avanzado" /></FormControl>
                                        <FormLabel className="font-normal">Avanzado (manejo o he manejado un negocio)</FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="publicoObjetivo"
                            render={() => (
                                <FormItem>
                                <div className="mb-4">
                                    <FormLabel className="text-lg font-semibold">Público objetivo</FormLabel>
                                </div>
                                {publicoObjetivoOptions.map((item) => (
                                    <FormField
                                    key={item.id}
                                    control={form.control}
                                    name="publicoObjetivo"
                                    render={({ field }) => {
                                        return (
                                        <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(item.id)}
                                                onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...field.value, item.id])
                                                    : field.onChange(field.value?.filter((value) => value !== item.id));
                                                }}
                                            />
                                            </FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                        );
                                    }}
                                    />
                                ))}
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="objetivoPrincipal"
                            render={() => (
                                <FormItem>
                                <div className="mb-4">
                                    <FormLabel className="text-lg font-semibold">Objetivo principal</FormLabel>
                                </div>
                                {objetivoPrincipalOptions.map((item) => (
                                    <FormField
                                    key={item.id}
                                    control={form.control}
                                    name="objetivoPrincipal"
                                    render={({ field }) => {
                                        return (
                                        <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(item.id)}
                                                onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...field.value, item.id])
                                                    : field.onChange(field.value?.filter((value) => value !== item.id));
                                                }}
                                            />
                                            </FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                        );
                                    }}
                                    />
                                ))}
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="necesidad"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="text-lg font-semibold">👉 ¿Qué necesidad o problema resuelve tu negocio?</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Ej: Ofrecer un espacio tranquilo para leer y disfrutar de buen café, algo que falta en mi colonia." {...field} />
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
                                <FormLabel className="text-lg font-semibold">Competencia percibida</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="¿Conoces algún negocio parecido al tuyo? (Opcional)" {...field} />
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
                                <FormLabel className="text-lg font-semibold">Disponibilidad de tiempo</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="menos-10" /></FormControl>
                                        <FormLabel className="font-normal">Menos de 10h a la semana</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="10-20" /></FormControl>
                                        <FormLabel className="font-normal">10–20h a la semana</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="mas-20" /></FormControl>
                                        <FormLabel className="font-normal">Más de 20h a la semana</FormLabel>
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
