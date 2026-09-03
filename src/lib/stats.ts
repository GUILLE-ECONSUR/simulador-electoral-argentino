/**
 * Utilidades estadísticas para el clasificador bayesiano trivariado
 * (réplica en TypeScript de la metodología usada en el modelo de Excel).
 */

export function mean(arr: number[]): number {
  if (arr.length === 0) return NaN;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/** Varianza muestral (n-1) */
export function variance(arr: number[]): number {
  const m = mean(arr);
  const n = arr.length;
  if (n < 2) return NaN;
  return arr.reduce((acc, x) => acc + (x - m) ** 2, 0) / (n - 1);
}

/** Covarianza muestral (n-1) entre dos series de igual longitud */
export function covariance(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2 || y.length !== n) return NaN;
  const mx = mean(x);
  const my = mean(y);
  let acc = 0;
  for (let i = 0; i < n; i++) acc += (x[i] - mx) * (y[i] - my);
  return acc / (n - 1);
}

export type Vec3 = [number, number, number];
export type Mat3 = [Vec3, Vec3, Vec3];

/** Determinante de una matriz simétrica 3x3 */
export function det3(m: Mat3): number {
  const [[a, b, c], [, e, f], [, , i]] = m;
  // matriz simetrica: m[1][0]=b, m[2][0]=c, m[2][1]=f
  return a * (e * i - f * f) - b * (b * i - f * c) + c * (b * f - e * c);
}

/** Matriz de covarianza 3x3 (simétrica) a partir de tres series */
export function covMatrix3(x1: number[], x2: number[], x3: number[]): Mat3 {
  const v1 = variance(x1);
  const v2 = variance(x2);
  const v3 = variance(x3);
  const c12 = covariance(x1, x2);
  const c13 = covariance(x1, x3);
  const c23 = covariance(x2, x3);
  return [
    [v1, c12, c13],
    [c12, v2, c23],
    [c13, c23, v3],
  ];
}

/**
 * Densidad normal trivariada evaluada en x, dados vector de medias y matriz
 * de covarianza 3x3. Usa la fórmula cerrada vía cofactores (misma que el
 * modelo de Excel) en lugar de invertir la matriz numéricamente.
 */
export function mvnPdf3(x: Vec3, meanVec: Vec3, cov: Mat3): number {
  const [v1, c12, c13] = cov[0];
  const [, v2, c23] = cov[1];
  const [, , v3] = cov[2];

  const det = det3(cov);
  if (det <= 0) return 0;

  const A11 = v2 * v3 - c23 * c23;
  const A22 = v1 * v3 - c13 * c13;
  const A33 = v1 * v2 - c12 * c12;
  const A12 = c23 * c13 - c12 * v3;
  const A13 = c12 * c23 - v2 * c13;
  const A23 = c12 * c13 - v1 * c23;

  const d1 = x[0] - meanVec[0];
  const d2 = x[1] - meanVec[1];
  const d3 = x[2] - meanVec[2];

  const Q =
    (d1 * d1 * A11 +
      d2 * d2 * A22 +
      d3 * d3 * A33 +
      2 * d1 * d2 * A12 +
      2 * d1 * d3 * A13 +
      2 * d2 * d3 * A23) /
    det;

  const norm = 1 / (Math.pow(2 * Math.PI, 1.5) * Math.sqrt(det));
  return norm * Math.exp(-0.5 * Q);
}

/**
 * Clasificador bayesiano bivariado de dos clases (S1, S2) con prior
 * no informativo 50/50. Devuelve P(S1) y P(S2).
 */
export function classify(
  x: Vec3,
  meanS1: Vec3,
  covS1: Mat3,
  meanS2: Vec3,
  covS2: Mat3
): { pS1: number; pS2: number } {
  const L1 = mvnPdf3(x, meanS1, covS1);
  const L2 = mvnPdf3(x, meanS2, covS2);
  if (L1 + L2 === 0) return { pS1: 0.5, pS2: 0.5 };
  const pS1 = L1 / (L1 + L2);
  return { pS1, pS2: 1 - pS1 };
}
