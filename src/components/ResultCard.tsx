"use client";

import ProbabilityGauge from "./ProbabilityGauge";

interface ResultCardProps {
  title: string;
  subtitle: string;
  pOficialismo: number;
  pOposicion: number;
  highlight?: boolean;
}

export default function ResultCard({
  title,
  subtitle,
  pOficialismo,
  pOposicion,
  highlight = false,
}: ResultCardProps) {
  const oficialismoGana = pOficialismo >= pOposicion;

  return (
    <div
      className={`animate-fade-in-up rounded-2xl border p-6 shadow-card transition ${
        highlight
          ? "border-azul-vivido/40 bg-gradient-azul-suave text-white"
          : "border-gris-suave bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3
            className={`text-lg font-bold ${
              highlight ? "text-white" : "text-azul-noche"
            }`}
          >
            {title}
          </h3>
          <p
            className={`mt-0.5 text-xs ${
              highlight ? "text-white/75" : "text-gris-intenso"
            }`}
          >
            {subtitle}
          </p>
        </div>
        <span
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${
            highlight
              ? "bg-white/20 text-white"
              : oficialismoGana
              ? "bg-azul-vivido/10 text-azul-vivido"
              : "bg-gris-intenso/10 text-gris-intenso"
          }`}
        >
          {oficialismoGana ? "Gana oficialismo" : "Gana oposición"}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-6">
        <ProbabilityGauge
          value={pOficialismo}
          color={highlight ? "#FFFFFF" : "#0033FA"}
          trackColor={highlight ? "rgba(255,255,255,0.3)" : "#D5D5D5"}
        />
        <div className="flex-1 space-y-2">
          <div>
            <div
              className={`mb-1 flex justify-between text-xs font-semibold ${
                highlight ? "text-white/80" : "text-gris-intenso"
              }`}
            >
              <span>Oficialismo</span>
              <span>{(pOficialismo * 100).toFixed(1)}%</span>
            </div>
            <div
              className={`h-2 w-full overflow-hidden rounded-full ${
                highlight ? "bg-white/25" : "bg-gris-suave"
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  highlight ? "bg-white" : "bg-azul-vivido"
                }`}
                style={{ width: `${pOficialismo * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div
              className={`mb-1 flex justify-between text-xs font-semibold ${
                highlight ? "text-white/80" : "text-gris-intenso"
              }`}
            >
              <span>Oposición</span>
              <span>{(pOposicion * 100).toFixed(1)}%</span>
            </div>
            <div
              className={`h-2 w-full overflow-hidden rounded-full ${
                highlight ? "bg-white/25" : "bg-gris-suave"
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  highlight ? "bg-azul-noche/60" : "bg-gris-intenso"
                }`}
                style={{ width: `${pOposicion * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
