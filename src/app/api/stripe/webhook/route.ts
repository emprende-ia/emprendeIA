import { NextResponse } from 'next/server';

/**
 * Endpoint deshabilitado. 
 * El procesamiento de Stripe ahora es gestionado íntegramente por Cloud Functions
 * para mayor robustez y seguridad.
 */
export async function POST() {
  return NextResponse.json({ 
    status: 'deprecated', 
    message: 'Webhooks are handled by Cloud Functions.' 
  }, { status: 410 });
}
