
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, AuthProvider } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const GoogleIcon = () => (
    <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 74.4C309.2 116.2 281.3 104 248 104c-73.8 0-134.2 59.9-134.2 134.2s60.4 134.2 134.2 134.2c81.5 0 112.2-61.9 116.3-91.8H248v-85.3h236.1c2.3 12.7 3.9 26.4 3.9 40.8z"></path>
    </svg>
);

const FacebookIcon = () => (
    <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="facebook" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z" />
    </svg>
);

function LoginPageContent() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async (provider: AuthProvider) => {
    if (!auth) return;
    setIsSigningIn(true);
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      await signInWithPopup(auth, provider);
      // On successful sign-in, the useEffect for user status will redirect.
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        toast({
          title: "Error de inicio de sesión",
          description: "No se pudo completar el inicio de sesión. Por favor, asegúrate de que las ventanas emergentes no estén bloqueadas e inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = () => handleSignIn(new GoogleAuthProvider());
  const handleFacebookSignIn = () => handleSignIn(new FacebookAuthProvider());
  
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const providerParam = searchParams.get('provider');
    if (providerParam === 'google') {
      handleGoogleSignIn();
    } else if (providerParam === 'facebook') {
      handleFacebookSignIn();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (isUserLoading || isSigningIn || user) {
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
          <Link href="/" className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary transition-transform hover:scale-105">
            <Sparkles className="h-10 w-10 text-primary-foreground" />
          </Link>
          <CardTitle className="font-headline text-3xl">Bienvenido de Nuevo</CardTitle>
          <CardDescription className="pt-2">Selecciona un método para continuar</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-8 pt-0">
          <Button onClick={handleGoogleSignIn} size="lg" className="w-full text-base font-bold" disabled={!auth || isSigningIn}>
            {isSigningIn ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleIcon />}
            Continuar con Google
          </Button>
           <Button onClick={handleFacebookSignIn} size="lg" className="w-full text-base font-bold" disabled={!auth || isSigningIn}>
            {isSigningIn ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FacebookIcon />}
            Continuar con Facebook
          </Button>
          <p className="px-8 text-center text-xs text-muted-foreground">
            Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad.
          </p>
        </CardContent>
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
