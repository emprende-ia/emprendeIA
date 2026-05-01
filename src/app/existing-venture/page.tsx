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
import { ArrowRight, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  situacionActual: z.string().min(5, { message: 'Describe tu negocio con un poco más de detalle.' }),
  tiempoOperacion: z.enum(['menos-6', '6-24', 'mas-24'], { required_error: 'Debes seleccionar el tiempo de operación.' }),
  nivelVentas: z.enum(['bajas', 'estables', 'buenas'], { required_error: 'Debes seleccionar tu nivel de ventas.' }),
  canalesVenta: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'Tienes que seleccionar al menos un canal de venta.',
  }),
  mayorDesafio: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'Tienes que seleccionar al menos un desafío.',
  }),
  publicoActual: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'Tienes que seleccionar al menos un tipo de público.',
  }),
  metaCrecimiento: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'Tienes que seleccionar al menos una meta.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const canalesVentaOptions = [
    { id: 'Tienda física', label: 'Tienda física' },
    { id: 'Redes sociales', label: 'Redes sociales' },
    { id: 'Marketplace (Mercado Libre, Amazon, etc.)', label: 'Marketplace (Mercado Libre, Amazon, etc.)' },
    { id: 'Página web propia', label: 'Página web propia' },
    { id: 'Otro', label: 'Otro' },
];

const mayorDesafioOptions = [
    { id: 'Conseguir más clientes', label: 'Conseguir más clientes' },
    { id: 'Administrar mis finanzas', label: 'Administrar mis finanzas' },
    { id: 'Diferenciarme de mi competencia', label: 'Diferenciarme de mi competencia' },
    { id: 'Manejar mis redes sociales / marketing', label: 'Manejar mis redes sociales / marketing' },
    { id: 'Organizar mis procesos internos', label: 'Organizar mis procesos internos' },
];

const publicoActualOptions = [
    { id: 'Mujeres', label: 'Mujeres' },
    { id: 'Hombres', label: 'Hombres' },
    { id: 'Jóvenes', label: 'Jóvenes' },
    { id: 'Adultos', label: 'Adultos' },
    { id: 'Familias / Niños', label: 'Familias / Niños' },
    { id: 'Empresas', label: 'Empresas' },
    { id: 'No estoy seguro', label: '🤔 No estoy seguro' },
];

const metaCrecimientoOptions = [
    { id: 'Aumentar mis ventas', label: 'Aumentar mis ventas' },
    { id: 'Llegar a más clientes (nuevos mercados)', label: 'Llegar a más clientes (nuevos mercados)' },
    { id: 'Crear o mejorar mi marca', label: 'Crear o mejorar mi marca' },
    { id: 'Optimizar mis procesos y tiempo', label: 'Optimizar mis procesos y tiempo' },
    { id: 'Todo lo anterior', label: 'Todo lo anterior' },
];

