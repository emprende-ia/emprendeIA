
'use client';

import React, { useState, Suspense } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
        />
        <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
        />
        <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
        />
        <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
        />
    </svg>
);

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
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);


  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      username: '',
      age: '' as any, // Use empty string for controlled component
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

      await updateProfile(user, {
        displayName: values.username,
      });

      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        displayName: values.username,
        email: values.email,
        fullName: values.fullName,
        age: values.age,
        createdAt: serverTimestamp(),
        plan: 'básico',
        planStatus: 'inactive',
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
        } else if (error.code && error.code.startsWith('permission-denied')) {
            description = "Error de permisos al crear tu perfil. Contacta a soporte.";
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

  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) return;
    setIsGoogleSigningIn(true);
    const provider = new GoogleAuthProvider();

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (!docSnap.exists()) {
            await setDoc(userDocRef, {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                createdAt: serverTimestamp(),
                plan: 'básico',
                planStatus: 'inactive',
            });
        }
        
        router.push('/start');

    } catch (error: any) {
        console.error("Google Sign-In Error:", error);
        let description = "No se pudo completar el inicio de sesión. Inténtalo de nuevo.";
        
        if (error.code && error.code.startsWith('permission-denied')) {
            description = "Error de permisos al crear tu perfil. Contacta a soporte.";
        } else if (error.code === 'auth/popup-closed-by-user') {
            // User closed the popup, do nothing.
        } else if (error.code === 'auth/internal-error') {
            description = "Error interno. Esto puede ocurrir si el proveedor de Google no está configurado correctamente en Firebase, o los dominios no están autorizados. Revisa la consola de Firebase.";
        }
        
        if (error.code !== 'auth/popup-closed-by-user') {
            toast({
                title: "Error de inicio de sesión con Google",
                description: description,
                variant: "destructive",
            });
        }
        setIsGoogleSigningIn(false);
    }
  };


  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-secondary/30 p-4 py-8">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Crear una Cuenta</CardTitle>
          <CardDescription className="pt-2">Completa tus datos para unirte a Emprende IA</CardDescription>
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

              <Button type="submit" size="lg" className="w-full text-base font-bold !mt-6" disabled={!auth || isRegistering || isGoogleSigningIn}>
                {isRegistering ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Confirmar Registro
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    O regístrate con
                    </span>
                </div>
            </div>
             <Button
                variant="outline"
                className="w-full text-base"
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={!auth || isRegistering || isGoogleSigningIn}
            >
                {isGoogleSigningIn ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <GoogleIcon />
                )}
                Continuar con Google
            </Button>
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

    