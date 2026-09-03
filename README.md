# Simulador Electoral Argentina 2027

Simulador web que estima la probabilidad de que el oficialismo retenga el
gobierno en 2027, a partir de dos clasificadores bayesianos trivariados
(**Modelo E** y **Modelo F**) entrenados con la serie histórica mensual
2007-2026 de riesgo país (EMBI), Índice de Confianza en el Gobierno
(ICG-UTDT) y tipo de cambio real con dólar blue.

El usuario ingresa **riesgo país (pb)** y/o **tipo de cambio nominal ($)**;
el ICG y el EMBI de la región (LATINO) se toman automáticamente del último
dato cargado en el archivo de datos. El resultado final es el **promedio
simple** de la probabilidad que arroja cada modelo.

## Stack técnico

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (paleta de colores personalizada)
- **xlsx (SheetJS)** para leer el archivo de datos
- Cálculo estadístico (medias, covarianzas, densidad normal trivariada)
  implementado desde cero en `src/lib/stats.ts`, sin dependencias externas
  de álgebra lineal — así el resultado es 100% verificable y reproduce
  exactamente los mismos números que el modelo original en Excel.
- Pensado para deploy en **Vercel** (funciones serverless, sin backend
  aparte).

## Estructura del proyecto

```
├── data/
│   └── serie_modelo.xlsx      ← ARCHIVO DE DATOS (actualizar acá)
├── src/
│   ├── app/
│   │   ├── api/simulate/route.ts   ← endpoint de cálculo (GET y POST)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── SimulatorForm.tsx       ← formulario + fetch al API
│   │   ├── ResultCard.tsx
│   │   ├── ProbabilityGauge.tsx
│   │   └── Footer.tsx
│   └── lib/
│       ├── stats.ts                ← media, varianza, covarianza, normal trivariada
│       └── model.ts                ← carga el Excel y corre los Modelos E y F
├── package.json
├── tailwind.config.ts
└── README.md   (este archivo)
```

## Cómo actualizar los datos

El archivo **`data/serie_modelo.xlsx`** es la única fuente de datos del
modelo. Tiene una sola hoja ("Series") con estas columnas, una fila por mes:

| Columna           | Descripción                                                        |
|--------------------|---------------------------------------------------------------------|
| `YearMonth`        | Período en formato `YYYY-MM` (ej. `2026-07`)                       |
| `Presidencia`      | Nombre del mandato (`CFK I`, `CFK II`, `Macri`, `A. Fernández`, `Milei`) |
| `Grupo`            | `S1` (Macri+Milei, "continuidad/pro-mercado"), `S2` (CFK I+II+A.Fernández, "peronismo"), o vacío |
| `EMBI_Argentina`   | Spread EMBI de Argentina, en puntos básicos                        |
| `EMBI_LATINO`      | Spread EMBI promedio regional (LATINO), en puntos básicos          |
| `ICG`              | Índice de Confianza en el Gobierno (UTDT), escala 0-5               |
| `TCN_blue`         | Tipo de cambio nominal con dólar blue/paralelo                     |
| `IPC_indice`       | Índice de precios acumulado (base = primera fila = 100)             |
| `TCR_blue`         | Tipo de cambio real ya calculado (`TCN_blue / IPC_indice`, reindexado a 100 en la primera fila) |

**Para actualizar cuando salga un dato nuevo (ICG mensual, cierre de mes,
etc.):**

1. Agregar una fila nueva al final con el `YearMonth` correspondiente.
2. Completar `EMBI_Argentina`, `EMBI_LATINO`, `ICG`, `TCN_blue` con los
   valores del mes.
3. Calcular `IPC_indice` = `IPC_indice` del mes anterior × (1 + inflación
   mensual/100).
4. Calcular `TCR_blue` = `(TCN_blue / IPC_indice) / (TCN_blue_fila1 /
   IPC_indice_fila1) × 100`.
5. Completar `Presidencia` y `Grupo` (`S1` mientras siga el mandato actual).
6. Guardar el archivo, hacer commit y push — Vercel vuelve a deployar solo.

La app siempre usa el **último dato de ICG y de EMBI_LATINO** de la
planilla como referencia automática (no se le piden al usuario en el
formulario), y recalcula las medias/varianzas/covarianzas de los grupos S1
y S2 en cada request a partir de **todas** las filas — no hace falta tocar
ningún cálculo, solo cargar los datos nuevos.

> El archivo de dólar blue/brecha cambiaria usado para construir la serie
> histórica salió de fuentes públicas (Ámbito Financiero /
> estudiodelamo.com); si tenés una fuente propia, podés reemplazar esa
> columna sin tocar el resto del archivo.

## Cómo correr en local

Requiere Node.js 18 o superior.

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Cómo hacer deploy en Vercel

### Opción A — desde GitHub (recomendada)

1. Crear un repositorio nuevo en GitHub y subir esta carpeta completa
   (incluyendo `data/serie_modelo.xlsx`).
2. Entrar a [vercel.com](https://vercel.com) → **Add New… → Project** →
   importar el repositorio.
3. Vercel detecta Next.js automáticamente. No hace falta tocar ningún
   setting (Build Command: `next build`, Output: por defecto).
4. **Deploy**. Cada `git push` a la rama principal vuelve a deployar solo.

### Opción B — con la CLI de Vercel

```bash
npm install -g vercel
vercel login
vercel        # deploy de prueba
vercel --prod # deploy a producción
```

## Endpoint de la API

`GET /api/simulate` — devuelve el resultado usando el último dato de la
planilla (sin overrides del usuario).

`POST /api/simulate` con body JSON:

```json
{ "riesgoPais": 505, "tipoCambioNominal": 1540 }
```

Ambos campos son opcionales — si se omite alguno, se usa el último dato de
la planilla para esa variable. Devuelve:

```json
{
  "modeloE": { "pOficialismo": 0.60, "pOposicion": 0.40 },
  "modeloF": { "pOficialismo": 0.50, "pOposicion": 0.50 },
  "promedio": { "pOficialismo": 0.55, "pOposicion": 0.45 },
  "inputs": { "...": "..." }
}
```

## Metodología (resumen)

- **Modelo E**: clasificador bayesiano trivariado sobre [EMBI Argentina,
  ICG, TCR-blue].
- **Modelo F**: mismo clasificador sobre [Spread Arg-LATAM, ICG, TCR-blue].
- Cada modelo compara la verosimilitud del dato ingresado bajo dos
  distribuciones normales trivariadas históricas: **S1** ("continuidad",
  meses de Macri+Milei) y **S2** ("peronismo", meses de CFK I+II+A.
  Fernández), con prior no informativo 50/50.
- El resultado final que se muestra como "principal" es el **promedio
  simple** de `P(oficialismo)` de ambos modelos.
- El tipo de cambio nominal ingresado se convierte a tipo de cambio real
  usando la razón `TCR_blue_última_fila / TCN_blue_última_fila` de la
  planilla — una aproximación que asume que el nivel general de precios no
  cambió desde el último dato cargado.

**Advertencia**: este es un ejercicio de similitud estadística con
patrones históricos (muestras de 80 y 144 observaciones mensuales), no una
predicción electoral. No incorpora encuestas, resultados de comicios
provinciales, ni eventos de campaña.
