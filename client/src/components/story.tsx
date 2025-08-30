import { Button } from "@/components/ui/button";
import { Users, Calendar } from "lucide-react";
import { useLocation } from "wouter";

export default function Story() {
  const [, setLocation] = useLocation();
  
  const scheduleCalendly = () => {
    // In a real implementation, this would open Calendly widget
    console.log("Opening Calendly for scheduling");
  };

  return (
    <section id="nosotros" className="py-10 bg-transparent">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-georgia text-4xl md:text-5xl font-bold text-white mb-6">
              Nuestra Historia, Nuestro <span className="text-green">Compromiso</span>:<br />
              Proteger Tu Patrimonio
            </h2>
          </div>
          
          <div className="bg-black/70 rounded-2xl border border-silver-500/20 p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                <h3 className="font-georgia text-2xl font-bold text-white mb-4">
                  Nuestro Compromiso con el Crecimiento Patrimonial
                </h3>
                <p className="text-silver-100 mb-6 leading-relaxed">
                  En Nakama creemos que tenemos la obligación de hacer crecer nuestro patrimonio, tanto a nivel personal como empresarial, como una responsabilidad social individual y colectiva. El patrimonio no es solo capital: es el reflejo de años de esfuerzo, disciplina y visión de futuro.
                  <br /><br />
                  Tras años de preparación y experiencia hemos comprendido que los verdaderos límites no están en el mercado ni en la economía global, sino en nuestro interior. La pregunta clave fue: ¿cómo proteger nuestro patrimonio frente a la inflación y, al mismo tiempo, hacerlo crecer?
                  <br /><br />
                  La respuesta surgió al combinar tecnología, como herramienta de transparencia y eficiencia, con una proyección internacional que permite diversificación y seguridad. Así nació Nakama, un espacio donde el ahorro se convierte en una palanca de crecimiento con dos prioridades esenciales: rentabilidad real para incrementar el patrimonio y seguridad para proteger lo que tanto esfuerzo costó conseguir.
                  <br /><br />
                  Porque gestionar bien el dinero no es solo una decisión financiera, sino un acto de dignidad y responsabilidad con uno mismo y con la sociedad.
                </p>
                <div className="flex justify-center md:justify-start">
                  <Button 
                    onClick={scheduleCalendly}
                    className="gradient-navy px-6 py-3 text-white hover:opacity-90"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar reunión
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-48 h-48 bg-green/20 rounded-lg mx-auto flex items-center justify-center">
                  <Users className="text-6xl text-green w-24 h-24" />
                </div>
                <p className="text-sm text-silver-100 mt-4">Raúl y Xavi - Fundadores de Nakama&Partners</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
