import { Building, TrendingUp, Coins, Link, Brain } from "lucide-react";
import GrowthChart from "./growth-chart";
import dubaiImage from "../../../attached_assets/dubai.webp";
import etfsImage from "../../../attached_assets/etfs.jpg";
import materiasPrimasImage from "../../../attached_assets/materias primas.webp";
import activosDigitalesImage from "../../../attached_assets/activos digitales.webp";
import tradingImage from "../../../attached_assets/trading.jpg";

export default function Strategy() {
  const strategies = [
    {
      icon: Building,
      title: "Real Estate Institucional en Dubái",
      description: "Alineado con el Plan Urbanístico 2040 (+30% crecimiento proyectado). Precio medio por m² aún 60-70% por debajo de Londres o Nueva York."
    },
    {
      icon: TrendingUp,
      title: "ETFs y Acciones de Asia Emergente",
      description: "Mercados sólidos con crecimiento estructural y baja correlación con Occidente."
    },
    {
      icon: Coins,
      title: "Materias Primas: Oro, Plata y Petróleo",
      description: "Valor refugio, cobertura frente a inflación y activos geopolíticos."
    },
    {
      icon: Link,
      title: "Activos Digitales Regulados",
      description: "RWA, Tokenización, DeFi. Participamos solo en infraestructuras legales y auditadas del sector blockchain."
    },
    {
      icon: Brain,
      title: "Trading Algorítmico Propio, Auditado",
      description: "Optimización de carteras con inteligencia artificial, basada en parámetros matemáticos y control de drawdown.",
      colSpan: true
    }
  ];

  return (
    <section id="producto" className="py-10 bg-transparent">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-georgia text-4xl md:text-5xl font-bold text-white mb-6">
            Cómo Conseguimos el <span className="text-emerald-400">9% Fijo Anual</span>
          </h2>
          <p className="text-xl text-silver-100 max-w-3xl mx-auto">
            Una cartera permanente, sin improvisaciones. Nuestra rentabilidad no depende de predicciones, 
            sino de diversificación estructural:
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {strategies.map((strategy, index) => (
            <div 
              key={index} 
              className={`strategy-card bg-black/70 p-8 rounded-xl border border-silver-500/20 hover:border-[#344e41] transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#344e41]/20 cursor-pointer relative overflow-hidden ${strategy.colSpan ? 'md:col-span-2' : ''}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Imágenes de fondo para las tarjetas */}
              {index === 0 && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-15"
                  style={{ backgroundImage: `url(${dubaiImage})` }}
                />
              )}
              {index === 1 && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-15"
                  style={{ backgroundImage: `url(${etfsImage})` }}
                />
              )}
              {index === 2 && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-15"
                  style={{ backgroundImage: `url(${materiasPrimasImage})` }}
                />
              )}
              {index === 3 && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-15"
                  style={{ backgroundImage: `url(${activosDigitalesImage})` }}
                />
              )}
              {index === 4 && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-15"
                  style={{ backgroundImage: `url(${tradingImage})` }}
                />
              )}
              {/* Contenido de la tarjeta */}
              <div className="relative z-10">
                {index <= 4 ? (
                  // Estilo especial para tarjetas con imagen de fondo (índices 0, 1, 2, 3, 4)
                  <div className="text-center">
                    <h3 className="font-georgia text-2xl font-semibold text-white mb-4">{strategy.title}</h3>
                    <p className="text-silver-100 text-lg leading-relaxed">{strategy.description}</p>
                  </div>
                ) : (
                  // Estilo normal para las otras tarjetas (si las hubiera)
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green/20 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-[#344e41]/30">
                      <strategy.icon className="text-green w-6 h-6 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    </div>
                    <div>
                      <h3 className="font-georgia text-xl font-semibold text-white mb-3">{strategy.title}</h3>
                      <p className="text-silver-100">{strategy.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-lg text-silver-100 max-w-3xl mx-auto mb-12">
            Esta combinación permite garantizar el 9% sin comprometer el capital. 
            Todo bajo un modelo profesional, permanente y sin especulación.
          </p>
        </div>

        {/* Growth Chart */}
        <div className="max-w-4xl mx-auto mt-16">
          <GrowthChart 
            initialAmount={100000}
            years={10}
            rate={0.09}
            showTitle={true}
          />
        </div>
      </div>
    </section>
  );
}
