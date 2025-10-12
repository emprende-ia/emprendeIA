
'use client';

import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

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

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Sparkles className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-secondary/10 p-4">
      <div className="flex flex-col items-center space-y-8 text-center">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary p-4 shadow-lg">
            <Sparkles className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="font-headline text-6xl font-bold tracking-tighter text-foreground sm:text-7xl">
            EmprendeIA
          </h1>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-4">
          <Button asChild size="lg" className="w-full text-lg font-bold">
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full text-lg font-bold">
            <Link href="/login">Registrarte</Link>
          </Button>
        </div>

        <div className="flex w-full max-w-sm flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">Ingresa también con:</p>
          <div className="flex w-full gap-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/login?provider=google">
                <GoogleIcon />
                Google
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login?provider=facebook">
                <FacebookIcon />
                Facebook
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
