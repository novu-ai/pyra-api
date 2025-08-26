export type MetricStatus = 'green' | 'yellow' | 'red';

export type MetricResult = {
  key: string;
  label: string;
  value: number | null;
  unit?: string;
  status: MetricStatus;
  explanation: string;
  formula: string;
};

export const thresholds = {
  liquidezCorriente: { red: 1.0, yellow: 1.5 },
  pruebaAcida: { red: 0.8, yellow: 1.0 },
  margenBruto: { red: 0.15, yellow: 0.25 },
  margenNeto: { red: 0.03, yellow: 0.08 },
  endeudamiento: { red: 0.7, yellow: 0.5 },
  coberturaIntereses: { red: 1.5, yellow: 3 },
  rotCartera: { red: 8, yellow: 6 },
  rotInventario: { red: 180, yellow: 90 },
  rotProveedores: { red: 120, yellow: 60 },
  capitalTrabajo: { red: 0, yellow: 1 }
} as const;

export type RawValues = {
  ventas: number;
  costoVentas: number;
  utilidadNeta: number;
  utilidadOperativa?: number;
  gastosFinancieros?: number;
  activosCorrientes: number;
  pasivosCorrientes: number;
  inventario: number;
  cuentasPorCobrar?: number;
  cuentasPorPagar?: number;
  activoTotal: number;
  pasivoTotal: number;
};

function statusByBands(value: number | null, red: number, yellow: number, direction: 'high-good' | 'low-good' = 'high-good'): MetricStatus {
  if (value === null || Number.isNaN(value)) return 'red';
  if (direction === 'high-good') {
    if (value < red) return 'red';
    if (value < yellow) return 'yellow';
    return 'green';
  } else {
    if (value > red) return 'red';
    if (value > yellow) return 'yellow';
    return 'green';
  }
}

export function pct(n: number): number {
  return Math.round(n * 10000) / 100;
}

export function safeDiv(num: number, den: number): number | null {
  return den === 0 ? null : num / den;
}

