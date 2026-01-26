
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <header className="flex items-center justify-between">
         <h1 className="font-headline text-4xl font-bold">Términos de Servicio</h1>
         <Button asChild variant="outline">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
            </Link>
         </Button>
      </header>
      <Separator className="my-8" />
      <div className="prose prose-invert max-w-none text-foreground/80 space-y-6">
        <p>Última actualización: 26 de Enero de 2026</p>

        <p>
          Bienvenido a EmprendeIA. Estos términos y condiciones describen las reglas y regulaciones para el uso del sitio web de EmprendeIA.
        </p>

        <h2 className="font-headline text-2xl font-semibold">1. Aceptación de los Términos</h2>
        <p>
          Al acceder a este sitio web, asumimos que aceptas estos términos y condiciones. No continúes usando EmprendeIA si no estás de acuerdo con todos los términos y condiciones establecidos en esta página.
        </p>

        <h2 className="font-headline text-2xl font-semibold">2. Cuentas</h2>
        <p>
            Cuando creas una cuenta con nosotros, debes proporcionarnos información precisa, completa y actualizada en todo momento. El incumplimiento de esta obligación constituye una violación de los Términos, lo que puede resultar en la terminación inmediata de tu cuenta en nuestro Servicio.
        </p>
        <p>
            Eres responsable de salvaguardar la contraseña que utilizas para acceder al Servicio y de cualquier actividad o acción bajo tu contraseña, ya sea que tu contraseña esté con nuestro Servicio o con un servicio de terceros.
        </p>
        
        <h2 className="font-headline text-2xl font-semibold">3. Propiedad Intelectual</h2>
        <p>
          El Servicio y su contenido original (excluyendo el Contenido proporcionado por los usuarios), características y funcionalidad son y seguirán siendo propiedad exclusiva de EmprendeIA y sus licenciantes.
        </p>
        
        <h2 className="font-headline text-2xl font-semibold">4. Contenido Generado por el Usuario</h2>
        <p>
            Nuestro Servicio te permite publicar, vincular, almacenar, compartir y poner a disposición cierta información, texto, gráficos, videos u otro material ("Contenido"). Eres responsable del Contenido que publicas en el Servicio, incluida su legalidad, fiabilidad y adecuación.
        </p>
        <p>
            Al publicar Contenido en el Servicio, nos otorgas el derecho y la licencia para usar, modificar, ejecutar públicamente, mostrar públicamente, reproducir y distribuir dicho Contenido en y a través del Servicio. Conservas todos tus derechos sobre cualquier Contenido que envíes, publiques o muestres en o a través del Servicio y eres responsable de proteger esos derechos.
        </p>

        <h2 className="font-headline text-2xl font-semibold">5. Terminación</h2>
        <p>
          Podemos rescindir o suspender tu cuenta de inmediato, sin previo aviso ni responsabilidad, por cualquier motivo, incluido, entre otros, si incumples los Términos.
        </p>

        <h2 className="font-headline text-2xl font-semibold">6. Contáctanos</h2>
        <p>
          Si tienes alguna pregunta sobre estos Términos, por favor contáctanos en:
          <a href="mailto:soporte@emprendeia.com" className="text-primary hover:underline ml-2">soporte@emprendeia.com</a>
        </p>
      </div>
    </div>
  );
}
