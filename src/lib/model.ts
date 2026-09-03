import * as XLSX from "xlsx";
import fs from "node:fs";
import path from "node:path";
import { classify, covMatrix3, mean, type Vec3, type Mat3 } from "./stats";

export interface SerieRow {
  yearMonth: string;
  presidencia: string;
  grupo: "S1" | "S2" | "";
  embiArgentina: number;
  embiLatino: number;
  icg: number;
  tcnBlue: number;
  ipcIndice: number;
  tcrBlue: number;
}

export interface ModeloResultado {
  pOficialismo: number; // P(S1) = P(continuidad / oficialismo)
  pOposicion: number; // P(S2)
}

export interface VariableCheck {
  variable: string;
  valor: number;
  unidad: string;
  tendenciaIndividual: "oficialismo" | "oposicion";
  conflicto: boolean;
}

export interface SimulacionResultado {
  modeloE: ModeloResultado;
  modeloF: ModeloResultado;
  promedio: ModeloResultado;
  chequeos: VariableCheck[];
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

export interface HistoriaPunto {
  yearMonth: string;
  modeloE: number; // P(oficialismo)
  modeloF: number;
  promedio: number;
}

interface ModelParams {
  meanS1: Vec3;
  covS1: Mat3;
  meanS2: Vec3;
  covS2: Mat3;
}

interface ModelosParams {
  E: ModelParams;
  F: ModelParams;
}

const DATA_PATH = path.join(process.cwd(), "data", "serie_modelo.xlsx");

let cachedRows: SerieRow[] | null = null;
let cachedMtimeMs = 0;

/** Lee y parsea el Excel de datos. Cachea en memoria hasta que el archivo cambie. */
export function loadSerie(): SerieRow[] {
  const stat = fs.statSync(DATA_PATH);
  if (cachedRows && stat.mtimeMs === cachedMtimeMs) {
    return cachedRows;
  }

  const buf = fs.readFileSync(DATA_PATH);
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
  });

  const rows: SerieRow[] = raw
    .map((r) => ({
      yearMonth: String(r["YearMonth"] ?? ""),
      presidencia: String(r["Presidencia"] ?? ""),
      grupo: (r["Grupo"] as "S1" | "S2" | "") ?? "",
      embiArgentina: Number(r["EMBI_Argentina"]),
      embiLatino: Number(r["EMBI_LATINO"]),
      icg: Number(r["ICG"]),
      tcnBlue: Number(r["TCN_blue"]),
      ipcIndice: Number(r["IPC_indice"]),
      tcrBlue: Number(r["TCR_blue"]),
    }))
    .filter(
      (r) =>
        r.yearMonth &&
        Number.isFinite(r.embiArgentina) &&
        Number.isFinite(r.icg) &&
        Number.isFinite(r.tcrBlue)
    )
    .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));

  cachedRows = rows;
  cachedMtimeMs = stat.mtimeMs;
  return rows;
}

/** Convierte un tipo de cambio nominal nuevo a TCR-blue usando la misma base que la serie histórica. */
function tcnToTcr(tcnNuevo: number, ultimaFila: SerieRow): number {
  return tcnNuevo * (ultimaFila.tcrBlue / ultimaFila.tcnBlue);
}

/** Construye medias y matrices de covarianza S1/S2 para los Modelos E y F a partir de toda la serie. */
export function buildModelParams(rows: SerieRow[]): ModelosParams {
  const s1 = rows.filter((r) => r.grupo === "S1");
  const s2 = rows.filter((r) => r.grupo === "S2");

  const s1Icg = s1.map((r) => r.icg);
  const s1Tcr = s1.map((r) => r.tcrBlue);
  const s2Icg = s2.map((r) => r.icg);
  const s2Tcr = s2.map((r) => r.tcrBlue);

  // Modelo E: EMBI + ICG + TCR
  const s1Embi = s1.map((r) => r.embiArgentina);
  const s2Embi = s2.map((r) => r.embiArgentina);
  const E: ModelParams = {
    meanS1: [mean(s1Embi), mean(s1Icg), mean(s1Tcr)],
    covS1: covMatrix3(s1Embi, s1Icg, s1Tcr),
    meanS2: [mean(s2Embi), mean(s2Icg), mean(s2Tcr)],
    covS2: covMatrix3(s2Embi, s2Icg, s2Tcr),
  };

  // Modelo F: Spread + ICG + TCR
  const s1Spread = s1.map((r) => r.embiArgentina - r.embiLatino);
  const s2Spread = s2.map((r) => r.embiArgentina - r.embiLatino);
  const F: ModelParams = {
    meanS1: [mean(s1Spread), mean(s1Icg), mean(s1Tcr)],
    covS1: covMatrix3(s1Spread, s1Icg, s1Tcr),
    meanS2: [mean(s2Spread), mean(s2Icg), mean(s2Tcr)],
    covS2: covMatrix3(s2Spread, s2Icg, s2Tcr),
  };

  return { E, F };
}

