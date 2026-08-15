/* ── Fig. 9 SOA raw curve data (AMDTA080N017RH) ── */

export interface SoaRawCurve {
  label: string;
  /** Pulse width in seconds (0 for DC, -1 for boundary lines) */
  pulseTime: number;
  /** [Vds, Ids] coordinate pairs */
  points: [number, number][];
  color: string;
  /** Boundary lines (BVDSS, ID_max, IDM, RDS(on)) get dashed style */
  isBoundary: boolean;
}

/*
  Data extracted from datasheet Fig. 9 SOA.
  Each group (separated by blank lines) is one polyline.
*/
export const RAW_SOA_CURVES: SoaRawCurve[] = [
  // ── Thermal pulse curves ──
  {
    label: '10µs',
    pulseTime: 1e-5,
    points: [
      [80, 283.6096321],
      [37.81, 600.00],
    ],
    color: '#E03131',
    isBoundary: false,
  },
  {
    label: '100µs',
    pulseTime: 1e-4,
    points: [
      [80, 83.70535714],
      [61, 130],
      [11.16071429, 600],
    ],
    color: '#2F9E44',
    isBoundary: false,
  },
  {
    label: '1ms',
    pulseTime: 1e-3,
    points: [
      [80, 2.4],
      [32.5, 17.3],
      [20, 40.9],
      [1.88, 560],
    ],
    color: '#1971C2',
    isBoundary: false,
  },
  {
    label: '10ms',
    pulseTime: 1e-2,
    points: [
      [80, 0.9],
      [40, 2.8],
      [10, 31.55],
      [1.05, 340],
    ],
    color: '#E8590C',
    isBoundary: false,
  },
  {
    label: 'DC',
    pulseTime: 0,
    points: [
      [80, 0.3],
      [40, 1.01],
      [7, 17],
      [0.64, 193],
    ],
    color: '#9C36B5',
    isBoundary: false,
  },
  // ── Boundary lines ──
  {
    label: 'ID(max)',
    pulseTime: -1,
    points: [
      [1.12, 340],
      [0.1, 340],
    ],
    color: '#6B7280',
    isBoundary: true,
  },
  {
    label: 'RDS(on)',
    pulseTime: -1,
    points: [
      [2.04, 600.00],
      [0.1, 29.41176471],
    ],
    color: '#6B7280',
    isBoundary: true,
  },
  {
    label: 'IDM',
    pulseTime: -1,
    points: [
      [0.1, 600],
      [37.81461762, 600],
    ],
    color: '#6B7280',
    isBoundary: true,
  },
  {
    label: 'BVDSS',
    pulseTime: -1,
    points: [
      [80, 0.005],
      [80, 283.6096321],
    ],
    color: '#DC2626',
    isBoundary: true,
  },
];

/**
 * Generate the RDS(on) ohmic-limit incline: Id = Vds / RDS(on).
 * Spans from (vdsMin, vdsMin/rds) up to (idMax * rds, idMax).
 * The curve is a diagonal line on log–log axes.
 */
export function generateRdsonCurve(rds: number, idMax: number, label = 'RDS(on)'): SoaRawCurve {
  const vdsIntersect = idMax * rds;
  const vdsMin = Math.max(vdsIntersect / 5000, 1e-4);
  const steps = 60;
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const vds = vdsMin * Math.pow(vdsIntersect / vdsMin, t);
    const id = vds / rds;
    pts.push([vds, id]);
  }
  return {
    label,
    pulseTime: -1,
    points: pts,
    color: '#3F3F46',
    isBoundary: true,
  };
}

/* ── Operating-point check helpers ── */

/**
 * Pick the thermal pulse curve that applies for a given t_pulse.
 * Falls back to DC (most conservative) when t_pulse is very long.
 */
