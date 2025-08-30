import Header from "@/components/header";
import Footer from "@/components/footer";

import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function ProteccionDatos() {
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
                    Información Básica
                  </p>
                </div>

                <div className="bg-black/70 rounded-2xl border border-transparent p-8 transition-all duration-300 hover:border-green-500 hover:bg-black/50 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer">
                  <div className="prose prose-invert max-w-none">
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-green mb-2">Responsable del tratamiento:</h3>
                        <p className="text-silver-100"><strong className="text-white">NAKAMA&PARTNERS</strong></p>
                      </div>

                      <div className="border-t border-silver-500/30 pt-6"></div>

                      <div>
                        <h3 className="text-xl font-bold text-green mb-2">Finalidades:</h3>
                        <p className="text-silver-100">Facilitar el uso de la página web, la prestación de los servicios de la empresa, comunicación comercial.</p>
                      </div>

                      <div className="border-t border-silver-500/30 pt-6"></div>

                      <div>
                        <h3 className="text-xl font-bold text-green mb-2">Legitimación:</h3>
                        <p className="text-silver-100">Interés legítimo de las partes, el consentimiento y el contractual cuando las partes firmen el correspondiente contrato.</p>
                      </div>

                      <div className="border-t border-silver-500/30 pt-6"></div>

                      <div>
                        <h3 className="text-xl font-bold text-green mb-2">Destinatarios:</h3>
                        <p className="text-silver-100">No se efectuará comunicación alguna a otras entidades, salvo aquellas comunicaciones que deban producirse por obligación o necesidad legal. No se producen transferencias a terceros países u organizaciones internacionales que no ofrecen garantías adecuadas.</p>
                      </div>

                      <div className="border-t border-silver-500/30 pt-6"></div>

                      <div>
                        <h3 className="text-xl font-bold text-green mb-2">Derechos:</h3>
                        <p className="text-silver-100">Tiene derecho de acceso a sus datos personales, de rectificación o supresión de sus datos personales, de limitación de su tratamiento, a oponerse al tratamiento, a la portabilidad de los datos, de exclusión de decisiones automáticas, así como cualesquiera otros que recoge la legislación vigente. Asimismo, podrá presentar una reclamación ante la <a href="https://www.aepd.es/" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green/80 underline transition-colors">Agencia Española de Protección de Datos</a>.</p>
                      </div>

                      <div className="border-t border-silver-500/30 pt-6"></div>

                      <div>
                        <h3 className="text-xl font-bold text-green mb-2">Conservación de los datos:</h3>
                        <p className="text-silver-100">Salvo indicación específica la duración es indefinida.</p>
                      </div>

                      <div className="border-t border-silver-500/30 pt-6"></div>

                      <div>
                        <h3 className="text-xl font-bold text-green mb-2">Procedencia de los datos:</h3>
                        <p className="text-silver-100">Los datos proceden del interesado.</p>
                      </div>

                      <div className="border-t border-silver-500/30 pt-6"></div>

                      <div>
                        <h3 className="text-xl font-bold text-green mb-2">Más Información:</h3>
                        <p className="text-silver-100">Protección de Datos. Información Detallada.</p>
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