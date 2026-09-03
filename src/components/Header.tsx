export default function Header() {
  return (
    <header className="relative overflow-hidden bg-gradient-azul px-6 pb-24 pt-14 text-white sm:pb-32 sm:pt-20">
      {/* Formas decorativas */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-azul-pastel/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-azul-vivido/30 blur-3xl" />

      <div className="relative mx-auto max-w-4xl text-center">
        <span className="chip bg-white/15 text-white">
          Modelo bayesiano trivariado · Modelos E &amp; F
        </span>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
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
