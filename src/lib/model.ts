import * as XLSX from "xlsx";
import fs from "node:fs";
import path from "node:path";
import { classify, covMatrix3, mean, type Vec3 } from "./stats";

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

export interface SimulacionResultado {
  modeloE: ModeloResultado;
  modeloF: ModeloResultado;
  promedio: ModeloResultado;
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

export function simular(
  riesgoPaisPb: number | null,
  tipoCambioNominal: number | null
): SimulacionResultado {
  const rows = loadSerie();
  const ultima = rows[rows.length - 1];

  const s1 = rows.filter((r) => r.grupo === "S1");
  const s2 = rows.filter((r) => r.grupo === "S2");

  const icgUsado = ultima.icg;
  const embiLatinoUsado = ultima.embiLatino;

  const embi = riesgoPaisPb ?? ultima.embiArgentina;
  const tcn = tipoCambioNominal ?? ultima.tcnBlue;
  const tcr = tcnToTcr(tcn, ultima);
  const spread = embi - embiLatinoUsado;

  // ---- Modelo E: EMBI + ICG + TCR blue ----
  const s1_E_embi = s1.map((r) => r.embiArgentina);
  const s1_E_icg = s1.map((r) => r.icg);
  const s1_E_tcr = s1.map((r) => r.tcrBlue);
  const s2_E_embi = s2.map((r) => r.embiArgentina);
  const s2_E_icg = s2.map((r) => r.icg);
  const s2_E_tcr = s2.map((r) => r.tcrBlue);

  const meanS1_E: Vec3 = [mean(s1_E_embi), mean(s1_E_icg), mean(s1_E_tcr)];
  const covS1_E = covMatrix3(s1_E_embi, s1_E_icg, s1_E_tcr);
  const meanS2_E: Vec3 = [mean(s2_E_embi), mean(s2_E_icg), mean(s2_E_tcr)];
  const covS2_E = covMatrix3(s2_E_embi, s2_E_icg, s2_E_tcr);

  const xE: Vec3 = [embi, icgUsado, tcr];
  const resE = classify(xE, meanS1_E, covS1_E, meanS2_E, covS2_E);

  // ---- Modelo F: Spread + ICG + TCR blue ----
  const s1_F_spread = s1.map((r) => r.embiArgentina - r.embiLatino);
  const s2_F_spread = s2.map((r) => r.embiArgentina - r.embiLatino);

  const meanS1_F: Vec3 = [mean(s1_F_spread), mean(s1_E_icg), mean(s1_E_tcr)];
  const covS1_F = covMatrix3(s1_F_spread, s1_E_icg, s1_E_tcr);
  const meanS2_F: Vec3 = [mean(s2_F_spread), mean(s2_E_icg), mean(s2_E_tcr)];
  const covS2_F = covMatrix3(s2_F_spread, s2_E_icg, s2_E_tcr);

  const xF: Vec3 = [spread, icgUsado, tcr];
  const resF = classify(xF, meanS1_F, covS1_F, meanS2_F, covS2_F);

  const promedio = {
    pOficialismo: (resE.pS1 + resF.pS1) / 2,
    pOposicion: (resE.pS2 + resF.pS2) / 2,
  };

  return {
    modeloE: { pOficialismo: resE.pS1, pOposicion: resE.pS2 },
    modeloF: { pOficialismo: resF.pS1, pOposicion: resF.pS2 },
    promedio,
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
