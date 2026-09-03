export default function Footer() {
  return (
    <footer className="border-t border-gris-suave bg-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h4 className="text-sm font-bold text-azul-noche">Metodología</h4>
            <p className="mt-2 text-xs leading-relaxed text-gris-intenso">
              Clasificador bayesiano de dos clases (S1 = Macri+Milei, S2 = CFK
              I+II+A.Fernández) con densidad normal trivariada, entrenado con
              datos mensuales 2007-2026 de EMBI, ICG-UTDT y tipo de cambio real
              con dólar blue.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-azul-noche">Datos</h4>
            <p className="mt-2 text-xs leading-relaxed text-gris-intenso">
              La serie histórica se actualiza manualmente reemplazando el
              archivo <code className="rounded bg-gris-suave/60 px-1 py-0.5">data/serie_modelo.xlsx</code>{" "}
              del repositorio. Ver README para el detalle de columnas.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-azul-noche">Advertencia</h4>
            <p className="mt-2 text-xs leading-relaxed text-gris-intenso">
              Este simulador es un ejercicio de similitud estadística con
              patrones históricos, no una predicción electoral. Las muestras
              son chicas (80 y 144 observaciones) y no incorporan encuestas ni
              datos de campaña.
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-[11px] text-gris-intenso">
          Simulador Electoral Argentina 2027 — uso interno / analítico.
        </p>
      </div>
    </footer>
  );
}
