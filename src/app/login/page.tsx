'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Mail, KeyRound, ShieldCheck, AlertTriangle } from 'lucide-react';

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

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor ingresa un correo válido.' }),
  password: z.string().min(1, { message: 'La contraseña no puede estar vacía.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPageContent() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Si Supabase nos manda un `?error=...` desde el callback, lo mostramos
  useEffect(() => {
    const err = searchParams.get('error');
    if (err) setErrorBanner(decodeURIComponent(err));
  }, [searchParams]);

  // Si ya estás logueado, fuera de aquí
  useEffect(() => {
    if (!isUserLoading && user) {
      const next = searchParams.get('next') ?? '/start';
      router.push(next);
    }
  }, [user, isUserLoading, router, searchParams]);

  const handleSignIn = async (values: LoginFormValues) => {
    if (isSigningIn || isGoogleSigningIn) return;
    setIsSigningIn(true);
    setErrorBanner(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    setIsSigningIn(false);

    if (error) {
      const message =
        error.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos.'
          : error.message;
      toast({ title: 'Error de acceso', description: message, variant: 'destructive' });
      return;
    }

    toast({ title: '¡Bienvenido de nuevo!', description: 'Has iniciado sesión correctamente.' });
    const next = searchParams.get('next') ?? '/start';
    router.push(next);
    router.refresh();
  };

  const handleGoogleSignIn = async () => {
    if (isSigningIn || isGoogleSigningIn) return;
    setIsGoogleSigningIn(true);
    setErrorBanner(null);

    const supabase = createClient();
    const next = searchParams.get('next') ?? '/start';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
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
    // Si no hay error, el navegador se va a redirigir a Google.
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
      <div className="aurora-orb aurora-orb-primary -left-32 -top-32 h-[420px] w-[420px] animate-aurora-shift" />
      <div className="aurora-orb aurora-orb-accent -bottom-32 -right-32 h-[400px] w-[400px] animate-aurora-shift" style={{ animationDelay: '8s' }} />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <Link href="/" className="group mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <Image
            src="https://i.postimg.cc/wxVbJF5r/Gemini-Generated-Image-19a6sy19a6sy19a6.png"
            alt="EmprendeIA Logo"
            width={28}
            height={28}
            className="rounded-full border border-primary/30"
          />
          <span className="font-headline font-semibold">EmprendeIA</span>
        </Link>

        <Card className="relative overflow-hidden border bg-card shadow-aurora-lg">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary via-secondary to-accent opacity-80" />

          <CardHeader className="space-y-2 pt-7 text-center">
            <CardTitle className="font-headline text-2xl font-bold tracking-tight sm:text-3xl">
              Bienvenido de <span className="text-aurora">vuelta</span>
            </CardTitle>
            <CardDescription>
              Ingresa a tu cuenta para continuar.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-2">
            {errorBanner && (
              <Alert variant="destructive" className="animate-fade-in">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Hubo un problema</AlertTitle>
                <AlertDescription className="text-xs">{errorBanner}</AlertDescription>
              </Alert>
            )}

            <Button
              variant="outline"
              size="lg"
              className="w-full font-semibold"
              onClick={handleGoogleSignIn}
              disabled={isGoogleSigningIn || isSigningIn}
            >
              {isGoogleSigningIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
              Continuar con Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-[10px] font-semibold uppercase tracking-widest">
                <span className="bg-card px-3 text-muted-foreground">o con tu correo</span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Correo electrónico</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="tu@ejemplo.com"
                            {...field}
                            className="h-11 pl-10"
                            autoComplete="email"
                          />
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
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="h-11 pl-10"
                            autoComplete="current-password"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-bold shadow-aurora hover:shadow-aurora-lg"
                  disabled={isSigningIn || isGoogleSigningIn}
                >
                  {isSigningIn ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  Iniciar sesión
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="border-t bg-muted/30 py-4">
            <p className="w-full text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
