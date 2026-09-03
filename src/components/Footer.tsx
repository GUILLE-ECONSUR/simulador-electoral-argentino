import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-gris-suave bg-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 sm:grid-cols-2">
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
            <h4 className="text-sm font-bold text-azul-noche">Advertencia</h4>
            <p className="mt-2 text-xs leading-relaxed text-gris-intenso">
              Este simulador es un ejercicio de similitud estadística con
              patrones históricos, no una predicción electoral. Las muestras
              son chicas (80 y 144 observaciones) y no incorporan encuestas ni
              datos de campaña.
            </p>
          </div>
        </div>

        <div className="mt-9 flex flex-col items-center justify-between gap-4 border-t border-gris-suave pt-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <Image src="/econsur-logo.png" alt="EconSur" width={24} height={23} />
            <span className="text-sm font-bold text-azul-noche">EconSur</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://econsur.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-gris-suave px-4 py-1.5 text-xs font-semibold text-gris-intenso transition hover:border-azul-vivido hover:text-azul-vivido"
            >
              <GlobeIcon />
              econsur.ar
            </a>
            <a
              href="https://www.linkedin.com/company/econsur-consultora/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn de EconSur"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gris-suave text-gris-intenso transition hover:border-azul-vivido hover:text-azul-vivido"
            >
              <LinkedInIcon />
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-gris-intenso">
          Simulador Electoral Argentina 2027 — uso interno / analítico.
        </p>
      </div>
    </footer>
  );
}

function GlobeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}
