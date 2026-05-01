'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/supabase/use-user';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const registerSchema = z
  .object({
    fullName: z.string().min(3, { message: 'Mínimo 3 caracteres.' }),
    username: z.string().min(3, { message: 'Mínimo 3 caracteres.' }),
    age: z.coerce.number().min(18, { message: 'Debes ser mayor de 18 años.' }),
    email: z.string().email({ message: 'Correo inválido.' }),
    password: z.string().min(6, { message: 'Mínimo 6 caracteres.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      username: '',
      age: '' as unknown as number,
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) setErrorBanner(decodeURIComponent(err));
  }, [searchParams]);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/start');
    }
  }, [user, isUserLoading, router]);

  const handleRegister = async (values: RegisterFormValues) => {
    if (isRegistering || isGoogleSigningIn) return;
    setIsRegistering(true);
    setErrorBanner(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: values.fullName,
          username: values.username,
          age: values.age,
        },
      },
    });

    if (error) {
      setIsRegistering(false);
      const message =
        error.message === 'User already registered'
          ? 'Este correo ya está registrado.'
          : error.message;
      toast({ title: 'Error de Registro', description: message, variant: 'destructive' });
      return;
    }

    // Si "Confirm email" está OFF, Supabase devuelve sesión inmediatamente.
    if (data.session && data.user) {
      // Completamos el profile con username/age (el trigger creó la fila)
      await supabase
        .from('profiles')
        .update({
          username: values.username,
          age: values.age,
          full_name: values.fullName,
        })
        .eq('id', data.user.id);

      toast({ title: '¡Cuenta creada!', description: 'Bienvenido a EmprendeIA.' });
      router.push('/start');
      router.refresh();
      return;
    }

    // Si "Confirm email" está ON, no hay sesión hasta que confirme.
    setIsRegistering(false);
    toast({
      title: 'Revisa tu correo',
      description: 'Te enviamos un enlace de confirmación.',
    });
  };

  const handleGoogleSignIn = async () => {
    if (isRegistering || isGoogleSigningIn) return;
    setIsGoogleSigningIn(true);
    setErrorBanner(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/start`,
        queryParams: { prompt: 'select_account' },
      },
    });

    if (error) {
      setIsGoogleSigningIn(false);
      toast({
        title: 'Error con Google',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-aurora-lg glass">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl font-bold">
            <span className="text-aurora">Únete a EmprendeIA</span>
          </CardTitle>
          <CardDescription className="pt-2">
            Comienza a transformar tu visión hoy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {errorBanner && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Hubo un problema</AlertTitle>
              <AlertDescription className="text-xs">{errorBanner}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="fullName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan P." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="username"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <FormControl>
                        <Input placeholder="juanp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                name="age"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@ejemplo.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="confirmPassword"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full font-bold !mt-6"
                disabled={isRegistering || isGoogleSigningIn}
              >
                {isRegistering ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-5 w-5" />
                )}
                Registrarme Ahora
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">O usa</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full py-6"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSigningIn || isRegistering}
          >
            {isGoogleSigningIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Registrarme con Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
