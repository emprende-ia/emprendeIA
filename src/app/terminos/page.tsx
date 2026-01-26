
import React from 'react';

const H1: React.FC<{ children: React.ReactNode }> = ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4 font-headline text-primary">{children}</h1>;
const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3 font-headline text-primary/90">{children}</h2>;
const P: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => <p className={`mb-4 leading-relaxed ${className}`}>{children}</p>;
const A: React.FC<{ href: string, children: React.ReactNode }> = ({ href, children }) => <a href={href} className="text-accent hover:underline">{children}</a>;
const LI: React.FC<{ children: React.ReactNode }> = ({ children }) => <li className="mb-2">{children}</li>;
const UL: React.FC<{ children: React.ReactNode }> = ({ children }) => <ul className="list-disc list-inside mb-4">{children}</ul>;

export default function TermsOfServicePage() {
  return (
    <main className="bg-background text-foreground min-h-screen p-4 sm:p-8 md:p-12">
      <div className="max-w-4xl mx-auto">
        <H1>Términos de Servicio</H1>
        <P className="text-muted-foreground">Última actualización: 26 de enero de 2025</P>

        <P>Bienvenido a Emprende IA. Estos Términos de Servicio establecen las reglas para usar nuestra plataforma. Al crear una cuenta o usar nuestros servicios, aceptas estos términos.</P>
        <P className="font-bold border-l-4 border-primary pl-4">En palabras simples: Emprende IA es una herramienta para ayudarte a hacer crecer tu negocio. Úsala de buena fe, respeta a los demás y nosotros haremos lo posible por darte el mejor servicio.</P>

        <H2>1. ¿Qué es Emprende IA?</H2>
        <P>Emprende IA es una plataforma digital impulsada por Inteligencia Artificial diseñada específicamente para micro y pequeños negocios en México. Ofrecemos herramientas prácticas organizadas en módulos:</P>
        <UL>
          <LI><strong>Identidad:</strong> Define y fortalece la marca de tu negocio</LI>
          <LI><strong>Campañas:</strong> Crea estrategias de marketing efectivas</LI>
          <LI><strong>Finanzas:</strong> Organiza y entiende los números de tu negocio</LI>
          <LI><strong>Mentoría:</strong> Recibe orientación personalizada con IA</LI>
        </UL>
        <P>Nuestra misión es ayudarte a que tu negocio sobreviva y prospere más allá de los primeros 2 años.</P>

        <H2>2. ¿Quién puede usar Emprende IA?</H2>
        <P>Para usar nuestra plataforma debes:</P>
        <UL>
          <LI>Ser mayor de 18 años</LI>
          <LI>Residir en México o tener un negocio operando en México</LI>
          <LI>Proporcionar información verdadera y actualizada</LI>
          <LI>Tener capacidad legal para aceptar estos términos</LI>
        </UL>

        <H2>3. Tu cuenta</H2>
        <P><strong>3.1 Registro</strong><br/>Puedes crear una cuenta usando tu correo electrónico o iniciando sesión con Google. Al registrarte, te comprometes a:</P>
        <UL>
          <LI>Proporcionar información veraz y completa</LI>
          <LI>Mantener tu información actualizada</LI>
          <LI>Mantener la confidencialidad de tu contraseña</LI>
          <LI>No compartir tu cuenta con terceros</LI>
        </UL>
        <P><strong>3.2 Seguridad de tu cuenta</strong><br/>Eres responsable de todas las actividades que ocurran en tu cuenta. Si sospechas que alguien ha accedido a tu cuenta sin autorización, notifícanos inmediatamente a <A href="mailto:contacto@emprendeia.app">contacto@emprendeia.app</A>.</P>

        <H2>4. Uso aceptable</H2>
        <P><strong>4.1 Lo que SÍ puedes hacer</strong></P>
        <UL>
          <LI>Usar las herramientas para gestionar y hacer crecer tu negocio legítimo</LI>
          <LI>Ingresar información real de tu negocio</LI>
          <LI>Compartir tus resultados y experiencias (respetando tu privacidad)</LI>
          <LI>Contactarnos para resolver dudas o reportar problemas</LI>
        </UL>
        <P><strong>4.2 Lo que NO puedes hacer</strong></P>
        <UL>
          <LI>Usar la plataforma para actividades ilegales o fraudulentas</LI>
          <LI>Intentar acceder a cuentas de otros usuarios</LI>
          <LI>Interferir con el funcionamiento de la plataforma</LI>
          <LI>Usar bots, scrapers o herramientas automatizadas no autorizadas</LI>
          <LI>Compartir contenido ofensivo, difamatorio o que viole derechos de terceros</LI>
          <LI>Revender o redistribuir nuestros servicios sin autorización</LI>
          <LI>Ingresar información falsa con el propósito de engañar o manipular el sistema</LI>
        </UL>
        <P className="font-bold text-destructive">⚠️ Importante: El incumplimiento de estas reglas puede resultar en la suspensión o cancelación de tu cuenta.</P>

        <H2>5. Contenido y propiedad intelectual</H2>
        <P><strong>5.1 Nuestro contenido</strong><br/>Todo el contenido de Emprende IA (diseño, textos, logotipos, código, herramientas de IA) es propiedad de Emprende IA y está protegido por las leyes de propiedad intelectual de México. No puedes copiar, modificar, distribuir o usar este contenido sin nuestra autorización por escrito.</P>
        <P><strong>5.2 Tu contenido</strong><br/>La información que ingresas sobre tu negocio sigue siendo tuya. Al usar la plataforma, nos otorgas una licencia limitada para procesar esta información únicamente con el fin de proporcionarte nuestros servicios.</P>

        <H2>6. Inteligencia Artificial</H2>
        <P>Emprende IA utiliza tecnología de Inteligencia Artificial para generar recomendaciones, análisis y contenido. Es importante que entiendas que:</P>
        <UL>
          <LI>Las sugerencias de la IA son orientativas, no constituyen asesoría profesional (legal, fiscal, financiera)</LI>
          <LI>Debes usar tu criterio al tomar decisiones basadas en las recomendaciones</LI>
          <LI>Los resultados pueden variar según la información que proporciones</LI>
          <LI>Para decisiones importantes de tu negocio, te recomendamos consultar con profesionales especializados</LI>
        </UL>

        <H2>7. Planes y pagos</H2>
        <P><strong>7.1 Planes disponibles</strong><br/>Emprende IA puede ofrecer planes gratuitos y de pago. Las características de cada plan se describen en nuestra página de precios en emprendeia.app.</P>
        <P><strong>7.2 Facturación</strong><br/>Si contratas un plan de pago:</P>
        <UL>
          <LI>Los cargos se realizarán de acuerdo al ciclo de facturación que elijas</LI>
          <LI>Podemos emitir facturas conforme a la legislación fiscal mexicana</LI>
          <LI>Los precios pueden cambiar con previo aviso de 30 días</LI>
        </UL>
        <P><strong>7.3 Cancelaciones y reembolsos</strong><br/>Puedes cancelar tu suscripción en cualquier momento desde tu cuenta. La cancelación será efectiva al final del período de facturación actual. No ofrecemos reembolsos por períodos parciales, salvo lo que exija la ley aplicable.</P>
        
        <H2>8. Disponibilidad del servicio</H2>
        <P>Nos esforzamos por mantener Emprende IA disponible las 24 horas, los 7 días de la semana. Sin embargo:</P>
        <UL>
          <LI>Pueden ocurrir interrupciones por mantenimiento (intentaremos notificarte con anticipación)</LI>
          <LI>Pueden existir fallas técnicas fuera de nuestro control</LI>
          <LI>Nos reservamos el derecho de modificar o descontinuar funciones con previo aviso</LI>
        </UL>
        
        <H2>9. Limitación de responsabilidad</H2>
        <P className="font-bold">Lee esto con atención:</P>
        <P>Emprende IA se proporciona "tal cual" y "según disponibilidad". En la máxima medida permitida por la ley mexicana:</P>
        <UL>
          <LI>No garantizamos que el servicio sea ininterrumpido o libre de errores</LI>
          <LI>No somos responsables por decisiones de negocio que tomes basándote en nuestras herramientas</LI>
          <LI>No somos responsables por pérdidas de datos debido a fallas técnicas (aunque hacemos respaldos regulares)</LI>
          <LI>Nuestra responsabilidad total no excederá el monto que hayas pagado en los últimos 12 meses</LI>
          <LI>Las recomendaciones de la IA no sustituyen el asesoramiento profesional en materia legal, fiscal, contable o financiera.</LI>
        </UL>

        <H2>10. Indemnización</H2>
        <P>Aceptas defender y mantener indemne a Emprende IA, sus directivos y empleados, de cualquier reclamación derivada de:</P>
        <UL>
            <LI>Tu uso de la plataforma</LI>
            <LI>Tu violación de estos términos</LI>
            <LI>Tu violación de derechos de terceros</LI>
        </UL>

        <H2>11. Modificaciones a los términos</H2>
        <P>Podemos actualizar estos Términos de Servicio ocasionalmente. Cuando realicemos cambios significativos:</P>
        <UL>
            <LI>Te notificaremos por correo electrónico con al menos 15 días de anticipación</LI>
            <LI>Publicaremos los nuevos términos en la plataforma</LI>
        </UL>
        <P>Si continúas usando el servicio después de los cambios, se entenderá que los aceptas.</P>

        <H2>12. Terminación</H2>
        <P><strong>12.1 Por tu parte</strong><br/>Puedes cancelar tu cuenta en cualquier momento desde la configuración de tu perfil o contactándonos directamente.</P>
        <P><strong>12.2 Por nuestra parte</strong><br/>Podemos suspender o cancelar tu cuenta si:</P>
        <UL>
            <LI>Violas estos Términos de Servicio</LI>
            <LI>Usas la plataforma para actividades ilegales</LI>
            <LI>No has usado tu cuenta en más de 24 meses</LI>
            <LI>Es necesario por razones legales o de seguridad</LI>
        </UL>
        <P><strong>12.3 Efectos de la terminación</strong><br/>Al terminar tu cuenta:</P>
        <UL>
            <LI>Perderás acceso a la plataforma y tus datos</LI>
            <LI>Podrás solicitar una copia de tus datos antes de la cancelación</LI>
            <LI>Eliminaremos tu información según nuestra Política de Privacidad</LI>
        </UL>

        <H2>13. Ley aplicable y jurisdicción</H2>
        <P>Estos Términos de Servicio se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia derivada de estos términos o del uso de la plataforma, las partes se someten a la jurisdicción de los tribunales competentes de la Ciudad de México, renunciando a cualquier otro fuero que pudiera corresponderles.</P>

        <H2>14. Disposiciones generales</H2>
        <UL>
            <LI><strong>Acuerdo completo:</strong> Estos términos, junto con la Política de Privacidad, constituyen el acuerdo completo entre tú y Emprende IA.</LI>
            <LI><strong>Divisibilidad:</strong> Si alguna disposición se considera inválida, las demás seguirán vigentes.</LI>
            <LI><strong>Renuncia:</strong> El no ejercer un derecho no implica renunciar a él.</LI>
            <LI><strong>Cesión:</strong> No puedes ceder tus derechos bajo estos términos sin nuestro consentimiento.</LI>
        </UL>

        <H2>15. Política de Privacidad</H2>
        <P>Tu privacidad es importante para nosotros. El uso de tus datos personales se rige por nuestra <A href="/privacidad">Política de Privacidad</A>, que forma parte integral de estos Términos de Servicio.</P>
        
        <H2>¿Tienes preguntas?</H2>
        <P>Si tienes dudas sobre estos Términos de Servicio, estamos para ayudarte:</P>
        <UL>
            <LI>📧 Correo: <A href="mailto:contacto@emprendeia.app">contacto@emprendeia.app</A></LI>
            <LI>🌐 Sitio web: <A href="https://emprendeia.app">https://emprendeia.app</A></LI>
        </UL>
      </div>
    </main>
  );
}
