import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <header className="flex items-center justify-between">
         <h1 className="font-headline text-4xl font-bold">Política de Privacidad</h1>
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
          Bienvenido a EmprendeIA. Tu privacidad es de suma importancia para nosotros. Esta Política de Privacidad
          describe qué datos recopilamos, cómo los usamos y las opciones que tienes con respecto a tu información.
        </p>

        <h2 className="font-headline text-2xl font-semibold">1. Información que Recopilamos</h2>
        <p>
          Recopilamos información para proporcionar y mejorar nuestros servicios. Los tipos de información que
          recopilamos incluyen:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Información de la Cuenta:</strong> Cuando te registras, recopilamos información como tu nombre,
            dirección de correo electrónico y contraseña. Si te registras con un proveedor externo como Google,
            recopilamos la información que nos autorices a recibir de ese proveedor.
          </li>
          <li>
            <strong>Contenido Generado por el Usuario:</strong> Recopilamos la información que proporcionas
            directamente a nuestra aplicación, como descripciones de ideas de negocio, planes de marketing,
            transacciones financieras y cualquier otro dato ingresado para utilizar nuestras herramientas de IA.
          </li>
          <li>
            <strong>Datos de Uso:</strong> Recopilamos información sobre cómo interactúas con nuestra aplicación,
            como las funciones que utilizas y la frecuencia de uso. Esto nos ayuda a mejorar la experiencia del
            usuario.
          </li>
        </ul>

        <h2 className="font-headline text-2xl font-semibold">2. Cómo Usamos tu Información</h2>
        <p>Utilizamos la información que recopilamos para los siguientes propósitos:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Para proporcionar, mantener y mejorar nuestros servicios.</li>
          <li>Para personalizar tu experiencia en la aplicación.</li>
          <li>
            Para comunicarnos contigo sobre tu cuenta, actualizaciones del servicio y ofertas promocionales
            (puedes optar por no recibirlas).
          </li>
          <li>
            Para proteger la seguridad e integridad de nuestra aplicación y de nuestros usuarios.
          </li>
          <li>Para cumplir con las obligaciones legales.</li>
        </ul>
        <p>
            No compartimos la información de tu negocio ni tus datos generados con terceros con fines de marketing. La información que proporcionas a las herramientas de IA se procesa para generar los resultados solicitados y no se utiliza para entrenar modelos de IA de terceros sin tu consentimiento explícito.
        </p>

        <h2 className="font-headline text-2xl font-semibold">3. Seguridad de los Datos</h2>
        <p>
          Tomamos medidas razonables para proteger tu información contra el acceso, uso o divulgación no autorizados.
          Utilizamos servicios de Firebase, que proporcionan medidas de seguridad robustas para la autenticación y
          el almacenamiento de datos. Sin embargo, ningún método de transmisión por Internet o de almacenamiento
          electrónico es 100% seguro.
        </p>

        <h2 className="font-headline text-2xl font-semibold">4. Tus Derechos y Opciones</h2>
        <p>
          Tienes derecho a acceder, corregir o eliminar tu información personal. Puedes actualizar la información de
          tu perfil directamente en la aplicación. Si deseas eliminar tu cuenta y tus datos asociados, por favor,
          contacta con nuestro equipo de soporte.
        </p>

        <h2 className="font-headline text-2xl font-semibold">5. Cambios a esta Política de Privacidad</h2>
        <p>
          Podemos actualizar esta Política de Privacidad de vez en cuando. Te notificaremos de cualquier cambio
          publicando la nueva política en esta página. Se te aconseja revisar esta Política de Privacidad
          periódicamente para cualquier cambio.
        </p>

        <h2 className="font-headline text-2xl font-semibold">6. Contáctanos</h2>
        <p>
          Si tienes alguna pregunta sobre esta Política de Privacidad, por favor contáctanos en:
          <a href="mailto:soporte@emprendeia.com" className="text-primary hover:underline ml-2">soporte@emprendeia.com</a>
        </p>
      </div>
    </div>
  );
}
