import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simulador Electoral Argentina 2027",
  description:
    "Simulador estadístico de escenarios electorales 2027 basado en riesgo país, tipo de cambio real e Índice de Confianza en el Gobierno (ICG-UTDT).",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body className="min-h-screen bg-gris-suave/40 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
