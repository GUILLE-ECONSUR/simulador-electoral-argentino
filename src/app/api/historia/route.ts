import { NextRequest, NextResponse } from "next/server";
import { historia } from "@/lib/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const desde = searchParams.get("desde") ?? "2026-01";
    const puntos = historia(desde);
    return NextResponse.json({ puntos });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "No se pudo calcular la evolución histórica." },
      { status: 500 }
    );
  }
}
