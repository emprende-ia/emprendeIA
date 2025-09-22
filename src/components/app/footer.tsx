import { Sparkles } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="py-8 text-center text-sm text-muted-foreground border-t">
      <div className="container flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <p>EmprendeIA Marketplace</p>
        </div>
        <p>&copy; {new Date().getFullYear()}. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
