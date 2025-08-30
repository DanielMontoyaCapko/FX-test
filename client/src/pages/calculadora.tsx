import Header from "@/components/header";
import Calculator from "@/components/calculator";
import Footer from "@/components/footer";

import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function Calculadora() {
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
        <main className="pt-32">
        <section className="py-6 bg-transparent">
          <div className="container mx-auto px-6">

          </div>
        </section>
        
        <Calculator />
        
        <section className="py-6 bg-transparent">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-playfair text-3xl font-bold text-white mb-8 text-center">
                ¿Qué Pasa al Final del Plazo?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-black/50 p-6 rounded-xl border border-emerald-500/15 transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/60 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer text-center">
                  <div className="w-16 h-16 bg-green/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-green font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-playfair text-xl font-semibold text-white mb-3">Retirar Capital</h3>
                  <p className="text-silver-100">Retire su capital inicial más los intereses generados.</p>
                </div>
                
                <div className="bg-black/50 p-6 rounded-xl border border-emerald-500/15 transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/60 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer text-center">
                  <div className="w-16 h-16 bg-green/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-green font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-playfair text-xl font-semibold text-white mb-3">Renovar</h3>
                  <p className="text-silver-100">Renueve su inversión con condiciones preferentes.</p>
                </div>
                
                <div className="bg-black/50 p-6 rounded-xl border border-emerald-500/15 transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/60 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer text-center">
                  <div className="w-16 h-16 bg-green/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-green font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-playfair text-xl font-semibold text-white mb-3">Interés Compuesto</h3>
                  <p className="text-silver-100">Aplique interés compuesto para maximizar el crecimiento.</p>
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