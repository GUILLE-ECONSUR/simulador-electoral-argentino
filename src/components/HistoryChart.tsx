"use client";

import { useEffect, useState } from "react";

interface HistoriaPunto {
  yearMonth: string;
  modeloE: number;
  modeloF: number;
  promedio: number;
}

const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatMes(ym: string) {
  const [y, m] = ym.split("-");
  const idx = parseInt(m, 10) - 1;
  return `${MESES[idx] ?? m}-${y.slice(2)}`;
}

const WIDTH = 900;
const HEIGHT = 380;
const MARGIN = { top: 24, right: 24, bottom: 44, left: 46 };

function buildPath(
  puntos: HistoriaPunto[],
  key: "modeloE" | "modeloF" | "promedio",
  xFor: (i: number) => number,
  yFor: (v: number) => number
) {
  return puntos
    .map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(p[key])}`)
    .join(" ");
}

export default function HistoryChart() {
  const [puntos, setPuntos] = useState<HistoriaPunto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/historia?desde=2026-01")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPuntos(data.puntos);
        }
      })
      .catch(() => setError("No se pudo cargar la evolución histórica."));
  }, []);

  if (error) {
    return (
      <p className="mx-auto max-w-5xl px-6 text-sm text-red-500">{error}</p>
    );
  }

  if (!puntos || puntos.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10 text-center">
        <p className="animate-pulse-soft text-sm font-medium text-gris-intenso">
          Cargando evolución histórica…
        </p>
      </div>
    );
  }

  const innerW = WIDTH - MARGIN.left - MARGIN.right;
  const innerH = HEIGHT - MARGIN.top - MARGIN.bottom;

  const xFor = (i: number) =>
    MARGIN.left +
    (puntos.length === 1 ? innerW / 2 : (i / (puntos.length - 1)) * innerW);
  const yFor = (v: number) => MARGIN.top + innerH * (1 - v);

  const pathE = buildPath(puntos, "modeloE", xFor, yFor);
  const pathF = buildPath(puntos, "modeloF", xFor, yFor);

  const gridLevels = [0, 0.25, 0.5, 0.75, 1];

  // Mostrar una etiqueta de mes cada tanto para que no se amontonen
  const labelEvery = Math.max(1, Math.ceil(puntos.length / 8));

  const hover = hoverIdx !== null ? puntos[hoverIdx] : null;

  return (
    <div className="mx-auto max-w-5xl px-6 pb-20">
      <div className="animate-fade-in-up rounded-3xl border border-gris-suave bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-azul-noche sm:text-xl">
              Evolución histórica de la probabilidad de continuidad
            </h2>
            <p className="mt-0.5 text-xs text-gris-intenso sm:text-sm">
              Modelos E y F aplicados a los datos reales de cada mes, desde enero 2026.
            </p>
          </div>
          <div className="mt-3 flex items-center gap-4 sm:mt-0">
            <Legend color="#0033FA" label="Modelo E" />
            <Legend color="#7CA3FF" label="Modelo F" />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full min-w-[560px]"
            role="img"
            aria-label="Gráfico de evolución de probabilidad de continuidad 2026"
          >
            {/* Líneas de referencia horizontales */}
            {gridLevels.map((g) => (
              <g key={g}>
                <line
                  x1={MARGIN.left}
                  x2={WIDTH - MARGIN.right}
                  y1={yFor(g)}
                  y2={yFor(g)}
                  stroke={g === 0.5 ? "#7CA3FF" : "#D5D5D5"}
                  strokeWidth={g === 0.5 ? 1.5 : 1}
                  strokeDasharray={g === 0.5 ? "5 4" : undefined}
                  opacity={g === 0.5 ? 0.7 : 0.6}
                />
                <text
                  x={MARGIN.left - 10}
                  y={yFor(g)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11}
                  fill="#454544"
                >
                  {Math.round(g * 100)}%
                </text>
              </g>
            ))}

            {/* Eje X: meses */}
            {puntos.map((p, i) =>
              i % labelEvery === 0 || i === puntos.length - 1 ? (
                <text
                  key={p.yearMonth}
                  x={xFor(i)}
                  y={HEIGHT - MARGIN.bottom + 20}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#454544"
                >
                  {formatMes(p.yearMonth)}
                </text>
              ) : null
            )}

            {/* Líneas de los modelos */}
            <path d={pathF} fill="none" stroke="#7CA3FF" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
            <path d={pathE} fill="none" stroke="#0033FA" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />

            {/* Puntos */}
            {puntos.map((p, i) => (
              <g key={p.yearMonth}>
                <circle cx={xFor(i)} cy={yFor(p.modeloF)} r={3.5} fill="#7CA3FF" />
                <circle cx={xFor(i)} cy={yFor(p.modeloE)} r={3.5} fill="#0033FA" />
                {/* Área invisible para hover/tap */}
                <rect
                  x={xFor(i) - (innerW / puntos.length) / 2}
                  y={MARGIN.top}
                  width={innerW / puntos.length}
                  height={innerH}
                  fill="transparent"
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  onTouchStart={() => setHoverIdx(i)}
                />
              </g>
            ))}

            {/* Línea vertical + tooltip en hover */}
            {hover && hoverIdx !== null && (
              <g>
                <line
                  x1={xFor(hoverIdx)}
                  x2={xFor(hoverIdx)}
                  y1={MARGIN.top}
                  y2={HEIGHT - MARGIN.bottom}
                  stroke="#011A51"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.4}
                />
              </g>
            )}
          </svg>
        </div>

        {/* Tooltip / resumen del punto seleccionado */}
        <div className="mt-3 flex min-h-[48px] items-center justify-center gap-6 rounded-xl bg-gris-suave/25 px-4 py-3 text-sm">
          {hover ? (
            <>
              <span className="font-bold text-azul-noche">{formatMes(hover.yearMonth)}</span>
              <span className="text-azul-vivido">
                Modelo E: <strong>{(hover.modeloE * 100).toFixed(1)}%</strong>
              </span>
              <span className="text-azul-pastel">
                Modelo F: <strong>{(hover.modeloF * 100).toFixed(1)}%</strong>
              </span>
              <span className="text-gris-intenso">
                Promedio: <strong>{(hover.promedio * 100).toFixed(1)}%</strong>
              </span>
            </>
          ) : (
            <span className="text-xs text-gris-intenso">
              Pasá el mouse (o tocá) sobre el gráfico para ver el detalle de cada mes.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-gris-intenso">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
