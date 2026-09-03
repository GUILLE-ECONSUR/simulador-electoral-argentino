import { NextRequest, NextResponse } from "next/server";
import { simular } from "@/lib/model";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const riesgoPais =
      body.riesgoPais !== undefined && body.riesgoPais !== null && body.riesgoPais !== ""
        ? Number(body.riesgoPais)
        : null;
    const tipoCambioNominal =
      body.tipoCambioNominal !== undefined &&
      body.tipoCambioNominal !== null &&
      body.tipoCambioNominal !== ""
        ? Number(body.tipoCambioNominal)
        : null;

    if (riesgoPais !== null && (!Number.isFinite(riesgoPais) || riesgoPais < 0)) {
      return NextResponse.json(
        { error: "El riesgo país debe ser un número positivo." },
        { status: 400 }
      );
    }
    if (
      tipoCambioNominal !== null &&
      (!Number.isFinite(tipoCambioNominal) || tipoCambioNominal <= 0)
    ) {
      return NextResponse.json(
        { error: "El tipo de cambio debe ser un número positivo." },
        { status: 400 }
      );
    }

    const resultado = simular(riesgoPais, tipoCambioNominal);
    return NextResponse.json(resultado);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "No se pudo calcular la simulación. Verificá los datos ingresados." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const resultado = simular(null, null);
    return NextResponse.json(resultado);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "No se pudo leer el archivo de datos." },
      { status: 500 }
    );
  }
}