function classifyModel(x: Vec3, p: ModelParams) {
  return classify(x, p.meanS1, p.covS1, p.meanS2, p.covS2);
}

/**
 * Compara un valor contra el punto medio de las medias históricas de S1 y S2
 * para UNA sola variable (sin considerar covarianza con las demás), y dice de
 * qué lado del "promedio de cada bando" cae. Es una lectura simple, no la que
 * usa el modelo — sirve para detectar cuando el dato ingresado, mirado solo,
 * apunta para el lado contrario al resultado final del clasificador conjunto.
 */
function univariateLeaning(
  value: number,
  meanS1: number,
  meanS2: number
): "oficialismo" | "oposicion" {
  const midpoint = (meanS1 + meanS2) / 2;
  const s1EsMasAlto = meanS1 > meanS2;
  const estaArriba = value > midpoint;
  if (s1EsMasAlto) {
    return estaArriba ? "oficialismo" : "oposicion";
  }
  return estaArriba ? "oposicion" : "oficialismo";
}

export function simular(
  riesgoPaisPb: number | null,
  tipoCambioNominal: number | null
): SimulacionResultado {
  const rows = loadSerie();
  const ultima = rows[rows.length - 1];
  const params = buildModelParams(rows);

  const icgUsado = ultima.icg;
  const embiLatinoUsado = ultima.embiLatino;

  const embi = riesgoPaisPb ?? ultima.embiArgentina;
  const tcn = tipoCambioNominal ?? ultima.tcnBlue;
  const tcr = tcnToTcr(tcn, ultima);
  const spread = embi - embiLatinoUsado;

  const resE = classifyModel([embi, icgUsado, tcr], params.E);
  const resF = classifyModel([spread, icgUsado, tcr], params.F);

  const promedio = {
    pOficialismo: (resE.pS1 + resF.pS1) / 2,
    pOposicion: (resE.pS2 + resF.pS2) / 2,
  };

  const ganadorFinal: "oficialismo" | "oposicion" =
    promedio.pOficialismo >= 0.5 ? "oficialismo" : "oposicion";

  const chequeosBase: Omit<VariableCheck, "conflicto">[] = [
    {
      variable: "Riesgo país (EMBI)",
      valor: embi,
      unidad: "pb",
      tendenciaIndividual: univariateLeaning(
        embi,
        params.E.meanS1[0],
        params.E.meanS2[0]
      ),
    },
    {
      variable: "Spread vs. región (LATAM)",
      valor: spread,
      unidad: "pb",
      tendenciaIndividual: univariateLeaning(
        spread,
        params.F.meanS1[0],
        params.F.meanS2[0]
      ),
    },
    {
      variable: "ICG (confianza en el gobierno)",
      valor: icgUsado,
      unidad: "pts",
      tendenciaIndividual: univariateLeaning(
        icgUsado,
        params.E.meanS1[1],
        params.E.meanS2[1]
      ),
    },
    {
      variable: "Tipo de cambio real (TCR)",
      valor: tcr,
      unidad: "índice",
      tendenciaIndividual: univariateLeaning(
        tcr,
        params.E.meanS1[2],
        params.E.meanS2[2]
      ),
    },
  ];

  const chequeos: VariableCheck[] = chequeosBase.map((c) => ({
    ...c,
    conflicto: c.tendenciaIndividual !== ganadorFinal,
  }));

  return {
    modeloE: { pOficialismo: resE.pS1, pOposicion: resE.pS2 },
    modeloF: { pOficialismo: resF.pS1, pOposicion: resF.pS2 },
    promedio,
    chequeos,
    inputs: {
      riesgoPais: embi,
      spreadEstimado: spread,
      tipoCambioNominal: tcn,
      tcrEstimado: tcr,
      icgUsado,
      embiLatinoUsado,
      fechaUltimoDato: ultima.yearMonth,
    },
  };
}

/**
 * Probabilidad de continuidad (oficialismo) mes a mes, calculada con los
 * datos reales de cada mes desde `desde` (inclusive) hasta el último dato
 * disponible en la serie.
 */
export function historia(desde: string = "2026-01"): HistoriaPunto[] {
  const rows = loadSerie();
  const params = buildModelParams(rows);

  return rows
    .filter((r) => r.yearMonth >= desde)
    .map((r) => {
      const spread = r.embiArgentina - r.embiLatino;
      const resE = classifyModel([r.embiArgentina, r.icg, r.tcrBlue], params.E);
      const resF = classifyModel([spread, r.icg, r.tcrBlue], params.F);
      return {
        yearMonth: r.yearMonth,
        modeloE: resE.pS1,
        modeloF: resF.pS1,
        promedio: (resE.pS1 + resF.pS1) / 2,
      };
    });
}
