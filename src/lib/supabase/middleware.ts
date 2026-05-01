import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './database.types';

/**
 * Refresca la sesión de Supabase en cada navegación y redirige a /start si
 * el usuario ya está logueado y entra a /login o /register.
 *
 * NOTA: la app permite "continuar como invitado" desde el landing, así que
 * /dashboard, /start, /new-venture, etc. son PÚBLICAS (los datos viven en
 * localStorage para invitados, en Supabase para autenticados). Si quieres
 * forzar login en alguna ruta, agrégala a PROTECTED_PREFIXES.
 */
const PROTECTED_PREFIXES: string[] = [];

const AUTH_ROUTES = ['/login', '/register'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Si faltan envs (entorno mal configurado), seguimos sin auth para no
  // tirar el middleware con MIDDLEWARE_INVOCATION_FAILED. La app cargará
  // en modo invitado; el login mostrará un error claro al intentarlo.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: este getUser() es lo que mantiene la sesión viva.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  // Sin sesión y entrando a ruta privada → redirigir a /login
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Con sesión y entrando a /login o /register → redirigir a /start
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/start';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}
