import Header from "@/components/header";
import Footer from "@/components/footer";

import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function PoliticaCookies() {
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
                    <span className="text-green">Política de Cookies</span>
                  </h1>
                </div>

                <div className="bg-black/70 rounded-2xl border border-transparent p-8 transition-all duration-300 hover:border-green-500 hover:bg-black/50 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer">
                  <div className="prose prose-invert max-w-none">
                    
                    <h3 className="text-2xl font-bold text-green mb-4">Tipos de cookies</h3>
                    <p className="text-silver-100 mb-6">
                      Este sitio web utiliza las siguientes cookies propias:
                    </p>
                    <p className="text-silver-100 mb-6">
                      <strong className="text-white">Cookies de sesión</strong>, para garantizar que los usuarios que escriban comentarios en el blog sean humanos y no aplicaciones automatizadas. De esta forma se combate el spam.
                    </p>

                    <div className="border-t border-silver-500/30 pt-6 mt-6"></div>
                    
                    <p className="text-silver-100 mb-4">
                      Este sitio web utiliza las siguientes cookies de terceros:
                    </p>
                    <p className="text-silver-100 mb-4">
                      <strong className="text-white">Google Analytics</strong>: Almacena cookies para poder elaborar estadísticas sobre el tráfico y volumen de visitas de esta web. Al utilizar este sitio web está consintiendo el tratamiento de información acerca de usted por Google. Por tanto, el ejercicio de cualquier derecho en este sentido deberá hacerlo comunicando directamente con Google.
                    </p>
                    <p className="text-silver-100 mb-6">
                      <strong className="text-white">Redes sociales</strong>: Cada red social utiliza sus propias cookies para que usted pueda pinchar en botones del tipo Me gusta o Compartir.
                    </p>

                    <div className="border-t border-silver-500/30 pt-6 mt-6"></div>
                    
                    <h3 className="text-2xl font-bold text-green mb-4">Desactivación o eliminación de cookies</h3>
                    <p className="text-silver-100 mb-4">
                      En cualquier momento podrá ejercer su derecho de desactivación o eliminación de cookies de este sitio web.
                    </p>
                    <p className="text-silver-100 mb-4">
                      Para saber más sobre las cookies y la forma de desactivación de estas rogamos consulte la página "Más información sobre Cookies".
                    </p>
                    <p className="text-silver-100 mb-6">
                      Asimismo, le recomendamos encarecidamente que proceda a la lectura de las diversas políticas por las que se rige esta web y cuyo índice se recoge en el Aviso Legal.
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