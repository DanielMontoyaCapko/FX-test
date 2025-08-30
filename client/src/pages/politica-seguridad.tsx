import Header from "@/components/header";
import Footer from "@/components/footer";

import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function PoliticaSeguridad() {
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
                    <span className="text-green">Política de Seguridad</span>
                  </h1>
                </div>

                <div className="bg-black/70 rounded-2xl border border-transparent p-8 transition-all duration-300 hover:border-green-500 hover:bg-black/50 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer">
                  <div className="prose prose-invert max-w-none">
                    
                    <p className="text-xl text-silver-100 mb-6">
                      Los principios por los que se rige la seguridad en los sistemas de información de <strong className="text-white">NAKAMA&PARTNERS</strong> son los siguientes:
                    </p>

                    <ul className="text-silver-100 mb-8 ml-6 space-y-4">
                      <li><strong className="text-white">Respeto y cumplimiento exacto de la legislación vigente.</strong></li>
                      <li><strong className="text-white">Gestión de los riesgos.</strong> Que implica el análisis previo, la implantación de medidas a fin de eliminar o, en su caso, minimizarlos, así como la permanente revisión con objeto de mantener actualizada de forma activa dicha gestión.</li>
                      <li><strong className="text-white">Garantía de confidencialidad en la información,</strong> de forma que solo las personas que deban hacer uso de los datos personales estarán autorizados y posibilitados para hacer usos de estos.</li>
                      <li><strong className="text-white">Garantía de integridad,</strong> de forma que los datos sean exactos, precisos y los mínimos necesarios.</li>
                      <li><strong className="text-white">Garantía de disponibilidad,</strong> mediante la puesta en marcha del correspondiente plan de contingencia.</li>
                      <li><strong className="text-white">Proporcionalidad de las medidas</strong> a fin de equilibrar de forma adecuada la seguridad, el riesgo y el normal funcionamiento de la organización.</li>
                      <li><strong className="text-white">Actualización y mejora.</strong> Mediante la planificación temporal de las revisiones periódicas del funcionamiento del sistema para su adaptación a las tecnologías y prevención de nuevos riesgos. Así como la implementación de las mejoras definidas a partir de cualquier incidente que se haya podido producir.</li>
                      <li><strong className="text-white">La responsabilidad</strong> de todas las personas que tienen acceso a la información y la necesaria formación a fin de cumplir de forma eficiente y eficaz todas las políticas existentes en la empresa.</li>
                    </ul>

                    <div className="border-t border-silver-500/30 pt-6 mt-6"></div>
                    
                    <p className="text-silver-100 mb-6">
                      <strong className="text-white">NAKAMA&PARTNERS</strong> pone en marcha las medidas de seguridad a fin de evitar cualquier incidencia, si bien hay que tener en cuenta que la garantía absoluta de seguridad en internet no existe.
                    </p>

                    <h3 className="text-2xl font-bold text-green mb-4">Medidas de autoprotección del usuario</h3>
                    <p className="text-silver-100 mb-4">
                      El usuario puede y debe tomar ciertas medidas de autoprotección que ayudarán a hacer de este sitio un lugar más seguro. Entre otras:
                    </p>
                    <ul className="text-silver-100 mb-6 ml-6 space-y-2">
                      <li>Utilizar contraseñas fuertes y seguras.</li>
                      <li>Evitar dar a conocer su usuario y contraseña a terceros.</li>
                      <li>Mantener su equipo (ordenadores, móviles, tabletas, etc.…) actualizados con la última versión del software.</li>
                      <li>Revisa las opciones de configuración del software a fin de evitar que el mismo pueda facilitar tus datos de navegación, usuario, contraseña, etc.</li>
                      <li>Acceder a esta web tecleando directamente la dirección, o bien desde hipervínculos conocidos y de garantías.</li>
                      <li>No facilitar, bajo ningún concepto, cualquier petición de facilitar tus datos personales o de acceso (usuario o contraseña) por correo electrónico o por teléfono.</li>
                      <li>Poner en conocimiento de las autoridades cualquier incidencia anormal de la que puedas haber sido objeto, así como consultar de forma periódica la información que se facilita a través de <a href="https://www.incibe.es/" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green/80 underline transition-colors">INCIBE</a>.</li>
                    </ul>

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