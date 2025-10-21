
'use client';

import React, { useState, Suspense } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const registerSchema = z.object({
  fullName: z.string().min(3, { message: 'El nombre completo debe tener al menos 3 caracteres.' }),
  username: z.string().min(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres.' }),
  age: z.coerce.number().min(18, { message: 'Debes ser mayor de 18 años para registrarte.' }),
  email: z.string().email({ message: 'Por favor, ingresa un correo electrónico válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden.',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterPageContent() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      username: '',
      age: undefined,
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleRegister = async (values: RegisterFormValues) => {
    if (!auth || !firestore) return;
    setIsRegistering(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: values.username,
      });

      // Create user profile in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        displayName: values.username,
        email: values.email,
        fullName: values.fullName,
        age: values.age,
        createdAt: new Date(),
      });
      
      toast({
        title: "¡Registro Exitoso!",
        description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
      });

      router.push('/login');

    } catch (error: any) {
      let description = "No se pudo completar el registro. Inténtalo de nuevo.";
      if (error.code === 'auth/email-already-in-use') {
        description = "Este correo electrónico ya está en uso. Intenta con otro.";
      }
      toast({
        title: "Error de Registro",
        description,
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-secondary/30 p-4 py-8">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Crear una Cuenta</CardTitle>
          <CardDescription className="pt-2">Completa tus datos para unirte a Emprende Fácil</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
              <FormField name="fullName" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Nombre completo</FormLabel><FormControl><Input placeholder="Juan Pérez" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField name="username" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Nombre de usuario</FormLabel><FormControl><Input placeholder="juanperez" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField name="age" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Edad</FormLabel><FormControl><Input type="number" placeholder="25" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Correo electrónico</FormLabel><FormControl><Input type="email" placeholder="tu@ejemplo.com" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField name="password" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField name="confirmPassword" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Confirmar contraseña</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>

              <Button type="submit" size="lg" className="w-full text-base font-bold !mt-6" disabled={!auth || isRegistering}>
                {isRegistering ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Confirmar Registro
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col gap-4 px-8 pb-8">
            <div className="text-sm">
                <p className="text-muted-foreground">
                    ¿Ya tienes una cuenta?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Inicia sesión aquí
                    </Link>
                </p>
            </div>
             <p className="px-8 text-center text-xs text-muted-foreground pt-4 border-t">
                Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad.
            </p>
        </CardFooter>
      </Card>
    </main>
  );
}

export default function RegisterPage() {
    return (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-secondary/30"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
        <RegisterPageContent />
      </Suspense>
    );
  }
