"use client";

interface VariableCheck {
  variable: string;
  valor: number;
  unidad: string;
  tendenciaIndividual: "oficialismo" | "oposicion";
  conflicto: boolean;
}

function formatValor(v: number, unidad: string): string {
  if (unidad === "pts") return v.toFixed(2);
  if (unidad === "índice") return v.toFixed(1);
  return Math.round(v).toLocaleString("es-AR");
}

export default function WarningBanner({
  chequeos,
  ganadorFinal,
}: {
  chequeos: VariableCheck[];
  ganadorFinal: "oficialismo" | "oposicion";
}) {
  const conflictivos = chequeos.filter((c) => c.conflicto);
  if (conflictivos.length === 0) return null;

  const contrario = ganadorFinal === "oficialismo" ? "la oposición" : "el oficialismo";

  return (
    <div className="animate-fade-in-up mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">
      <div className="flex gap-3">
        <WarningIcon />
        <div>
          <h4 className="text-sm font-bold text-amber-800">
            Ojo con la lectura aislada de algunas variables
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-amber-800/90">
            El resultado final combina las tres variables a la vez (con sus
            correlaciones históricas), pero mirada en soledad, alguna de las
            que ingresaste apunta para el otro lado:
          </p>
          <ul className="mt-3 space-y-1.5">
            {conflictivos.map((c) => (
              <li
                key={c.variable}
                className="flex items-start gap-2 text-xs text-amber-900"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>
                  <strong>{c.variable}</strong> ({formatValor(c.valor, c.unidad)}
                  {c.unidad !== "índice" && c.unidad !== "pts" ? ` ${c.unidad}` : ""}
                  ) está, por sí sola, más cerca del promedio histórico de los
                  casos donde ganó {contrario}.
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] italic text-amber-800/75">
            No es un error del simulador: es lo esperable en un modelo que
            pondera varias variables juntas. Tomalo como una señal para mirar
            el detalle antes de sacar una conclusión rápida.
          </p>
        </div>
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
