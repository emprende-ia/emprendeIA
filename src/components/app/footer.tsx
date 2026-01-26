
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function AppFooter() {
  return (
    <footer className="py-8 text-center text-sm text-muted-foreground border-t">
      <div className="container flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <p>Emprende IA</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/terminos" className="hover:text-primary hover:underline">Términos de Servicio</Link>
          <Link href="/privacidad" className="hover:text-primary hover:underline">Política de Privacidad</Link>
        </div>
        <p>&copy; {new Date().getFullYear()}. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
