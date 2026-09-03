"use client";

import { useEffect, useState } from "react";
import ResultCard from "./ResultCard";

interface SimulacionResultado {
  modeloE: { pOficialismo: number; pOposicion: number };
  modeloF: { pOficialismo: number; pOposicion: number };
  promedio: { pOficialismo: number; pOposicion: number };
  inputs: {
    riesgoPais: number;
    spreadEstimado: number;
    tipoCambioNominal: number;
    tcrEstimado: number;
    icgUsado: number;
    embiLatinoUsado: number;
    fechaUltimoDato: string;
  };
}

export default function SimulatorForm() {
  const [riesgoPais, setRiesgoPais] = useState<string>("");
  const [tcn, setTcn] = useState<string>("");
  const [resultado, setResultado] = useState<SimulacionResultado | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carga inicial: trae los valores más recientes de la serie como default
  useEffect(() => {
    fetch("/api/simulate")
      .then((r) => r.json())
      .then((data: SimulacionResultado) => {
        if (data.inputs) {
          setRiesgoPais(String(Math.round(data.inputs.riesgoPais)));
          setTcn(String(Math.round(data.inputs.tipoCambioNominal)));
          setResultado(data);
        }
      })
      .catch(() => setError("No se pudo cargar el archivo de datos."))
      .finally(() => setInitialLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riesgoPais: riesgoPais === "" ? null : Number(riesgoPais),
          tipoCambioNominal: tcn === "" ? null : Number(tcn),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ocurrió un error al calcular.");
        return;
      }
      setResultado(data);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto -mt-16 max-w-5xl px-6 pb-20 sm:-mt-24">
      {/* Card del formulario */}
      <form
        onSubmit={handleSubmit}
        className="glass-card animate-fade-in-up rounded-3xl p-6 shadow-card sm:p-10"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="riesgoPais" className="label-field">
              Riesgo país (puntos básicos)
            </label>
            <div className="relative">
              <input
                id="riesgoPais"
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                placeholder="Ej: 505"
                className="input-field pr-14"
                value={riesgoPais}
                onChange={(e) => setRiesgoPais(e.target.value)}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gris-intenso">
                pb
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="tcn" className="label-field">
              Tipo de cambio nominal (dólar blue)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gris-intenso">
                $
              </span>
              <input
                id="tcn"
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                placeholder="Ej: 1500"
                className="input-field pl-9"
                value={tcn}
                onChange={(e) => setTcn(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-end">
          <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
            {loading ? (
              <>
                <Spinner /> Calculando…
              </>
            ) : (
              <>Calcular probabilidad</>
            )}
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}
      </form>

      {/* Resultados */}
      {initialLoading ? (
        <div className="mt-10 flex justify-center">
          <p className="animate-pulse-soft text-sm font-medium text-gris-intenso">
            Cargando datos del modelo…
          </p>
        </div>
      ) : (
        resultado && (
          <div className="mt-10">
            <ResultCard
              title="Promedio de ambos modelos"
              subtitle="Resultado principal del simulador"
              pOficialismo={resultado.promedio.pOficialismo}
              pOposicion={resultado.promedio.pOposicion}
              highlight
            />
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <ResultCard
                title="Modelo E"
                subtitle="Riesgo país + ICG + TCR"
                pOficialismo={resultado.modeloE.pOficialismo}
                pOposicion={resultado.modeloE.pOposicion}
              />
              <ResultCard
                title="Modelo F"
                subtitle="Spread regional + ICG + TCR"
                pOficialismo={resultado.modeloF.pOficialismo}
                pOposicion={resultado.modeloF.pOposicion}
              />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 rounded-2xl border border-gris-suave bg-white p-5 text-sm sm:grid-cols-4">
              <InfoStat label="Spread estimado" value={`${resultado.inputs.spreadEstimado.toFixed(0)} pb`} />
              <InfoStat label="TCR estimado" value={resultado.inputs.tcrEstimado.toFixed(1)} />
              <InfoStat label="ICG usado" value={resultado.inputs.icgUsado.toFixed(2)} />
              <InfoStat label="EMBI LATINO" value={`${resultado.inputs.embiLatinoUsado.toFixed(0)} pb`} />
            </div>
          </div>
        )
      )}
    </div>
  );
}

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gris-intenso">
        {label}
      </p>
      <p className="mt-1 text-base font-bold text-azul-noche">{value}</p>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

