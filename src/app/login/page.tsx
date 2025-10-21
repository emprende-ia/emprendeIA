'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Mail, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor ingresa un correo válido.' }),
  password: z.string().min(1, { message: 'La contraseña no puede estar vacía.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPageContent() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleSignIn = async (values: LoginFormValues) => {
    if (!auth) return;
    setIsSigningIn(true);

    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // On successful sign-in, the useEffect for user status will redirect.
    } catch (error: any) {
      let description = 'No se pudo completar el inicio de sesión. Inténtalo de nuevo.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = 'Los datos son incorrectos. Verifica tu correo y contraseña.';
      }
      toast({
        title: "Error de inicio de sesión",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
  };
  
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/start');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Bienvenido de Nuevo</CardTitle>
          <CardDescription className="pt-2">Ingresa tus credenciales para continuar</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="tu@ejemplo.com" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                         <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full text-base font-bold" disabled={!auth || isSigningIn}>
                {isSigningIn ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Iniciar Sesión
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col gap-6 px-8 pb-8">
            <div className="text-sm">
                <p className="text-muted-foreground">
                    ¿No tienes una cuenta?{' '}
                    <Link href="/register" className="font-semibold text-primary hover:underline">
                        Regístrate aquí
                    </Link>
                </p>
            </div>
            <div className="flex w-full flex-col items-center gap-4 pt-6 border-t">
                <Link href="/" className="flex flex-col items-center gap-2 text-foreground/80 transition-colors hover:text-foreground">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary transition-transform hover:scale-105">
                        <Sparkles className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <span className="font-headline text-xl font-semibold">Emprende Fácil</span>
                </Link>
            </div>
             <p className="px-8 text-center text-xs text-muted-foreground">
                Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad.
            </p>
        </CardFooter>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-secondary/30"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <LoginPageContent />
    </Suspense>
  );
}