export default function ExistingVenturePage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        situacionActual: '',
        canalesVenta: [],
        mayorDesafio: [],
        publicoActual: [],
        metaCrecimiento: [],
    },
  });

  function onSubmit(data: FormValues) {
    // Save the entire business profile to localStorage
    const profileToSave = { idea: data.situacionActual, ...data };
    localStorage.setItem('businessProfile', JSON.stringify(profileToSave));

    const transformedData = {
        ...data,
        canalesVenta: data.canalesVenta.join(', '),
        mayorDesafio: data.mayorDesafio.join(', '),
        publicoActual: data.publicoActual.join(', '),
        metaCrecimiento: data.metaCrecimiento.join(', '),
    };
    const params = new URLSearchParams(transformedData);
    router.push(`/existing-analysis?${params.toString()}`);
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center overflow-hidden p-4 py-10 sm:p-8">
        <div className="aurora-orb aurora-orb-primary -left-32 -top-32 h-[420px] w-[420px] animate-aurora-shift" />
        <div className="aurora-orb aurora-orb-accent -bottom-32 -right-32 h-[400px] w-[400px] animate-aurora-shift" style={{ animationDelay: '8s' }} />
        <Card className="relative z-10 w-full max-w-3xl overflow-hidden border bg-card shadow-aurora-lg">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-80" />
            <CardHeader className="space-y-3 pt-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-aurora">
                    <Building className="h-7 w-7" />
                </div>
                <CardTitle className="font-headline text-2xl tracking-tight sm:text-3xl">Potencia tu emprendimiento</CardTitle>
                <CardDescription className="text-base">Responde estas preguntas para que la IA entienda tu negocio actual.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        
                        <FormField
                            control={form.control}
                            name="situacionActual"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="text-lg font-semibold">1. 👉 ¿Qué tipo de negocio tienes actualmente?</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: E-commerce de ropa, servicio de consultoría, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tiempoOperacion"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel className="text-lg font-semibold">2. ¿Hace cuánto tiempo iniciaste tu negocio?</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="menos-6" /></FormControl><FormLabel className="font-normal">Menos de 6 meses</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="6-24" /></FormControl><FormLabel className="font-normal">6 meses – 2 años</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="mas-24" /></FormControl><FormLabel className="font-normal">Más de 2 años</FormLabel></FormItem>
                                    </RadioGroup>
                                </FormControl><FormMessage />
                                </FormItem>
                            )}
                        />

                         <FormField
                            control={form.control}
                            name="nivelVentas"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel className="text-lg font-semibold">3. En promedio, ¿cómo describirías tus ventas actuales?</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="bajas" /></FormControl><FormLabel className="font-normal">Bajas (cuesta trabajo vender)</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="estables" /></FormControl><FormLabel className="font-normal">Estables (vendo, pero no crezco)</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="buenas" /></FormControl><FormLabel className="font-normal">Buenas (vendo bien, pero quiero escalar)</FormLabel></FormItem>
                                    </RadioGroup>
                                </FormControl><FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField control={form.control} name="canalesVenta" render={() => (
                            <FormItem>
                                <FormLabel className="text-lg font-semibold">4. ¿Dónde vendes actualmente?</FormLabel>
                                {canalesVentaOptions.map((item) => (
                                    <FormField key={item.id} control={form.control} name="canalesVenta" render={({ field }) => (
                                        <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter((value) => value !== item.id)); }} /></FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                    )} />
                                ))} <FormMessage />
                            </FormItem>
                        )}/>

                        <FormField control={form.control} name="mayorDesafio" render={() => (
                            <FormItem>
                                <FormLabel className="text-lg font-semibold">5. ¿Qué es lo que más te cuesta trabajo ahora mismo?</FormLabel>
                                {mayorDesafioOptions.map((item) => (
                                    <FormField key={item.id} control={form.control} name="mayorDesafio" render={({ field }) => (
                                        <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter((value) => value !== item.id)); }} /></FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                    )} />
                                ))} <FormMessage />
                            </FormItem>
                        )}/>

                        <FormField control={form.control} name="publicoActual" render={() => (
                            <FormItem>
                                <FormLabel className="text-lg font-semibold">6. ¿Quiénes son tus clientes hoy en día?</FormLabel>
                                {publicoActualOptions.map((item) => (
                                    <FormField key={item.id} control={form.control} name="publicoActual" render={({ field }) => (
                                        <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter((value) => value !== item.id)); }} /></FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                    )} />
                                ))} <FormMessage />
                            </FormItem>
                        )}/>

                         <FormField control={form.control} name="metaCrecimiento" render={() => (
                            <FormItem>
                                <FormLabel className="text-lg font-semibold">7. ¿Cuál es tu principal objetivo para potenciar tu negocio?</FormLabel>
                                {metaCrecimientoOptions.map((item) => (
                                    <FormField key={item.id} control={form.control} name="metaCrecimiento" render={({ field }) => (
                                        <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter((value) => value !== item.id)); }} /></FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                    )} />
                                ))} <FormMessage />
                            </FormItem>
                        )}/>


                        <Button type="submit" className="w-full font-bold text-lg" size="lg">
                            Continuar
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </main>
  );
}
