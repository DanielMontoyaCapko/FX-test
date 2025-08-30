import Header from "@/components/header";
import Footer from "@/components/footer";

import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function PoliticaUso() {
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
                    <span className="text-green">Política de Uso</span>
                  </h1>
                </div>

                <div className="bg-black/70 rounded-2xl border border-transparent p-8 transition-all duration-300 hover:border-green-500 hover:bg-black/50 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer">
                  <div className="prose prose-invert max-w-none">
                    
                    <h3 className="text-2xl font-bold text-green mb-4">Titular de los sitios web y aplicaciones móviles</h3>
                    <p className="text-silver-100 mb-6">
                      La identificación del titular / propietario se recoge en el "Aviso Legal".
                    </p>

                    <div className="border-t border-silver-500/30 pt-6 mt-6"></div>
                    
                    <h3 className="text-2xl font-bold text-green mb-4">Objeto</h3>
                    <p className="text-silver-100 mb-6">
                      La política de uso regula las normas por las que se rige esta web y establece los derechos y obligaciones tanto de los usuarios como del propietario.
                    </p>

                    <div className="border-t border-silver-500/30 pt-6 mt-6"></div>
                    
                    <h3 className="text-2xl font-bold text-green mb-4">Usuario</h3>
                    <p className="text-silver-100 mb-4">
                      Usuario es toda persona que acceda a la web bajo su responsabilidad exclusiva.
                    </p>
                    <p className="text-silver-100 mb-6">
                      El acceso implica la lectura y aceptación de la presente política, así como de las demás políticas fijadas en el aviso legal.
                    </p>

                    <div className="border-t border-silver-500/30 pt-6 mt-6"></div>
                    
                    <h3 className="text-2xl font-bold text-green mb-4">Derechos y obligaciones del usuario</h3>
                    <p className="text-silver-100 mb-4">
                      Navegación, acceso y uso de todos los contenidos gratuitos suministrados en la web, visualizar los elementos, imprimirlos, copiarlos y almacenarlos para un uso personal y privado, así como a aquellos contenidos de pago, una vez que se haya satisfecho el importe correspondiente, fijada para cada servicio en concreto.
                    </p>
                    <p className="text-silver-100 mb-4">
                      La utilización de los servicios y contenidos es única y exclusivamente particular, por lo que no puede obtener beneficio alguno por los mismos, salvo acuerdo previo y por escrito con el titular de los derechos.
                    </p>
                    <p className="text-silver-100 mb-4">
                      A la protección de sus datos personales.
                    </p>
                    <p className="text-silver-100 mb-4">
                      La utilización se debe realizar con respeto a la legislación vigente.
                    </p>
                    <p className="text-silver-100 mb-4">
                      El usuario se compromete, con carácter enunciativo, pero no limitativo, a no utilizar la web:
                    </p>
                    <ul className="text-silver-100 mb-6 ml-6 space-y-2">
                      <li>Incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público;</li>
                      <li>Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico-ilegal, de apología del terrorismo o atentatorio contra los derechos humanos;</li>
                      <li>Provocar daños en los sistemas físicos y lógicos del sitio web y de sus proveedores o de terceras personas, introducir o difundir en la red virus informáticos o cualesquiera otros sistemas físicos o lógicos que sean susceptibles de provocar los daños anteriormente mencionados;</li>
                      <li>Intentar acceder y, en su caso, utilizar las cuentas de correo electrónico de otros usuarios y modificar o manipular sus mensajes;</li>
                      <li>Utilizar la marca, nombres comerciales, así como cualquier otro signo identificativo u otros derechos que se encuentre sujeto a derechos de propiedad intelectual o industrial, sin la previa autorización expresa y por escrito de su propietario.</li>
                    </ul>
                    <p className="text-silver-100 mb-6">
                      A poner en conocimiento de aquella información que considere de interés para el buen funcionamiento del sitio como, por ejemplo, la existencia de enlaces erróneos, información inexacta, etc.
                    </p>

                    <div className="border-t border-silver-500/30 pt-6 mt-6"></div>
                    
                    <h3 className="text-2xl font-bold text-green mb-4">Derechos y obligaciones de NAKAMA&PARTNERS</h3>
                    <ul className="text-silver-100 mb-6 ml-6 space-y-3">
                      <li>Actualizar y modificar cualquiera de las políticas recogidas en la web tanto en su contenido como por razones técnicas y de adaptación a las nuevas necesidades legales o técnicas, sin que esta actualización o modificación genere ningún tipo de contraprestación económico o indemnización a los usuarios.</li>
                      <li>Definir y establecer los usos y contenidos gratuitos, así como, fijar los precios y requisitos para los servicios y contenidos exclusivos.</li>
                      <li>Impedir el acceso de aquellos usuarios que realicen un uso contrario a lo establecido por las políticas definidas en el sitio, así como eliminar cualquier comentario u opinión vertidos en la misma que sea contrario a dichas políticas.</li>
                      <li>Cancelar, suprimir o finalizar los servicios y contenidos que considere oportuno, sin previo aviso y sin generar derechos de indemnización, salvo que así se establezca expresamente en los servicios contratados.</li>
                      <li>Acudir a los tribunales en defensa de sus legítimos derechos, exigiendo las indemnizaciones y contraprestaciones correspondientes.</li>
                      <li><strong className="text-white">NAKAMA&PARTNERS</strong> no se hace responsable de las opiniones y comentarios realizados por los usuarios de la web.</li>
                    </ul>

                    <div className="border-t border-silver-500/30 pt-6 mt-6"></div>
                    
                    <h3 className="text-2xl font-bold text-green mb-4">Enlaces a páginas de terceros</h3>
                    <p className="text-silver-100 mb-4">
                      <strong className="text-white">NAKAMA&PARTNERS</strong> no se hace responsable de los contenidos de todo tipo incluidos en páginas web que puedan estar enlazadas a esta web, así como tampoco ejercer ningún tipo de control sobre dichos sitios, por lo que se exime de toda responsabilidad de cualquier que tuviera lugar con motivo del acceso a los mismos, a modo de ejemplo: modalidad de acceso, seguridad, servicios o contenidos ofrecidos, etc.
                    </p>
                    <p className="text-silver-100 mb-6">
                      La existencia de enlaces o hipervínculos a terceros no implica en ningún caso la existencia de relación, colaboración o compromiso contractual entre dichos terceros y <strong className="text-white">NAKAMA&PARTNERS</strong>.
                    </p>

                    <div className="border-t border-silver-500/30 pt-6 mt-6"></div>
                    
                    <h3 className="text-2xl font-bold text-green mb-4">Enlaces a redes sociales</h3>
                    <p className="text-silver-100 mb-6">
                      <strong className="text-white">NAKAMA&PARTNERS</strong> dispone de perfiles creados en diversas redes sociales a las cuales se puede acceder directamente desde la web de <strong className="text-white">NAKAMA&PARTNERS</strong>. La información personal de los usuarios existente en <strong className="text-white">NAKAMA&PARTNERS</strong> no se comparte con ninguna de las otras redes sociales, por lo que el usuario deberá autorizar el seguimiento y acceso en cada una de ellas de forma independiente.
                    </p>

                    <div className="border-t border-silver-500/30 pt-6 mt-6"></div>
                    
                    <h3 className="text-2xl font-bold text-green mb-4">Enlaces desde terceros a NAKAMA&PARTNERS</h3>
                    <p className="text-silver-100 mb-4">
                      Los enlaces que terceros puedan realizar a la web de <strong className="text-white">NAKAMA&PARTNERS</strong> se realizan bajo su exclusiva responsabilidad y siempre y cuando el sitio donde estén ubicados respete los principios establecidos en las políticas definidas en esta web, queda expresamente prohibido el establecimiento de enlaces a sitios que contravenga la legislación vigente aplicable en España, así como los usos y costumbres generalmente aceptados.
                    </p>
                    <p className="text-silver-100 mb-6">
                      Dada nuestra imposibilidad para controlar que terceros puedan incorporar un enlace o hipervínculo, <strong className="text-white">NAKAMA&PARTNERS</strong>, excluye de manera expresa su responsabilidad sobre cualquier contenido, forma y fondo de la web o sitio en que dicho enlace haya sido alojado, reservándose el derecho de acudir a los tribunales a fin de exigir la eliminación de dicho enlace.
                    </p>

                    <div className="border-t border-silver-500/30 pt-6 mt-6"></div>
                    
                    <h3 className="text-2xl font-bold text-green mb-4">Exclusión de garantías y responsabilidad</h3>
                    <p className="text-silver-100 mb-6">
                      <strong className="text-white">NAKAMA&PARTNERS</strong> no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, en las situaciones expresamente recogidas en las diversas políticas aprobadas y en concreto y a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos o lesivos en los contenidos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.
                    </p>

                    <div className="border-t border-silver-500/30 pt-6 mt-6"></div>
                    
                    <h3 className="text-2xl font-bold text-green mb-4">Propiedad intelectual e industrial</h3>
                    <p className="text-silver-100 mb-6">
                      <strong className="text-white">NAKAMA&PARTNERS</strong>, por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo, imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, selección de materiales usados, programas de ordenador necesarios para su funcionamiento, acceso y uso, etc.). Quedan reservados todos los derechos.
                    </p>

                    <div className="border-t border-silver-500/30 pt-6 mt-6"></div>
                    
                    <h3 className="text-2xl font-bold text-green mb-4">Protección de datos</h3>
                    <p className="text-silver-100 mb-6">
                      La protección de datos en <strong className="text-white">NAKAMA&PARTNERS</strong> se realiza de acuerdo con la Política de Protección de datos aprobada y que debe ser leída y aceptada por el usuario.
                    </p>

                    <div className="border-t border-silver-500/30 pt-6 mt-6"></div>
                    
                    <h3 className="text-2xl font-bold text-green mb-4">Uso de cookies y web beacons</h3>
                    <p className="text-silver-100 mb-6">
                      El uso de las cookies está regulado en la Política de Cookies que el usuario debe leer y aceptar.
                    </p>

                    <div className="border-t border-silver-500/30 pt-6 mt-6"></div>
                    
                    <h3 className="text-2xl font-bold text-green mb-4">Miscelánea</h3>
                    <p className="text-silver-100 mb-4">
                      Cuando por decisión judicial o por cambio normativo una cláusula resultase anulada, la misma quedará excluida del contenido de las políticas fijadas, manteniendo el resto de las cláusulas su vigencia, salvo aquellas a las que haga inaplicables.
                    </p>
                    <p className="text-silver-100 mb-4">
                      Solo la aceptación expresa y por escrito por parte de <strong className="text-white">NAKAMA&PARTNERS</strong> de no aplicación de alguna cláusula será válida, quedando por tanto excluida cualquier situación tácita que pueda darse durante la vigencia de estas, pudiendo exigirse por <strong className="text-white">NAKAMA&PARTNERS</strong> el cumplimiento de todas y cada una de ellas en cualquier momento.
                    </p>
                    <p className="text-silver-100 mb-4">
                      El sitio web se regirá por la legislación española y europea vigente en cada momento.
                    </p>
                    <p className="text-silver-100 mb-6">
                      Las partes, con expresa renuncia a su propio fuero, se someten para la resolución de cuantos litigios pudieran derivarse a los Juzgados y Tribunales de la ciudad de la sede social de la entidad propietaria de la web.
                    </p>

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