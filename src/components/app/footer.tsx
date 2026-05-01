import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function AppFooter() {
  return (
    <footer className="border-t bg-card/40 py-8 text-sm text-muted-foreground backdrop-blur-sm">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="font-headline text-sm font-semibold text-foreground">EmprendeIA</span>
          <span className="text-xs">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-5 text-xs">
          <Link href="/terminos" className="underline-offset-4 transition-colors hover:text-foreground hover:underline">
            Términos
          </Link>
          <Link href="/privacidad" className="underline-offset-4 transition-colors hover:text-foreground hover:underline">
            Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