export function computeMetrics(v: RawValues): Record<string, MetricResult> {
  const liquidezCorriente = safeDiv(v.activosCorrientes, v.pasivosCorrientes);
  const pruebaAcida = safeDiv(v.activosCorrientes - v.inventario, v.pasivosCorrientes);
  const margenBruto = safeDiv(v.ventas - v.costoVentas, v.ventas);
  const margenNeto = safeDiv(v.utilidadNeta, v.ventas);
  const endeudamiento = safeDiv(v.pasivoTotal, v.activoTotal);
  const coberturaIntereses = v.utilidadOperativa !== undefined && v.gastosFinancieros !== undefined
    ? safeDiv(v.utilidadOperativa, v.gastosFinancieros)
    : null;

  const rotCartera = v.cuentasPorCobrar && v.cuentasPorCobrar > 0 ? safeDiv(v.ventas, v.cuentasPorCobrar) : null;
  const rotInventario = v.inventario && v.inventario > 0 ? safeDiv(v.costoVentas, v.inventario) : null;
  const rotProveedores = v.cuentasPorPagar && v.cuentasPorPagar > 0 ? safeDiv(v.costoVentas, v.cuentasPorPagar) : null;
  const capitalTrabajo = v.activosCorrientes - v.pasivosCorrientes;

  const results: Record<string, MetricResult> = {
    liquidezCorriente: {
      key: 'liquidezCorriente',
      label: 'Liquidez Corriente',
      value: liquidezCorriente ?? null,
      status: statusByBands(liquidezCorriente ?? null, thresholds.liquidezCorriente.red, thresholds.liquidezCorriente.yellow, 'high-good'),
      explanation: 'Capacidad de cubrir obligaciones de corto plazo con activos corrientes.',
      formula: 'Activos Corrientes / Pasivos Corrientes'
    },
    pruebaAcida: {
      key: 'pruebaAcida',
      label: 'Prueba Ácida',
      value: pruebaAcida ?? null,
      status: statusByBands(pruebaAcida ?? null, thresholds.pruebaAcida.red, thresholds.pruebaAcida.yellow, 'high-good'),
      explanation: 'Liquidez sin inventarios; mide solvencia inmediata.',
      formula: '(Activos Corrientes − Inventario) / Pasivos Corrientes'
    },
    margenBruto: {
      key: 'margenBruto',
      label: 'Margen Bruto (%)',
      value: margenBruto !== null && margenBruto !== undefined ? pct(margenBruto) : null,
      unit: '%',
      status: statusByBands(margenBruto ?? null, thresholds.margenBruto.red, thresholds.margenBruto.yellow, 'high-good'),
      explanation: 'Rentabilidad después del costo directo de ventas.',
      formula: '((Ventas − Costo de Ventas) / Ventas) × 100'
    },
    margenNeto: {
      key: 'margenNeto',
      label: 'Margen Neto (%)',
      value: margenNeto !== null && margenNeto !== undefined ? pct(margenNeto) : null,
      unit: '%',
      status: statusByBands(margenNeto ?? null, thresholds.margenNeto.red, thresholds.margenNeto.yellow, 'high-good'),
      explanation: 'Utilidad neta sobre ventas; eficiencia final.',
      formula: '(Utilidad Neta / Ventas) × 100'
    },
    endeudamiento: {
      key: 'endeudamiento',
      label: 'Nivel de Endeudamiento (%)',
      value: endeudamiento !== null && endeudamiento !== undefined ? pct(endeudamiento) : null,
      unit: '%',
      status: statusByBands(endeudamiento ?? null, thresholds.endeudamiento.red, thresholds.endeudamiento.yellow, 'low-good'),
      explanation: 'Proporción del activo financiado por terceros.',
      formula: '(Pasivo Total / Activo Total) × 100'
    },
    coberturaIntereses: {
      key: 'coberturaIntereses',
      label: 'Cobertura de Intereses (veces)',
      value: coberturaIntereses ?? null,
      status: statusByBands(coberturaIntereses ?? null, thresholds.coberturaIntereses.red, thresholds.coberturaIntereses.yellow, 'high-good'),
      explanation: 'Capacidad operativa para cubrir gastos financieros.',
      formula: 'Utilidad Operativa / Gastos Financieros'
    },
    rotCartera: {
      key: 'rotCartera',
      label: 'Rotación de Cartera (veces)',
      value: rotCartera ?? null,
      status: rotCartera === null ? 'red' : 'green',
      explanation: 'Veces que se convierte en efectivo la cartera al año.',
      formula: 'Ventas / Cuentas por Cobrar'
    },
    rotInventario: {
      key: 'rotInventario',
      label: 'Rotación de Inventario (veces)',
      value: rotInventario ?? null,
      status: rotInventario === null ? 'red' : 'green',
      explanation: 'Veces que se renueva el inventario al año.',
      formula: 'Costo de Ventas / Inventario'
    },
    rotProveedores: {
      key: 'rotProveedores',
      label: 'Rotación de Proveedores (veces)',
      value: rotProveedores ?? null,
      status: rotProveedores === null ? 'red' : 'green',
      explanation: 'Veces que se pagan a proveedores al año.',
      formula: 'Costo de Ventas / Cuentas por Pagar'
    },
    capitalTrabajo: {
      key: 'capitalTrabajo',
      label: 'Capital de Trabajo',
      value: Math.round(capitalTrabajo * 100) / 100,
      status: capitalTrabajo <= thresholds.capitalTrabajo.red ? 'red' : capitalTrabajo <= thresholds.capitalTrabajo.yellow ? 'yellow' : 'green',
      explanation: 'Recursos de corto plazo disponibles para operar.',
      formula: 'Activos Corrientes − Pasivos Corrientes'
    }
  };

  return results;
}

export function makeExecutiveSummary(metrics: Record<string, MetricResult>) {
  const reds = Object.values(metrics).filter((m) => m.status === 'red');
  const yellows = Object.values(metrics).filter((m) => m.status === 'yellow');
  const greens = Object.values(metrics).filter((m) => m.status === 'green');
  const headline = reds.length
    ? '⚠️ Riesgos críticos detectados'
    : yellows.length
    ? '🟡 Oportunidades de mejora'
    : '🟢 Salud financiera sólida';

  const bullets = [
    `Liquidez Corriente: ${metrics.liquidezCorriente.value ?? 's/datos'}`,
    `Margen Neto (%): ${metrics.margenNeto.value ?? 's/datos'}`,
    `Endeudamiento (%): ${metrics.endeudamiento.value ?? 's/datos'}`
  ];

  return {
    headline,
    bullets,
    reds: reds.map((m) => m.label),
    yellows: yellows.map((m) => m.label),
    greens: greens.map((m) => m.label)
  };
}
