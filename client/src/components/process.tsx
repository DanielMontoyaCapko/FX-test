import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default function Process() {
  const directProcess = [
    {
      number: 1,
      title: "Agenda reunión con nuestro equipo",
      description: "Revisión personalizada del producto y del contrato."
    },
    {
      number: 2,
      title: "Validación legal de perfil",
      description: "Compliance y verificación de origen de fondos."
    },
    {
      number: 3,
      title: "Firma digital + pignoración",
      description: "Contrato firmado digitalmente con validez jurídica."
    },
    {
      number: 4,
      title: "Inicio de inversión",
      description: "Activación y acceso al panel de control."
    }
  ];

  const advisorProcess = [
    {
      number: 1,
      title: "Presentación conjunta",
      description: "Reunión con tu asesor de confianza presente."
    },
    {
      number: 2,
      title: "Firma de NDA + documentación",
      description: "Acceso a documentación legal completa."
    },
    {
      number: 3,
      title: "Validación perfil inversor",
      description: "Verificación AML y origen de fondos."
    },
    {
      number: 4,
      title: "Activación de la inversión",
      description: "Firma digital, pignoración y acceso al panel."
    }
  ];

  const scheduleCalendly = () => {
    // In a real implementation, this would open Calendly widget
    console.log("Opening Calendly for scheduling");
  };



  return (
    <section className="py-10 bg-transparent">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-georgia text-4xl md:text-5xl font-bold text-white mb-6">
            Proceso <span className="text-emerald-400">Transparente</span>, Paso a Paso
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Direct Process */}
          <div className="process-card bg-black/70 p-8 rounded-xl border border-silver-500/20 hover:border-[#344e41] transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#344e41]/20 cursor-pointer">
            <h3 className="font-georgia text-2xl font-bold text-white mb-8 text-center">Si llegas directamente</h3>
            
            <div className="space-y-6">
              {directProcess.map((step) => (
                <div key={step.number} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green/20 rounded-full flex items-center justify-center text-green font-bold text-sm flex-shrink-0 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">
                    {step.number}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">{step.title}</h4>
                    <p className="text-silver-100 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={scheduleCalendly}
              className="w-full mt-8 gradient-navy text-white hover:opacity-90"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Agendar reunión
            </Button>
          </div>
          
          {/* Advisor Process */}
          <div className="process-card bg-black/70 p-8 rounded-xl border border-silver-500/20 hover:border-[#344e41] transition-all duration-300 transform hover:scale-500 hover:shadow-lg hover:shadow-[#344e41]/20 cursor-pointer">
            <h3 className="font-georgia text-2xl font-bold text-white mb-8 text-center">Si vienes recomendado por un asesor</h3>
            
            <div className="space-y-6">
              {advisorProcess.map((step) => (
                <div key={step.number} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green/20 rounded-full flex items-center justify-center text-green font-bold text-sm flex-shrink-0 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">
                    {step.number}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">{step.title}</h4>
                    <p className="text-silver-100 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={scheduleCalendly}
              className="w-full mt-8 gradient-navy text-white hover:opacity-90"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Agendar reunión
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
