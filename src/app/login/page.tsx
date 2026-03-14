'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { auth, firestore, useUser } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, KeyRound, ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { getOrCreateUserProfile } from '@/lib/firestore/users';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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
  const { toast } = useToast();
  
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [showInternalErrorHelp, setShowInternalErrorHelp] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleSignIn = async (values: LoginFormValues) => {
    if (isSigningIn || isGoogleSigningIn || !auth) return;
    setIsSigningIn(true);
    setShowInternalErrorHelp(false);
    
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: "¡Bienvenido de nuevo!", description: "Has iniciado sesión correctamente." });
    } catch (error: any) {
      console.error("Login Error:", error);
      let message = "Correo o contraseña incorrectos.";
      
      if (error.code === 'auth/internal-error') {
          setShowInternalErrorHelp(true);
          message = "Error interno de autenticación. Revisa tu configuración de cookies.";
      } else if (error.code === 'auth/user-disabled') {
          message = "Esta cuenta ha sido deshabilitada. Contacta al soporte.";
      }
      
      toast({
        title: "Error de acceso",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleSigningIn || isSigningIn || !auth || !firestore) return;
    setIsGoogleSigningIn(true);
    setShowInternalErrorHelp(false);
    
    try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        const result = await signInWithPopup(auth, provider);
        await getOrCreateUserProfile(firestore, result.user);
        
        toast({ title: "¡Éxito!", description: "Conectado con Google." });
        router.push('/start');
    } catch (error: any) {
        console.error("Google Auth Error:", error);
        
        if (error.code === 'auth/internal-error' || error.code === 'auth/network-request-failed') {
            setShowInternalErrorHelp(true);
        }

        toast({
            title: "Error de autenticación",
            description: "No se pudo conectar con Google. Verifica tus cookies de terceros.",
            variant: "destructive",
        });
    } finally {
        setIsGoogleSigningIn(false);
    }
  };
  
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/start');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl font-bold">Bienvenido</CardTitle>
          <CardDescription className="pt-2">Ingresa a tu cuenta de EmprendeIA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-4">
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
              <Button type="submit" size="lg" className="w-full font-bold" disabled={isSigningIn || isGoogleSigningIn}>
                {isSigningIn ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                Iniciar Sesión
              </Button>
            </form>
          </Form>

           <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
                </div>
            </div>

             <Button
                variant="outline"
                className="w-full py-6 text-base"
                onClick={handleGoogleSignIn}
                disabled={isGoogleSigningIn || isSigningIn}
            >
                {isGoogleSigningIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                Continuar con Google
            </Button>

            {showInternalErrorHelp && (
                <Alert className="mt-4 bg-primary/5 border-primary/20">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    <AlertTitle className="font-bold text-sm">¿Error de Autenticación?</AlertTitle>
                    <AlertDescription className="text-xs space-y-2 pt-1">
                        <p>Firebase detectó un problema con tu navegador. Sigue estos pasos:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Habilita las <b>cookies de terceros</b> en tu navegador.</li>
                            <li>No uses el <b>Modo Incógnito</b>.</li>
                            <li>Asegúrate de que tu conexión sea estable.</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            )}
        </CardContent>
        <CardFooter className="flex-col gap-4 border-t pt-6">
            <p className="text-sm text-muted-foreground text-center">
                ¿No tienes una cuenta?{' '}
                <Link href="/register" className="font-semibold text-primary hover:underline">Regístrate aquí</Link>
            </p>
            <Link href="/" className="flex flex-col items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                <Image src="https://i.postimg.cc/nhbtm52x/Emprende.png" alt="EmprendeIA Logo" width={48} height={48} />
                <span className="font-headline text-lg font-semibold">EmprendeIA</span>
            </Link>
        </CardFooter>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <LoginPageContent />
    </Suspense>
  );
}
