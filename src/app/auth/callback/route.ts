import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDefaultPostAuthRoute } from '@/lib/supabase/onboarding';

/**
 * Endpoint que recibe el redirect de Supabase tras el OAuth de Google
 * (o tras un magic link). Intercambia el `code` por una sesión y redirige al
 * usuario a `?next=...` o, si no hay, decide entre /dashboard (si ya tiene
 * onboarding) o /start (primera vez).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const explicitNext = searchParams.get('next');
  const errorDescription = searchParams.get('error_description');

  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription)}`
    );
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`
      );
    }
  }

  // Si la ruta original era una protegida (login se invoca con ?next=/...),
  // respetarla. Si no, decidir según onboarding.
  let target: string;
  if (explicitNext && explicitNext.startsWith('/')) {
    target = explicitNext;
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    target = user ? await getDefaultPostAuthRoute(supabase, user.id) : '/start';
  }

  return NextResponse.redirect(`${origin}${target}`);
}
