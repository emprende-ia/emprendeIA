
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';

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
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleSignIn = async (values: LoginFormValues) => {
    if (!auth) return;
    setIsSigningIn(true);

    try {
      initiateEmailSignIn(auth, values.email, values.password);
      // The onAuthStateChanged listener in the provider will handle redirection
      // on successful login. This approach provides a better UX.
      // We can show a toast here to inform the user.
      toast({
        title: "Iniciando sesión...",
        description: "Serás redirigido en un momento.",
      });
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
      setIsSigningIn(false); // Only stop loading on error
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) return;
    setIsGoogleSigningIn(true);
    const provider = new GoogleAuthProvider();

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Redirect immediately for better UX. Profile creation will happen in the background.
        router.push('/start');
        
        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        // Non-blocking write: Create user profile if it doesn't exist.
        if (!docSnap.exists()) {
            setDoc(userDocRef, {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                createdAt: serverTimestamp(),
            }).catch(e => {
                // Optional: Log background write error to a monitoring service
                console.error("Failed to create user profile in background:", e);
            });
        }
    } catch (error: any) {
        let description = "Ocurrió un error inesperado.";
        if (error.code !== 'auth/popup-closed-by-user') {
             toast({
                title: "Error de inicio de sesión con Google",
                description: "No se pudo completar el inicio de sesión. Inténtalo de nuevo.",
                variant: "destructive",
            });
        }
        setIsGoogleSigningIn(false); // Stop loading on error
    }
    // Don't set isGoogleSigningIn to false on success, as redirection will happen.
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
              <Button type="submit" size="lg" className="w-full text-base font-bold" disabled={!auth || isSigningIn || isGoogleSigningIn}>
                {isSigningIn ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Iniciar Sesión
              </Button>
            </form>
          </Form>
           <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    O continúa con
                    </span>
                </div>
            </div>
             <Button
                variant="outline"
                className="w-full text-base"
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={!auth || isSigningIn || isGoogleSigningIn}
            >
                {isGoogleSigningIn ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <GoogleIcon />
                )}
                Continuar con Google
            </Button>
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
            <div className="flex w-full flex-col items-center gap-2 pt-6 border-t">
                <Link href="/" className="flex flex-col items-center gap-2 text-foreground/80 transition-colors hover:text-foreground">
                    <Image src="https://i.postimg.cc/nhbtm52x/Emprende.png" alt="EmprendeIA Logo" width={64} height={64} />
                    <span className="font-headline text-xl font-semibold">EmprendeIA</span>
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

    