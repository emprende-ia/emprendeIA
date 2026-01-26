
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
        <p>Última actualización: 26 de enero de 2025</p>

        <p>
          Bienvenido a Emprende IA. Estos Términos de Servicio establecen las reglas para usar nuestra plataforma. Al crear una cuenta o usar nuestros servicios, aceptas estos términos.
        </p>

        <p>
          <strong>En palabras simples:</strong> Emprende IA es una herramienta para ayudarte a hacer crecer tu negocio. Úsala de buena fe, respeta a los demás y nosotros haremos lo posible por darte el mejor servicio.
        </p>

        <h2 className="font-headline text-2xl font-semibold">1. ¿Qué es Emprende IA?</h2>
        <p>
          Emprende IA es una plataforma digital impulsada por Inteligencia Artificial diseñada específicamente para micro y pequeños negocios en México. Ofrecemos herramientas prácticas organizadas en módulos:
        </p>
        <ul className="list-disc list-inside space-y-2">
            <li><strong>Identidad:</strong> Define y fortalece la marca de tu negocio</li>
            <li><strong>Campañas:</strong> Crea estrategias de marketing efectivas</li>
            <li><strong>Finanzas:</strong> Organiza y entiende los números de tu negocio</li>
            <li><strong>Mentoría:</strong> Recibe orientación personalizada con IA</li>
        </ul>
        <p>Nuestra misión es ayudarte a que tu negocio sobreviva y prospere más allá de los primeros 2 años.</p>

        <h2 className="font-headline text-2xl font-semibold">2. ¿Quién puede usar Emprende IA?</h2>
        <p>Para usar nuestra plataforma debes:</p>
        <ul className="list-disc list-inside space-y-2">
            <li>Ser mayor de 18 años</li>
            <li>Residir en México o tener un negocio operando en México</li>
            <li>Proporcionar información verdadera y actualizada</li>
            <li>Tener capacidad legal para aceptar estos términos</li>
        </ul>
        
        <h2 className="font-headline text-2xl font-semibold">3. Tu cuenta</h2>
        <h3 className="font-headline text-xl font-semibold pt-2">3.1 Registro</h3>
        <p>Puedes crear una cuenta usando tu correo electrónico o iniciando sesión con Google. Al registrarte, te comprometes a:</p>
        <ul className="list-disc list-inside space-y-2">
            <li>Proporcionar información veraz y completa</li>
            <li>Mantener tu información actualizada</li>
            <li>Mantener la confidencialidad de tu contraseña</li>
            <li>No compartir tu cuenta con terceros</li>
        </ul>
        <h3 className="font-headline text-xl font-semibold pt-2">3.2 Seguridad de tu cuenta</h3>
        <p>Eres responsable de todas las actividades que ocurran en tu cuenta. Si sospechas que alguien ha accedido a tu cuenta sin autorización, notifícanos inmediatamente a <a href="mailto:contacto@emprendeia.app" className="text-primary hover:underline">contacto@emprendeia.app</a>.</p>

        <h2 className="font-headline text-2xl font-semibold">4. Uso aceptable</h2>
        <h3 className="font-headline text-xl font-semibold pt-2">4.1 Lo que SÍ puedes hacer</h3>
        <ul className="list-disc list-inside space-y-2">
            <li>Usar las herramientas para gestionar y hacer crecer tu negocio legítimo</li>
            <li>Ingresar información real de tu negocio</li>
            <li>Compartir tus resultados y experiencias (respetando tu privacidad)</li>
            <li>Contactarnos para resolver dudas o reportar problemas</li>
        </ul>
        <h3 className="font-headline text-xl font-semibold pt-2">4.2 Lo que NO puedes hacer</h3>
        <ul className="list-disc list-inside space-y-2">
            <li>Usar la plataforma para actividades ilegales o fraudulentas</li>
            <li>Intentar acceder a cuentas de otros usuarios</li>
            <li>Interferir con el funcionamiento de la plataforma</li>
            <li>Usar bots, scrapers o herramientas automatizadas no autorizadas</li>
            <li>Compartir contenido ofensivo, difamatorio o que viole derechos de terceros</li>
            <li>Revender o redistribuir nuestros servicios sin autorización</li>
            <li>Ingresar información falsa con el propósito de engañar o manipular el sistema</li>
        </ul>
        <p><strong>⚠️ Importante:</strong> El incumplimiento de estas reglas puede resultar en la suspensión o cancelación de tu cuenta.</p>

        <h2 className="font-headline text-2xl font-semibold">5. Contenido y propiedad intelectual</h2>
        <h3 className="font-headline text-xl font-semibold pt-2">5.1 Nuestro contenido</h3>
        <p>Todo el contenido de Emprende IA (diseño, textos, logotipos, código, herramientas de IA) es propiedad de Emprende IA y está protegido por las leyes de propiedad intelectual de México. No puedes copiar, modificar, distribuir o usar este contenido sin nuestra autorización por escrito.</p>
        <h3 className="font-headline text-xl font-semibold pt-2">5.2 Tu contenido</h3>
        <p>La información que ingresas sobre tu negocio sigue siendo tuya. Al usar la plataforma, nos otorgas una licencia limitada para procesar esta información únicamente con el fin de proporcionarte nuestros servicios.</p>

        <h2 className="font-headline text-2xl font-semibold">6. Inteligencia Artificial</h2>
        <p>Emprende IA utiliza tecnología de Inteligencia Artificial para generar recomendaciones, análisis y contenido. Es importante que entiendas que:</p>
        <ul className="list-disc list-inside space-y-2">
            <li>Las sugerencias de la IA son orientativas, no constituyen asesoría profesional (legal, fiscal, financiera)</li>
            <li>Debes usar tu criterio al tomar decisiones basadas en las recomendaciones</li>
            <li>Los resultados pueden variar según la información que proporciones</li>
            <li>Para decisiones importantes de tu negocio, te recomendamos consultar con profesionales especializados</li>
        </ul>

        <h2 className="font-headline text-2xl font-semibold">7. Planes y pagos</h2>
        <h3 className="font-headline text-xl font-semibold pt-2">7.1 Planes disponibles</h3>
        <p>Emprende IA puede ofrecer planes gratuitos y de pago. Las características de cada plan se describen en nuestra página de precios en <a href="https://emprendeia.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">emprendeia.app</a>.</p>
        <h3 className="font-headline text-xl font-semibold pt-2">7.2 Facturación</h3>
        <p>Si contratas un plan de pago:</p>
        <ul className="list-disc list-inside space-y-2">
            <li>Los cargos se realizarán de acuerdo al ciclo de facturación que elijas</li>
            <li>Podemos emitir facturas conforme a la legislación fiscal mexicana</li>
            <li>Los precios pueden cambiar con previo aviso de 30 días</li>
        </ul>
        <h3 className="font-headline text-xl font-semibold pt-2">7.3 Cancelaciones y reembolsos</h3>
        <p>Puedes cancelar tu suscripción en cualquier momento desde tu cuenta. La cancelación será efectiva al final del período de facturación actual. No ofrecemos reembolsos por períodos parciales, salvo lo que exija la ley aplicable.</p>

        <h2 className="font-headline text-2xl font-semibold">8. Disponibilidad del servicio</h2>
        <p>Nos esforzamos por mantener Emprende IA disponible las 24 horas, los 7 días de la semana. Sin embargo:</p>
        <ul className="list-disc list-inside space-y-2">
            <li>Pueden ocurrir interrupciones por mantenimiento (intentaremos notificarte con anticipación)</li>
            <li>Pueden existir fallas técnicas fuera de nuestro control</li>
            <li>Nos reservamos el derecho de modificar o descontinuar funciones con previo aviso</li>
        </ul>

        <h2 className="font-headline text-2xl font-semibold">9. Limitación de responsabilidad</h2>
        <p className="font-bold">Lee esto con atención:</p>
        <p>Emprende IA se proporciona "tal cual" y "según disponibilidad". En la máxima medida permitida por la ley mexicana:</p>
        <ul className="list-disc list-inside space-y-2">
            <li>No garantizamos que el servicio sea ininterrumpido o libre de errores</li>
            <li>No somos responsables por decisiones de negocio que tomes basándote en nuestras herramientas</li>
            <li>No somos responsables por pérdidas de datos debido a fallas técnicas (aunque hacemos respaldos regulares)</li>
            <li>Nuestra responsabilidad total no excederá el monto que hayas pagado en los últimos 12 meses</li>
            <li>Las recomendaciones de la IA no sustituyen el asesoramiento profesional en materia legal, fiscal, contable o financiera.</li>
        </ul>

        <h2 className="font-headline text-2xl font-semibold">10. Indemnización</h2>
        <p>Aceptas defender y mantener indemne a Emprende IA, sus directivos y empleados, de cualquier reclamación derivada de:</p>
        <ul className="list-disc list-inside space-y-2">
            <li>Tu uso de la plataforma</li>
            <li>Tu violación de estos términos</li>
            <li>Tu violación de derechos de terceros</li>
        </ul>

        <h2 className="font-headline text-2xl font-semibold">11. Modificaciones a los términos</h2>
        <p>Podemos actualizar estos Términos de Servicio ocasionalmente. Cuando realicemos cambios significativos:</p>
        <ul className="list-disc list-inside space-y-2">
            <li>Te notificaremos por correo electrónico con al menos 15 días de anticipación</li>
            <li>Publicaremos los nuevos términos en la plataforma</li>
            <li>Si continúas usando el servicio después de los cambios, se entenderá que los aceptas</li>
        </ul>

        <h2 className="font-headline text-2xl font-semibold">12. Terminación</h2>
        <h3 className="font-headline text-xl font-semibold pt-2">12.1 Por tu parte</h3>
        <p>Puedes cancelar tu cuenta en cualquier momento desde la configuración de tu perfil o contactándonos directamente.</p>
        <h3 className="font-headline text-xl font-semibold pt-2">12.2 Por nuestra parte</h3>
        <p>Podemos suspender o cancelar tu cuenta si:</p>
        <ul className="list-disc list-inside space-y-2">
            <li>Violas estos Términos de Servicio</li>
            <li>Usas la plataforma para actividades ilegales</li>
            <li>No has usado tu cuenta en más de 24 meses</li>
            <li>Es necesario por razones legales o de seguridad</li>
        </ul>
        <h3 className="font-headline text-xl font-semibold pt-2">12.3 Efectos de la terminación</h3>
        <p>Al terminar tu cuenta:</p>
        <ul className="list-disc list-inside space-y-2">
            <li>Perderás acceso a la plataforma y tus datos</li>
            <li>Podrás solicitar una copia de tus datos antes de la cancelación</li>
            <li>Eliminaremos tu información según nuestra Política de Privacidad</li>
        </ul>

        <h2 className="font-headline text-2xl font-semibold">13. Ley aplicable y jurisdicción</h2>
        <p>Estos Términos de Servicio se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia derivada de estos términos o del uso de la plataforma, las partes se someten a la jurisdicción de los tribunales competentes de la Ciudad de México, renunciando a cualquier otro fuero que pudiera corresponderles.</p>
        
        <h2 className="font-headline text-2xl font-semibold">14. Disposiciones generales</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Acuerdo completo:</strong> Estos términos, junto con la Política de Privacidad, constituyen el acuerdo completo entre tú y Emprende IA.</li>
          <li><strong>Divisibilidad:</strong> Si alguna disposición se considera inválida, las demás seguirán vigentes.</li>
          <li><strong>Renuncia:</strong> El no ejercer un derecho no implica renunciar a él.</li>
          <li><strong>Cesión:</strong> No puedes ceder tus derechos bajo estos términos sin nuestro consentimiento.</li>
        </ul>
        
        <h2 className="font-headline text-2xl font-semibold">15. Política de Privacidad</h2>
        <p>Tu privacidad es importante para nosotros. El uso de tus datos personales se rige por nuestra Política de Privacidad, que forma parte integral de estos Términos de Servicio.</p>

        <h2 className="font-headline text-2xl font-semibold">¿Tienes dudas?</h2>
        <p>Si tienes dudas sobre estos Términos de Servicio, estamos para ayudarte:</p>
        <ul className="list-none pl-0 space-y-1">
          <li>📧 Correo: <a href="mailto:contacto@emprendeia.app" className="text-primary hover:underline">contacto@emprendeia.app</a></li>
          <li>🌐 Sitio web: <a href="https://emprendeia.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://emprendeia.app</a></li>
        </ul>
      </div>
    </div>
  );
}
