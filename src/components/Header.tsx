import Image from "next/image";

export default function Header() {
  return (
    <header className="relative overflow-hidden bg-gradient-azul px-6 pb-24 pt-10 text-white sm:pb-32 sm:pt-12">
      {/* Formas decorativas */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-azul-pastel/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-azul-vivido/30 blur-3xl" />

      {/* Barra superior: logo + links */}
      <div className="relative mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 p-1.5 shadow-sm">
            <Image
              src="/econsur-logo.png"
              alt="EconSur"
              width={32}
              height={31}
              priority
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            EconSur
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://econsur.ar/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            <GlobeIcon />
            econsur.ar
          </a>
          <a
            href="https://www.linkedin.com/company/econsur-consultora/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn de EconSur"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
          >
            <LinkedInIcon />
          </a>
        </div>
      </div>

      <div className="relative mx-auto mt-14 max-w-4xl text-center sm:mt-16">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Simulador Electoral
          <span className="block bg-gradient-to-r from-azul-pastel to-white bg-clip-text text-transparent">
            Argentina 2027
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-white/80 sm:text-lg">
          Estimá la probabilidad de que el oficialismo retenga el gobierno a partir del{" "}
          <strong className="text-white">riesgo país</strong> y el{" "}
          <strong className="text-white">tipo de cambio nominal</strong>, combinando dos
          clasificadores bayesianos entrenados con la serie histórica 2007-2026 de EMBI,
          ICG-UTDT y tipo de cambio real.
        </p>
      </div>
    </header>
  );
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}
