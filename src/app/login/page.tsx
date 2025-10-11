
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) return;

    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User has successfully signed in.
          router.push('/');
        }
      })
      .catch((error) => {
        console.error("Login redirect error:", error);
        toast({
          title: "Error de inicio de sesión",
          description: "No se pudo completar el inicio de sesión con Google. Por favor, intenta de nuevo.",
          variant: "destructive",
        });
      });
  }, [auth, router, toast]);

  const handleGoogleSignIn = () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-secondary/30">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Sparkles className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="font-headline text-3xl">Bienvenido a EmprendeIA</CardTitle>
          <CardDescription className="pt-2">Inicia sesión para obtener recomendaciones personalizadas</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-8 pt-0">
          <Button onClick={handleGoogleSignIn} size="lg" className="w-full text-lg font-bold">
            <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 74.4C309.2 116.2 281.3 104 248 104c-73.8 0-134.2 59.9-134.2 134.2s60.4 134.2 134.2 134.2c81.5 0 112.2-61.9 116.3-91.8H248v-85.3h236.1c2.3 12.7 3.9 26.4 3.9 40.8z"></path>
            </svg>
            Continuar con Google
          </Button>
          <p className="px-8 text-center text-xs text-muted-foreground">
            Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