export function pickCurveByPulse(curves: SoaRawCurve[], t_pulse: number): SoaRawCurve {
  const thermal = curves.filter((c) => !c.isBoundary && c.pulseTime > 0);
  // Sort descending by pulse time (longest first)
  thermal.sort((a, b) => b.pulseTime - a.pulseTime);
  // Find the tightest (shortest pulse) curve that is slower/same as t_pulse
  for (let i = thermal.length - 1; i >= 0; i--) {
    if (t_pulse >= thermal[i].pulseTime) return thermal[i];
  }
  // t_pulse shorter than any curve → use the fastest curve (10µs)
  return thermal[thermal.length - 1];
}

/**
 * Interpolate Ids at a given Vds along a curve (log-log linear interpolation).
 * Returns Infinity if the point is above the curve's Vds range (conservative: assume no limit).
 */
export function interpolateIdAtVds(curve: SoaRawCurve, vds: number): number {
  const pts = curve.points;
  if (pts.length < 2) return Infinity;

  // Find the segment spanning vds
  for (let i = 0; i < pts.length - 1; i++) {
    const [v1, i1] = pts[i];
    const [v2, i2] = pts[i + 1];
    const loV = Math.min(v1, v2);
    const hiV = Math.max(v1, v2);
    if (vds >= loV && vds <= hiV) {
      // Log-log interpolation
      const logVds = Math.log10(vds);
      const logV1 = Math.log10(v1);
      const logV2 = Math.log10(v2);
      const logI1 = Math.log10(i1);
      const logI2 = Math.log10(i2);
      const ratio = (logVds - logV1) / (logV2 - logV1);
      const logId = logI1 + ratio * (logI2 - logI1);
      return Math.pow(10, logId);
    }
  }

  // Vds outside curve range → extrapolate or return Infinity
  const last = pts[pts.length - 1];
  const first = pts[0];
  if (vds > Math.max(first[0], last[0])) {
    // Right of curve → no thermal limit applies here
    return Infinity;
  }
  // Left of curve → use first point
  return first[1];
}

export interface OpCheckResult {
  verdict: 'PASS' | 'FAIL' | 'WARN';
  maxId: number;
  curveLabel: string;
  operatingId: number;
}

/**
 * Check if an operating point is inside the SOA boundary.
 */
export function checkOperatingPoint(
  curves: SoaRawCurve[],
  vds: number,
  id: number,
  t_pulse: number,
  idMax: number,
  idm: number,
  bv: number,
  rds: number,
): OpCheckResult {
  // BV check
  if (vds > bv) {
    return { verdict: 'FAIL', maxId: 0, curveLabel: 'BVDSS', operatingId: id };
  }

  // ID_max / IDM check
  const iLimit = idm > 0 ? idm : idMax;
  if (id > iLimit) {
    return { verdict: 'FAIL', maxId: iLimit, curveLabel: idm > 0 ? 'IDM' : 'ID(max)', operatingId: id };
  }

  // RDS(on) ohmic limit: Id must be ≤ Vds / RDS(on)
  if (rds > 0 && vds > 0) {
    const rdsonLimit = vds / rds;
    if (id > rdsonLimit) {
      return { verdict: 'FAIL', maxId: rdsonLimit, curveLabel: 'RDS(on)', operatingId: id };
    }
    // WARN if near RDS(on) limit (> 80%)
    if (id > rdsonLimit * 0.8) {
      return { verdict: 'WARN', maxId: rdsonLimit, curveLabel: 'RDS(on)', operatingId: id };
    }
  }

  // Thermal curve check
  const curve = pickCurveByPulse(curves, t_pulse);
  const maxId = interpolateIdAtVds(curve, vds);
  if (id > maxId) {
    return { verdict: 'FAIL', maxId, curveLabel: curve.label, operatingId: id };
  }

  // WARN if near limit (> 80%)
  const ratio = id / maxId;
  const label = curve.label;
  if (ratio > 0.8) {
    return { verdict: 'WARN', maxId, curveLabel: label, operatingId: id };
  }

  return { verdict: 'PASS', maxId, curveLabel: label, operatingId: id };
}
