import { useEffect, useMemo, useState } from "react";
import logoPath from "@assets/Logo-removeBG_1753542032142.png";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const tips = useMemo(
    () => [
      "Inicializando módulos del panel…",
      "Sincronizando métricas en tiempo real…",
      "Optimizando la experiencia…",
      "Preparando recursos visuales…",
      "Comprobando permisos…",
    ],
    []
  );

  // Progreso orgánico
  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setTimeout(onLoadingComplete, 420);
          return 100;
        }
        const remaining = 100 - p;
        const base = Math.max(1, Math.min(6, Math.floor(remaining / 10)));
        const jitter = Math.floor(Math.random() * 3); // 0–2
        return Math.min(p + base + jitter, 100);
      });
    }, 100);
    return () => clearInterval(t);
  }, [onLoadingComplete]);

  // Tips rotando
  useEffect(() => {
    const rot = setInterval(() => setTipIndex((i) => (i + 1) % tips.length), 1200);
    return () => clearInterval(rot);
  }, [tips.length]);

  return (
    <div
      className={[
        "relative min-h-[100svh] overflow-hidden",
        // MISMO FONDO QUE LOGIN (opción 2)
        "bg-gradient-to-br from-black via-[#091611] to-[#0E2A1F]",
        "px-6 md:px-10",
        "flex items-center justify-center",
      ].join(" ")}
    >
      {/* Contenido sin caja, vertical */}
      <div className="w-full max-w-lg text-center">
        {/* Logo grande arriba */}
        <img
          src={logoPath}
          alt="Nakama Partner"
          className="mx-auto w-28 h-28 md:w-36 md:h-36 drop-shadow-[0_0_22px_rgba(16,185,129,0.35)]"
        />

        {/* Marca */}
        <div className="mt-5 space-y-1">
          <h2 className="font-cormorant text-3xl md:text-4xl font-bold text-emerald-50">
            Nakama Partner
          </h2>
          <p className="text-emerald-400 text-sm md:text-base">Portal de Asesores</p>
        </div>

        {/* Subtítulo */}
        <h3 className="mt-7 text-[20px] md:text-[22px] font-semibold text-emerald-50">
          Preparando tu panel
        </h3>
        <p className="text-emerald-200/80 text-[15px]">
          Cargando componentes y recursos necesarios…
        </p>

        {/* Barra de progreso estilo inputs v2 (sin caja) */}
        <div
          className="mt-6 w-full h-[14px] md:h-4 rounded-xl border border-emerald-500/20 bg-emerald-950/40 overflow-hidden mx-auto"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 transition-[width] duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[pulse_1.6s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* Estado y porcentaje */}
        <div className="mt-3 flex items-center justify-between text-left">
          <span className="text-emerald-200/70 text-sm md:text-base">
            {tips[tipIndex]}
          </span>
          <span className="text-emerald-300 font-mono font-semibold tabular-nums text-sm md:text-base">
            {progress}%
          </span>
        </div>

        {/* Dots de actividad */}
        <div className="mt-6 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"
              style={{
                animation: "pulse 1.4s ease-in-out infinite",
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </div>

        {/* Nota legal mínima */}
        <p className="mt-6 text-[12px] text-emerald-200/60">
          Al continuar aceptas los Términos y la Política de Privacidad.
        </p>
      </div>
    </div>
  );
}
