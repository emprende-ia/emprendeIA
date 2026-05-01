import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Excluir:
     * - /_next/static (assets)
     * - /_next/image (optimización imágenes)
     * - /favicon.ico
     * - rutas con extensión (svg, png, etc.)
     * - /api/stripe/webhook (necesita raw body)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
