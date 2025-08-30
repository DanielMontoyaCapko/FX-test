import { useEffect, useRef, useState } from "react";

export default function Downloads() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionHeight = rect.height;
        const windowHeight = window.innerHeight;
        
        // Detectar si la sección es visible
        if (sectionTop < windowHeight && sectionTop > -sectionHeight) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    // Función optimizada para throttling del scroll
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleResize = () => {
      // Recalcular al cambiar el tamaño de la ventana
      setTimeout(handleScroll, 100);
    };

    // Agregar event listeners con throttling
    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Llamar una vez al montar
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="pt-6 pb-10 bg-transparent">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-georgia text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="block md:hidden">
              <span className="block max-w-[280px] mx-auto">¿Cómo constituyo mi depósito bancario</span>
              <span className="block max-w-[200px] mx-auto">remunerado al <span className="text-green">9%</span></span>
            </span>
            <span className="hidden md:block">
              <span className="block max-w-[600px] mx-auto">¿Cómo constituyo mi depósito bancario</span>
              <span className="block max-w-[400px] mx-auto">remunerado al <span className="text-green">9%</span></span>
            </span>
          </h2>
          <p className="text-xl text-silver-100 max-w-3xl mx-auto">
            <span className="block md:hidden max-w-[300px] mx-auto">
              <span className="block">Accede a la documentación clave para</span>
              <span className="block">entender la solidez y transparencia</span>
              <span className="block">de Nakama&Partners.</span>
            </span>
            <span className="hidden md:block">
              Accede a la documentación clave para entender la solidez y transparencia de Nakama&Partners.
            </span>
          </p>
        </div>
        
        {/* Proceso paso a paso - 9 tarjetas alternadas con línea conectora */}
        <div 
          ref={sectionRef} 
          className={`relative max-w-6xl mx-auto mb-12 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Línea conectora vertical fija con efecto neón */}
          <div className={`absolute left-1/2 top-0 bottom-0 w-0.5 transform -translate-x-1/2 hidden lg:block transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Línea neón fija y completa */}
            <div 
              className="w-full h-full bg-gradient-to-b from-green-400 via-green-300 to-green-500"
              style={{ 
                boxShadow: `0 0 20px rgba(34, 197, 94, 0.6), 0 0 40px rgba(34, 197, 94, 0.3), 0 0 60px rgba(34, 197, 94, 0.1)`,
                filter: 'brightness(1.2) saturate(1.2)'
              }}
            ></div>
            
            {/* Efecto de brillo adicional en la línea */}
            <div 
              className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-300 via-green-400 to-green-300 opacity-60"
              style={{ 
                filter: 'blur(1px)'
              }}
            ></div>
          </div>
          
          {/* Tarjeta 1 - Izquierda */}
          <div className="relative mb-16 lg:mb-20">
            <div className="lg:w-5/12 lg:mr-auto">
              <div className="bg-black/70 p-8 rounded-2xl border border-silver-500/20 hover:border-green-500 hover:bg-black/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-green rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">01</span>
                </div>
                <h3 className="font-georgia text-2xl font-semibold text-white mb-4 mt-4">Contacto</h3>
                <p className="text-silver-100 text-base leading-relaxed">Recibimos y entendemos tu caso de manera personal</p>
              </div>
            </div>
          </div>

          {/* Tarjeta 2 - Derecha */}
          <div className="relative mb-16 lg:mb-20">
            <div className="lg:w-5/12 lg:ml-auto">
              <div className="bg-black/70 p-8 rounded-2xl border border-silver-500/20 hover:border-green-500 hover:bg-black/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-green rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">02</span>
                </div>
                <h3 className="font-georgia text-2xl font-semibold text-white mb-4 mt-4">Registro</h3>
                <p className="text-silver-100 text-base leading-relaxed">Nuestro Asesor te dará acceso a nuestra dashboard privado</p>
              </div>
            </div>
          </div>

          {/* Tarjeta 3 - Izquierda */}
          <div className="relative mb-16 lg:mb-20">
            <div className="lg:w-5/12 lg:mr-auto">
              <div className="bg-black/70 p-8 rounded-2xl border border-silver-500/20 hover:border-green-500 hover:bg-black/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-green rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">03</span>
                </div>
                <h3 className="font-georgia text-2xl font-semibold text-white mb-4 mt-4">Alta de KYC</h3>
                <p className="text-silver-100 text-base leading-relaxed">Validas tus datos</p>
              </div>
            </div>
          </div>

          {/* Tarjeta 4 - Derecha */}
          <div className="relative mb-16 lg:mb-20">
            <div className="lg:w-5/12 lg:ml-auto">
              <div className="bg-black/70 p-8 rounded-2xl border border-silver-500/20 hover:border-green-500 hover:bg-black/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-green rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">04</span>
                </div>
                <h3 className="font-georgia text-2xl font-semibold text-white mb-4 mt-4">Alta de Idoneidad</h3>
                <p className="text-silver-100 text-base leading-relaxed">Rellenas los cuestionarios</p>
              </div>
            </div>
          </div>

          {/* Tarjeta 5 - Izquierda */}
          <div className="relative mb-16 lg:mb-20">
            <div className="lg:w-5/12 lg:mr-auto">
              <div className="bg-black/70 p-8 rounded-2xl border border-silver-500/20 hover:border-green-500 hover:bg-black/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-green rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">05</span>
                </div>
                <h3 className="font-georgia text-2xl font-semibold text-white mb-4 mt-4">Firma de Contrato</h3>
                <p className="text-silver-100 text-base leading-relaxed">Para conocer el detalle y selección del periodo</p>
              </div>
            </div>
          </div>
          
          {/* Tarjeta 6 - Derecha */}
          <div className="relative mb-16 lg:mb-20">
            <div className="lg:w-5/12 lg:ml-auto">
              <div className="bg-black/70 p-8 rounded-2xl border border-silver-500/20 hover:border-green-500 hover:bg-black/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-green rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">06</span>
                </div>
                <h3 className="font-georgia text-2xl font-semibold text-white mb-4 mt-4">Realiza el Depósito</h3>
                <p className="text-silver-100 text-base leading-relaxed">Realiza la transferencia con el importe seleccionado</p>
              </div>
            </div>
            </div>
            
          {/* Tarjeta 7 - Izquierda */}
          <div className="relative mb-16 lg:mb-20">
            <div className="lg:w-5/12 lg:mr-auto">
              <div className="bg-black/70 p-8 rounded-2xl border border-silver-500/20 hover:border-green-500 hover:bg-black/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-green rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">07</span>
                </div>
                <h3 className="font-georgia text-2xl font-semibold text-white mb-4 mt-4">Firma del Contrato de Depósito</h3>
                <p className="text-silver-100 text-base leading-relaxed">Firma su depósito nominal e inicia con su remuneración</p>
              </div>
            </div>
            </div>
            
          {/* Tarjeta 8 - Derecha */}
          <div className="relative mb-16 lg:mb-20">
            <div className="lg:w-5/12 lg:ml-auto">
              <div className="bg-black/70 p-8 rounded-2xl border border-silver-500/20 hover:border-green-500 hover:bg-black/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-green rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">08</span>
                </div>
                <h3 className="font-georgia text-2xl font-semibold text-white mb-4 mt-4">Obtención del Interés</h3>
                <p className="text-silver-100 text-base leading-relaxed">Liquidación de intereses trimestrales</p>
              </div>
            </div>
          </div>

          {/* Tarjeta 9 - Izquierda */}
          <div className="relative mb-16 lg:mb-20">
            <div className="lg:w-5/12 lg:mr-auto">
              <div className="bg-black/70 p-8 rounded-2xl border border-silver-500/20 hover:border-green-500 hover:bg-black/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-green rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">09</span>
                </div>
                <h3 className="font-georgia text-2xl font-semibold text-white mb-4 mt-4">Finalización del Depósito</h3>
                <p className="text-silver-100 text-base leading-relaxed">Extinción del préstamo y devolución del depósito</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
