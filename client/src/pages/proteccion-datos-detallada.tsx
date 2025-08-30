import Header from "@/components/header";
import Footer from "@/components/footer";

import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function ProteccionDatosDetallada() {
  useScrollToTop();

  return (
    <div className={[
      "min-h-screen text-white relative",
      "bg-gradient-to-br from-black via-[#0A1713] to-[#0E2A1F]",
      "before:pointer-events-none before:absolute before:inset-0",
      "before:bg-[radial-gradient(80%_60%_at_110%_-10%,rgba(16,185,129,0.18),transparent),radial-gradient(60%_40%_at_-20%_110%,rgba(16,185,129,0.12),transparent)]",
    ].join(" ")}>
      <div className="relative z-10">
        <Header />
        
        <main className="pt-32 pb-16">
          <section className="py-6 bg-transparent">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <h1 className="font-playfair text-5xl md:text-6xl font-bold text-white mb-6 text-center">
                    <span className="text-green">Protección de Datos</span>
                  </h1>
                  <p className="text-xl text-silver-100 text-center">
                    Información Detallada
                  </p>
                </div>

                <div className="bg-black/70 rounded-2xl border border-transparent p-8 transition-all duration-300 hover:border-green-500 hover:bg-black/50 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer">
                  <div className="prose prose-invert max-w-none">
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold text-green mb-4">Información básica</h3>
                        <p className="text-silver-100">La información básica se encuentra en la capa I <a href="/proteccion-datos" className="text-green hover:text-green/80 underline transition-colors">Protección de datos. Información básica</a>.</p>
                      </div>

                      <div className="border-t border-silver-500/30 pt-6"></div>

                      <div>
                        <h3 className="text-2xl font-bold text-green mb-4">Información detallada</h3>
                        <p className="text-silver-100 mb-4">
                          Con carácter general el único dato del que se hará uso es de la IP exclusivamente con fines técnicos al objeto de facilitar el uso del usuario de la plataforma, gestionar la seguridad y dotar de calidad a la misma; a excepción de los datos que sean facilitados a través del formulario de contacto o para la contratación de los servicios ofrecidos.
                        </p>
                        <p className="text-silver-100">
                          Las políticas de utilización de esta web son aceptadas libre y voluntariamente tanto por los usuarios como por los visitantes.
                        </p>
                      </div>

                      <div className="border-t border-silver-500/30 pt-6"></div>

                      <div>
                        <h3 className="text-2xl font-bold text-green mb-4">Datos Personales, finalidades y plazo durante el cual se conservan los datos</h3>
                        <p className="text-silver-100 mb-4">
                          Solo se solicitan los datos mínimos, adecuados y pertinentes a los fines para los que se requiere.
                        </p>
                        <p className="text-silver-100 mb-4">
                          Los datos recogidos en el formulario de contacto tienen por finalidad responder a las peticiones realizadas por el usuario, el contacto comercial y la prestación de servicios. La duración de estos es indefinida.
                        </p>
                        <p className="text-silver-100">
                          Los datos correspondientes a la IP tienen por objetivo permitir la intercomunicación de los equipos y facilitar la navegación. Su duración es de dos meses. La no facilitación de dicho dato dificultará el acceso a la web por la aplicación de políticas antispam.
                        </p>
                      </div>

                      <div className="border-t border-silver-500/30 pt-6"></div>

                      <div>
                        <h3 className="text-2xl font-bold text-green mb-4">Destinatarios de los Datos personales</h3>
                        <p className="text-silver-100 mb-4">
                          No se efectuará comunicación alguna a otra entidad, salvo aquellas comunicaciones que se producen por obligación o necesidad legal a entidades que, entre otras, incluyen:
                        </p>
                        <ul className="text-silver-100 mb-4 ml-6 space-y-2">
                          <li>Las Fuerzas y Cuerpos de Seguridad del Estado, Jueces, Ministerio Fiscal, Juzgados y Tribunales y otras Administraciones Públicas o Autoridades que lo requieran en el ejercicio de sus competencias. Para efectuar la comunicación es necesario requerimiento documentado que resulte pertinente.</li>
                          <li>Otros, como notarios, procuradores, fedatarios y abogados, para la satisfacción de necesidades jurídicas que pudieran derivarse para la defensa legal de nuestros intereses.</li>
                        </ul>
                        <p className="text-silver-100">
                          No se producen transferencias a terceros países u organizaciones internacionales que no ofrecen garantías adecuadas, excepción hecha de que el usuario facilite un correo electrónico de contacto cuyo proveedor de servicio pueda encontrarse incurso en dicha situación.
                        </p>
                      </div>

                      <div className="border-t border-silver-500/30 pt-6"></div>

                      <div>
                        <h3 className="text-2xl font-bold text-green mb-4">Ejercicio de los derechos del usuario con relación a sus Datos Personales</h3>
                        <ul className="text-silver-100 mb-6 ml-6 space-y-3">
                          <li><strong className="text-white">Información:</strong> tiene derecho a ser informado de forma clara ANTES de que datos serán recogidos, qué datos están siendo tratados, con qué finalidad se tratan, donde han conseguido los datos y si los van a comunicar o los han comunicado a alguien.</li>
                          <li><strong className="text-white">Acceso:</strong> para conocer qué datos están siendo tratados, con qué finalidad se tratan, donde han conseguido los datos y si los van a comunicar o los han comunicado a alguien.</li>
                          <li><strong className="text-white">Rectificación:</strong> para modificar aquellos datos inexactos o incompletos.</li>
                          <li><strong className="text-white">Cancelación:</strong> para cancelar los datos inadecuados o excesivos.</li>
                          <li><strong className="text-white">Oposición:</strong> para exigir que se traten los datos o que dejen de tratarse, aunque sólo en los supuestos que establece la ley.</li>
                          <li><strong className="text-white">Limitación del tratamiento:</strong> para solicitar que se suspenda el tratamiento de datos en los supuestos que establece la ley, pero manteniendo los mismos a fin de facilitarte el ejercicio de las acciones legales que estimes oportuna.</li>
                          <li><strong className="text-white">Portabilidad de los datos:</strong> para poder recibir los datos facilitados en un formato electrónico estructurado y de uso habitual y poder transmitirlos a otro responsable.</li>
                          <li><strong className="text-white">Derecho a no ser objeto de decisiones individualizadas:</strong> con el fin de que no se tome una decisión sobre el usuario que produzca efectos jurídicos o le afecte basada sólo en el tratamiento de tus datos.</li>
                        </ul>
                        <p className="text-silver-100 mb-4">
                          <strong className="text-white">Puede ejercer sus derechos:</strong>
                        </p>
                        <p className="text-silver-100">
                          Por correo electrónico a la dirección a la dirección indicada más abajo.
                        </p>
                      </div>

                      <div className="border-t border-silver-500/30 pt-6"></div>

                      <div>
                        <h3 className="text-2xl font-bold text-green mb-4">Qué información debe aportar para ejercer sus derechos</h3>
                        <ul className="text-silver-100 mb-4 ml-6 space-y-2">
                          <li><strong className="text-white">Referencia:</strong> identificar en el asunto que se trata del ejercicio de sus derechos.</li>
                          <li><strong className="text-white">Contenido de la petición</strong> que realiza, incluyendo aquellos documentos que considere oportuno o necesario en función de estos.</li>
                          <li><strong className="text-white">Dirección</strong> en la que quiera recibir las sucesivas notificaciones.</li>
                          <li><strong className="text-white">Titularidad del derecho,</strong> a fin de acreditar la personalidad efectiva de quien efectúa la petición. Dicha acreditación se puede realizar por medios que garanticen la identidad (DNI, firma electrónica o cualquier otro documento). En caso de actuar en representación, poder que acredite la misma.</li>
                        </ul>
                      </div>

                      <div className="border-t border-silver-500/30 pt-6"></div>

                      <div>
                        <h3 className="text-2xl font-bold text-green mb-4">Cuando puede retirar el consentimiento</h3>
                        <p className="text-silver-100">
                          Podrá retirar el consentimiento prestado, en cualquier momento, sin que ello afecte a la licitud del tratamiento basado en el consentimiento previo a su retirada.
                        </p>
                      </div>

                      <div className="border-t border-silver-500/30 pt-6"></div>

                      <div>
                        <h3 className="text-2xl font-bold text-green mb-4">Reclamación ante una autoridad de Control</h3>
                        <p className="text-silver-100">
                          Tiene derecho a recabar la tutela de la <a href="https://www.aepd.es/" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green/80 underline transition-colors">Agencia Española de Protección de Datos (AEPD)</a>.
                        </p>
                      </div>

                      <div className="border-t border-silver-500/30 pt-6"></div>

                      <div>
                        <h3 className="text-2xl font-bold text-green mb-4">Existencia de Decisiones automatizadas (incluida la elaboración de perfiles)</h3>
                      </div>

                      <div className="border-t border-silver-500/30 pt-6"></div>

                      <div>
                        <h3 className="text-2xl font-bold text-green mb-4">Procedencia de los Datos Personales</h3>
                        <p className="text-silver-100">
                          Todos los datos se recaban del interesado.
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-silver-500/30 pt-6 mt-8">
                      <p className="text-silver-300 mb-2">
                        <strong>Fecha de actualización:</strong> 15/10/2024
                      </p>
                      <p className="text-silver-300 mb-4">
                        Para más información puede dirigirse a: <span className="text-green">dpo@nakamapartners.com</span>
                      </p>
                      <p className="text-center text-silver-400 text-sm">
                        Copyright <strong className="text-white">NAKAMA&PARTNERS</strong> Todos los derechos reservados.
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}