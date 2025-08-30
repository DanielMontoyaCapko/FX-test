import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

import ADCB from "@/assets/ADCB_BANK.png";
import FAB from "@/assets/FAB_BANK.png";
import NBD from "@/assets/NBD_BANK.png";
import DIB from "@/assets/DIB_BANK.png";
import MASHREQ from "@/assets/MASHREQ_BANK.png";
import RAK from "@/assets/RAK_BANK.png";
import dubaiImage from "../../../attached_assets/dubai.webp";

export default function Hero() {
  const [, setLocation] = useLocation();
  const goToContact = () => setLocation("/contacto");

  // Orden: ADCB → FAB → NBD → DIB → MASHREQ → RAK
  const logos = useMemo(() => [ADCB, FAB, NBD, DIB, MASHREQ, RAK], []);

  // Refs para medir el ancho del grupo A y ajustar la animación/viewport
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [groupW, setGroupW] = useState(0);

  useEffect(() => {
    const update = () => {
      if (!trackRef.current || !groupRef.current) return;

      const half = groupRef.current.getBoundingClientRect().width; // ancho del grupo A
      setGroupW(half);

      // Velocidad aumentada significativamente: de 50 px/s a 100 px/s
      const speed = 100;
      const dur = Math.max(half / speed, 12);

      trackRef.current.style.setProperty("--half", `${half}px`);
      trackRef.current.style.setProperty("--dur", `${dur}s`);
    };

    const ro = new ResizeObserver(update);
    if (groupRef.current) ro.observe(groupRef.current);
    update();

    // Recalcular cuando carguen las imágenes
    groupRef.current?.querySelectorAll("img")?.forEach((img) => {
      const el = img as HTMLImageElement;
      if (!el.complete) el.addEventListener("load", update, { once: true });
    });

    return () => ro.disconnect();
  }, []);

  // Tamaños: primeros 3 logos más grandes; últimos 3 (nuevos) un poco más pequeños
  const sizeOld = "h-12 md:h-[3.75rem] lg:h-[4.5rem]";            // ~48 / 60 / 72 px
  const sizeNew = "h-[2.375rem] md:h-[3rem] lg:h-[3.625rem]";     // ~38 / 48 / 58 px

  return (
    <>
      {/* Keyframes del carrusel */}
      <style>{`
        @keyframes marqueeLoop {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(var(--half, 0px) * -1)); }
        }
      `}</style>

      {/* Sección Principal con imagen de fondo (recuadrada en rojo) */}
      <section id="inicio" className="relative min-h-[90svh] flex items-center justify-center">
        {/* Imagen de fondo con opacidad 30% */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-[0.30]"
          style={{ backgroundImage: `url(${dubaiImage})` }}
        />
        
        {/* Contenido principal */}
        <div className="container mx-auto px-6 text-center relative z-10">
          {/* Título → Subtítulo → Descripción */}
          <h1 className="font-georgia text-5xl md:text-7xl font-bold text-green tracking-tight mb-3 text-shadow">
            <span className="block md:hidden">
              <span className="block text-center">9% Fijo Anual</span>
            </span>
            <span className="hidden md:block">9% Fijo Anual</span>
          </h1>

          <h2 className="text-2xl md:text-3xl text-silver-100/95 font-semibold leading-snug mb-4">
            <span className="block md:hidden">
              <span className="block max-w-[300px] mx-auto">Capital protegido por</span>
              <span className="block max-w-[240px] mx-auto">contrato bancario</span>
              <span className="block max-w-[160px] mx-auto">pignorado</span>
            </span>
            <span className="hidden md:block">Capital protegido por contrato bancario pignorado</span>
          </h2>

          <p className="text-base md:text-lg text-silver-100/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Producto exclusivo para perfiles conservadores, sin exposición al mercado. Gestionado con estructuras
            bancarias, firmado digitalmente y auditado legalmente.
          </p>

          <Button
            onClick={goToContact}
            className="bg-green text-black px-12 py-4 text-xl font-bold hover:bg-green/90 transition-colors h-auto"
          >
            Quiero más información
          </Button>
        </div>
      </section>

      {/* Métricas - Fuera del contenedor principal */}
      <section className="pt-16 pb-8 bg-transparent">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-black/30 border border-transparent transition-all duration-300 hover:border-green-500 hover:bg-black/50 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer">
              <div className="text-3xl font-bold text-green mb-2">9%</div>
              <div className="text-silver-100">Rentabilidad Fija Anual</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-black/30 border border-transparent transition-all duration-300 hover:border-green-500 hover:bg-black/50 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer">
              <div className="text-3xl font-bold text-green mb-2">100%</div>
              <div className="text-silver-100">Capital Protegido</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-black/30 border border-transparent transition-all duration-300 hover:border-green-500 hover:bg-black/50 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer">
              <div className="text-3xl font-bold text-green mb-2">0%</div>
              <div className="text-silver-100">Sin Riesgo de Mercado</div>
            </div>
          </div>
        </div>
      </section>

      {/* Carrusel con máscara (fades que respetan el fondo) */}
      <section className="pt-8 pb-12 bg-transparent">
        <div className="container mx-auto px-6">
          <div
            className="relative mt-14 mx-auto"
            style={{ width: groupW ? `min(100%, ${groupW}px)` : undefined }}
          >
            <div
              className="overflow-hidden"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0, black 10%, black 90%, transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0, black 10%, black 90%, transparent 100%)",
              }}
            >
              {/* Track animado */}
              <div
                ref={trackRef}
                style={{ animation: "marqueeLoop var(--dur, 28s) linear infinite" }}
                className="flex w-max will-change-transform"
              >
                {/* Grupo A */}
                <div
                  ref={groupRef}
                  className="flex items-center gap-10 md:gap-14 shrink-0 pr-10 md:pr-14"
                >
                  {logos.map((src, i) => {
                    const isNew = i >= 3;
                    return (
                      <img
                        key={`a-${i}`}
                        src={src}
                        alt={`logo-${i + 1}`}
                        className={`${isNew ? sizeNew : sizeOld} block flex-none opacity-45 hover:opacity-70 transition-opacity duration-300 object-contain grayscale select-none`}
                        draggable={false}
                      />
                    );
                  })}
                </div>

                {/* Grupo B (clon) */}
                <div className="flex items-center gap-10 md:gap-14 shrink-0" aria-hidden="true">
                  {logos.map((src, i) => {
                    const isNew = i >= 3;
                    return (
                      <img
                        key={`b-${i}`}
                        src={src}
                        alt=""
                        className={`${isNew ? sizeNew : sizeOld} block flex-none opacity-45 object-contain grayscale select-none`}
                        draggable={false}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}