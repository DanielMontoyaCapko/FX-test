import Header from "@/components/header";
import Advisors from "@/components/advisors";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function Contacto() {
  useScrollToTop();
  
  const scheduleCalendly = () => {
    // In a real implementation, this would open Calendly widget
    console.log("Opening Calendly for scheduling");
  };
  
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
            <div className="text-center mb-8">
              <h1 className="font-georgia text-5xl md:text-6xl font-bold text-white mb-6">
                <span className="text-green">Contacto</span>
              </h1>
              <p className="text-xl text-silver-100 max-w-3xl mx-auto">
                Estamos aquí para resolver sus dudas y ayudarle a proteger su patrimonio.
              </p>
            </div>
          </div>
        </section>
        
        <section className="py-10 bg-transparent">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="contact-info-card bg-black/70 p-8 rounded-xl border border-emerald-500/15 transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer text-center">
                  <h2 className="font-georgia text-3xl font-bold text-white mb-6">Información de Contacto</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-white mb-2">Email Principal</h3>
                      <p className="text-silver-100">info@nakamapartners.com</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-white mb-2">Teléfono</h3>
                      <p className="text-silver-100">+34.675.558.429</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-white mb-2">Consultas Legales</h3>
                      <p className="text-silver-100">legal@nakamapartners.com</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-white mb-2">Horario de Atención</h3>
                      <p className="text-silver-100">Lunes a Viernes: 9:00 - 18:00 CET</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-emerald-500/20">
                    <Button 
                      onClick={scheduleCalendly}
                      className="w-full bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Agendar reunión privada
                    </Button>
                  </div>
                </div>
                
                <div className="contact-offices-card bg-black/70 p-8 rounded-xl border border-emerald-500/15 transition-all duration-300 hover:border-emerald-500/25 hover:bg-black/50 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer text-center">
                  <h2 className="font-georgia text-3xl font-bold text-white mb-6">Oficinas</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-white mb-2">Oficina Principal</h3>
                      <p className="text-silver-100">
                        España<br />
                        Pg. de Gràcia, 19, L'Eixample, 08007 Barcelona
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-white mb-2">Oficina Internacional</h3>
                      <p className="text-silver-100">
                        Emiratos Árabes Unidos<br />
                        Dubai Integrated economic Zones Authority<br />
                        Premises DSO-IFZA<br />
                        Building name: Dubai Silicon Oasis
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
                    </div>
        </section>
        
        <Advisors />
      </main>
      <Footer />
      </div>
    </div>
  );
}