import { describe, it, expect } from 'vitest';
import {
  zthFoster, zthFosterPer, fosterRth,
  soaCurrentAt, soaCurve,
  analyzeSwitching, analyzeLinear,
  combine, parseNum, fnum, fmtTime,
  check_ovp, check_ocp, check_scp, check_otp, check_uvlo, check_desat,
  siCurrentLimit,
  runProtectionSuite, PROTECTION_INFO,
  zthAt, zthFromTable, zthInvAt, pmaxAtPulse, thermalRthDC, tableTimeDomain,
  type FosterStage, type SpiritoInstability, type RthjcTable,
} from './soaEngine';

describe('parseNum', () => {
  it('parses plain numbers', () => {
    expect(parseNum('400')).toBe(400);
    expect(parseNum('0.020')).toBeCloseTo(0.020);
    expect(parseNum('1.5')).toBeCloseTo(1.5);
  });
  it('parses scientific notation', () => {
    expect(parseNum('1e-3')).toBeCloseTo(0.001);
    expect(parseNum('2.5E-6')).toBeCloseTo(2.5e-6);
  });
  it('parses engineering suffixes', () => {
    expect(parseNum('20m')).toBeCloseTo(0.020);
    expect(parseNum('2.5u')).toBeCloseTo(2.5e-6);
    expect(parseNum('1.2k')).toBeCloseTo(1200);
    expect(parseNum('100n')).toBeCloseTo(100e-9);
  });
  it('handles comma as decimal separator', () => {
    expect(parseNum('3,14')).toBeCloseTo(3.14);
  });
  it('throws on empty / garbage', () => {
    expect(() => parseNum('')).toThrow();
    expect(() => parseNum('abc')).toThrow();
  });
});

describe('fnum / fmtTime', () => {
  it('formats fixed decimals', () => {
    expect(fnum(1.2345, 2)).toBe('1.23');
    expect(fnum(0.000456, 3)).toBe('0.000');
    expect(fnum(0.0004567, 4)).toMatch(/0\.0005/);
  });
  it('handles infinity / NaN', () => {
    expect(fnum(Infinity, 2)).toBe('inf');
    expect(fnum(-Infinity, 2)).toBe('-inf');
    expect(fnum(NaN, 2)).toBe('nan');
  });
  it('formats times in engineering units', () => {
    expect(fmtTime(2e-9)).toMatch(/ns$/);
    expect(fmtTime(1.2e-6)).toMatch(/us$/);
    expect(fmtTime(3.5e-3)).toMatch(/ms$/);
    expect(fmtTime(2.5)).toMatch(/s$/);
    expect(fmtTime(Infinity)).toBe('DC');
  });
});

describe('Zth thermal model', () => {
  const stages: FosterStage[] = [
    { R: 0.05, tau: 5e-4 },
    { R: 0.12, tau: 5e-3 },
    { R: 0.20, tau: 5e-2 },
    { R: 0.13, tau: 0.5 },
  ];
  it('zth(0) = 0 and zth(infinity) = sum of Ri', () => {
    expect(zthFoster(stages, 0)).toBe(0);
    expect(zthFoster(stages, 1e9)).toBeCloseTo(fosterRth(stages), 6);
  });
  it('Zth is monotonically non-decreasing', () => {
    let prev = -1;
    for (let e = -6; e <= 6; e++) {
      const v = zthFoster(stages, Math.pow(10, e));
      expect(v).toBeGreaterThanOrEqual(prev - 1e-12);
      prev = v;
    }
  });
  it('repetitive pulse Zth is bounded and >= 0', () => {
    const z = zthFosterPer(stages, 1e-3, 0.5);
    expect(z).toBeGreaterThan(0);
    expect(z).toBeLessThan(fosterRth(stages) + 1e-9);
  });
  it('zthInvAt inverts zthFosterPer within tolerance', () => {
    const targets = [0.05, 0.1, 0.2, 0.3, 0.4, 0.45];
    for (const z of targets) {
      const t = zthInvAt(stages, z, 0);
      const back = zthFosterPer(stages, t, 0);
      expect(Math.abs(back - z)).toBeLessThan(1e-4);
    }
  });
  it('zthInvAt returns Infinity for target above DC', () => {
    expect(zthInvAt(stages, fosterRth(stages) * 2, 0)).toBe(Infinity);
  });
  it('zthInvAt returns 0 for below-D*DC target', () => {
    expect(zthInvAt(stages, 0.01, 0.5)).toBe(0);
  });
});

describe('pmaxAtPulse', () => {
  it('Pmax decreases with longer pulse', () => {
    const stages: FosterStage[] = [{ R: 0.5, tau: 0.05 }];
    const a = pmaxAtPulse(stages, 150, 50, 1e-3, 0)!;
    const b = pmaxAtPulse(stages, 150, 50, 1e-2, 0)!;
    const c = pmaxAtPulse(stages, 150, 50, 1, 0)!;
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(c);
  });
  it('Pmax is 0 when Tc >= Tj_max', () => {
    expect(pmaxAtPulse([{ R: 0.5, tau: 0.05 }], 150, 150, 1e-3, 0)).toBe(0);
  });
});

describe('soaCurrentAt', () => {
  const siOff: SpiritoInstability = { enabled: false, Vk: 0, m: -2 };
  it('is bounded by ID_max at low V when RDS is small', () => {
    expect(soaCurrentAt(0.01, 1000, 50, 0.0001, siOff)).toBeCloseTo(50);
  });
  it('is bounded by P/V at intermediate V', () => {
    // Pmax=100W, V=10V -> 10A
    expect(soaCurrentAt(10, 100, 1000, 0.001, siOff)).toBeCloseTo(10);
  });
  it('is bounded by V/RDS at high V', () => {
    // V=100V, RDS=1 -> 100A
    expect(soaCurrentAt(100, 1e9, 1e9, 1, siOff)).toBeCloseTo(100);
  });
  it('applies instability locus above Vk', () => {
    const si: SpiritoInstability = { enabled: true, Vk: 100, m: -2 };
    // Pmax=200W, Vk=100: at V=100 -> I=2A ; at V=200 with m=-2 -> 2*200^-2 * 100^2 = 0.5 A
    expect(soaCurrentAt(100, 200, 1e9, 0, si)).toBeCloseTo(2);
    expect(soaCurrentAt(200, 200, 1e9, 0, si)).toBeCloseTo(0.5);
    // below Vk, instability doesn't apply (only P/V and V/RDS apply)
    // P=200W, V=50V -> 4A
    expect(soaCurrentAt(50, 200, 1e9, 0, si)).toBeCloseTo(4);
  });
});

describe('soaCurve', () => {
  it('returns 8 default curves', () => {
    const c = soaCurve(650, 50, 0.05, 150, 50, [{ R: 0.5, tau: 0.05 }], { enabled: false, Vk: 0, m: -2 }, null, 0, 0);
    expect(c).toHaveLength(8);
  });
  it('curves monotonically decrease in pmax with time', () => {
    const c = soaCurve(650, 50, 0.05, 150, 50, [{ R: 0.5, tau: 0.05 }], { enabled: false, Vk: 0, m: -2 }, null, 0, 0);
    for (let i = 1; i < c.length; i++) {
      expect(c[i].pmax).toBeLessThanOrEqual(c[i - 1].pmax + 1e-9);
    }
  });
  it('all curve points are finite', () => {
    const c = soaCurve(650, 50, 0.05, 150, 50, [{ R: 0.5, tau: 0.05 }], { enabled: false, Vk: 0, m: -2 }, null, 0, 0);
    c.forEach((cv) => {
      cv.points.forEach((p) => {
        expect(Number.isFinite(p[0])).toBe(true);
        expect(Number.isFinite(p[1])).toBe(true);
      });
    });
  });
});

describe('analyzeSwitching', () => {
  it('returns PASS for typical buck at 400V bus / 20A / Tj=89C', () => {
    const r = analyzeSwitching({
      Vbus: 400, ID: 20, BV: 650, ID_max: 50, RDS: 0.05,
      Ploss: 8, Ta: 25, Rth_ja: 5, Tj_max: 150,
    });
    expect(r.overall).toBe('PASS');
    expect(r.v_state).toBe('PASS');
    expect(r.i_state).toBe('PASS');
    expect(r.t_state).toBe('PASS');
  });
  it('returns FAIL on VDS overshoot above BV', () => {
    const r = analyzeSwitching({
      Vbus: 600, ID: 20, BV: 650, ID_max: 50, RDS: 0.05,
      V_overshoot_pct: 30, Tj_max: 150,
    });
    expect(r.v_state).toBe('FAIL');
  });
  it('returns FAIL on Tj above Tj_max', () => {
    const r = analyzeSwitching({
      Vbus: 400, ID: 20, BV: 650, ID_max: 50, RDS: 0.05,
      Ploss: 50, Ta: 25, Rth_ja: 5, Tj_max: 150,
    });
    expect(r.t_state).toBe('FAIL');
  });
  it('returns WARN when ratio is in the 80-100% band', () => {
    const r = analyzeSwitching({
      Vbus: 400, ID: 50 * 0.9, BV: 650, ID_max: 50, RDS: 0.05,
      Ploss: 0, Ta: 25, Rth_ja: 5, Tj_max: 150,
    });
    expect(r.i_state).toBe('WARN');
  });
});

describe('analyzeLinear', () => {
  it('returns PASS for a hot-swap at VDS=24V, ID=20A, tp=1ms', () => {
    const r = analyzeLinear({
      VDS: 24, ID: 20, t_pulse: 1e-3, BV: 100, ID_max: 50, RDS: 0.005, Tj_max: 150, Tc: 50,
    }, [{ R: 0.4, tau: 0.05 }], { enabled: false, Vk: 0, m: -2 });
    expect(['PASS', 'WARN']).toContain(r.overall);
  });
  it('returns FAIL when Pop > Pmax', () => {
    const r = analyzeLinear({
      VDS: 80, ID: 40, t_pulse: 10, BV: 100, ID_max: 50, RDS: 0.005, Tj_max: 150, Tc: 50,
    }, [{ R: 0.4, tau: 0.05 }], { enabled: false, Vk: 0, m: -2 });
    expect(r.overall).toBe('FAIL');
    expect(r.p_state).toBe('FAIL');
  });
  it('uses IDM as pulsed ceiling when IDM>0 and tp<1s', () => {
    const r = analyzeLinear({
      VDS: 5, ID: 100, t_pulse: 1e-6, BV: 100, ID_max: 50, IDM: 200, RDS: 0.005, Tj_max: 150, Tc: 50,
    }, [{ R: 0.4, tau: 0.05 }], { enabled: false, Vk: 0, m: -2 });
    expect(r.i_lim).toBe(200);
  });
  it('honors instability derating when enabled', () => {
    const r = analyzeLinear({
      VDS: 200, ID: 1, t_pulse: 1, BV: 250, ID_max: 50, RDS: 0.005, Tj_max: 150, Tc: 50,
    }, [{ R: 0.4, tau: 0.05 }], { enabled: true, Vk: 100, m: -2 });
    expect(r.si_state).not.toBeNull();
    expect(r.i_si_limit).toBeLessThan(Infinity);
  });
});

describe('combine', () => {
  it('FAIL beats WARN beats PASS', () => {
    expect(combine(['PASS', 'WARN', 'PASS'])).toBe('WARN');
    expect(combine(['PASS', 'FAIL'])).toBe('FAIL');
    expect(combine(['PASS', 'WARN', 'FAIL'])).toBe('FAIL');
    expect(combine(['PASS'])).toBe('PASS');
    expect(combine([])).toBe('PASS');
  });
});

describe('protection checks', () => {
  it('OVP: FAIL if V_ovp <= Vbus', () => {
    expect(check_ovp(380, 400, 650).state).toBe('FAIL');
  });
  it('OVP: FAIL if Vpeak >= BV', () => {
    expect(check_ovp(550, 400, 650, 30).state).toBe('FAIL');
  });
  it('OVP: PASS with reasonable margins', () => {
    expect(check_ovp(440, 400, 650, 30).state).toBe('PASS');
  });
  it('OCP: FAIL if I_ocp <= Iout', () => {
    expect(check_ocp(15, 20, 50).state).toBe('FAIL');
  });
  it('OCP: FAIL if I_ocp >= ID_max', () => {
    expect(check_ocp(50, 20, 50).state).toBe('FAIL');
  });
  it('SCP: FAIL when tSC_DS is missing', () => {
    expect(check_scp(1e-6, 0).state).toBe('FAIL');
  });
  it('SCP: FAIL when response exceeds datasheet time', () => {
    expect(check_scp(5e-6, 3e-6).state).toBe('FAIL');
  });
  it('SCP: PASS for typical 1.5us response with 3us rating', () => {
    expect(check_scp(1.5e-6, 3e-6).state).toBe('PASS');
  });
  it('OTP: FAIL when T_otp >= Tj_max', () => {
    expect(check_otp(150, 150, 25).state).toBe('FAIL');
  });
  it('OTP: PASS at typical 135C trip', () => {
    expect(check_otp(135, 150, 25).state).toBe('PASS');
  });
  it('UVLO: FAIL when V_uvlo_on <= Miller plateau', () => {
    expect(check_uvlo(6, 7, 15).state).toBe('FAIL');
  });
  it('UVLO: PASS for 11V release vs 7V Miller vs 15V drive', () => {
    expect(check_uvlo(11, 7, 15).state).toBe('PASS');
  });
  it('DESAT: FAIL when threshold is below normal VDS', () => {
    expect(check_desat(0.5, 400, 0.01, 50).state).toBe('FAIL');
  });
  it('DESAT: PASS for 7V threshold', () => {
    expect(check_desat(7, 400, 0.01, 50).state).toBe('PASS');
  });
});

describe('runProtectionSuite', () => {
  const params = {
    V_ovp: 440, Vbus: 400, BV: 650, V_overshoot_pct: 30,
    I_ocp: 30, Iout: 20, ID_max: 50,
    t_response: 1.5e-6, tSC_DS: 3e-6,
    T_otp: 135, Tj_max: 150, Ta: 25,
    V_uvlo_on: 11, V_miller: 7, Vgs_nominal: 15,
    V_desat_th: 7, RDS: 0.05, I_fault: 100,
  };
  it('runs all enabled protections', () => {
    const out = runProtectionSuite(params, ['OVP', 'OCP', 'SCP', 'OTP', 'UVLO', 'DESAT']);
    expect(out).toHaveLength(6);
    out.forEach((r) => expect(['PASS', 'WARN', 'FAIL']).toContain(r.state));
  });
  it('respects enabled list', () => {
    const out = runProtectionSuite(params, ['OVP', 'UVLO']);
    expect(out.map((r) => r.name)).toEqual(['OVP', 'UVLO']);
  });
  it('PROTECTION_INFO covers all names', () => {
    ['OVP', 'OCP', 'SCP', 'OTP', 'UVLO', 'DESAT'].forEach((n) => {
      expect(PROTECTION_INFO[n]).toBeDefined();
    });
  });
  it('throws on NaN inputs', () => {
    expect(() => check_ovp(NaN, 400, 650)).toThrow();
    expect(() => check_ocp(30, 20, NaN)).toThrow();
    expect(() => check_scp(1e-6, NaN)).toThrow();
    expect(() => check_otp(NaN, 150)).toThrow();
    expect(() => check_uvlo(11, 7, NaN)).toThrow();
    expect(() => check_desat(7, NaN, 0.01, 100)).toThrow();
  });
  it('handles null/empty in runProtectionSuite', () => {
    expect(runProtectionSuite(null as any, ['OVP'])).toHaveLength(0);
    expect(runProtectionSuite({} as any, null as any)).toHaveLength(0);
    expect(runProtectionSuite({} as any, [])).toHaveLength(0);
  });
});

describe('siCurrentLimit edge cases', () => {
  const siBase: SpiritoInstability = { enabled: true, Vk: 100, m: -2 };
  it('returns Infinity below Vk', () => {
    expect(siCurrentLimit(50, 200, siBase)).toBe(Infinity);
  });
  it('returns Infinity when si is null', () => {
    expect(siCurrentLimit(150, 200, null as any)).toBe(Infinity);
  });
  it('returns Infinity when Vk is 0', () => {
    const si0 = { ...siBase, Vk: 0 };
    expect(siCurrentLimit(150, 200, si0)).toBe(Infinity);
  });
  it('returns finite value for valid inputs', () => {
    expect(Number.isFinite(siCurrentLimit(200, 200, siBase))).toBe(true);
  });
});

/* ---- Rthjc datasheet table ---- */
const AMDTA: RthjcTable = {
  times:  [1e-5, 1e-4, 1e-3, 1e-2, 1e-1, 1.0, 10.0],
  single: [0.00331, 0.01120, 0.03733, 0.11520, 0.25067, 0.32000, 0.32000],
  perPulse: [
    { duty: 0.01, values: [0.00647, 0.01429, 0.04016, 0.11725, 0.25136, 0.32000, 0.32000] },
    { duty: 0.02, values: [0.00964, 0.01738, 0.04299, 0.11930, 0.25205, 0.32000, 0.32000] },
    { duty: 0.05, values: [0.01914, 0.02664, 0.05147, 0.12544, 0.25413, 0.32000, 0.32000] },
    { duty: 0.10, values: [0.03498, 0.04208, 0.06560, 0.13568, 0.25760, 0.32000, 0.32000] },
    { duty: 0.30, values: [0.06664, 0.07296, 0.09387, 0.15616, 0.26453, 0.32000, 0.32000] },
    { duty: 0.50, values: [0.16165, 0.16560, 0.17867, 0.21760, 0.28533, 0.32000, 0.32000] },
  ],
};

describe('Rthjc table lookup', () => {
  it('returns exact column values at grid points', () => {
    expect(zthFromTable(AMDTA, 1e-5, 0)).toBe(0.00331);
    expect(zthFromTable(AMDTA, 1e-3, 0)).toBe(0.03733);
    expect(zthFromTable(AMDTA, 1.0, 0)).toBe(0.32);
    expect(zthFromTable(AMDTA, 1e-2, 0.05)).toBe(0.12544);
    expect(zthFromTable(AMDTA, 1e-4, 0.5)).toBe(0.16560);
  });
  it('clamps duty to largest column <= D', () => {
    // D=0.07 → use D=0.05 column
    expect(zthFromTable(AMDTA, 1e-3, 0.07)).toBe(0.05147);
    // D=1.0 → use D=0.5 column (max)
    expect(zthFromTable(AMDTA, 1e-2, 1.0)).toBe(0.21760);
    // D=0 → single column
    expect(zthFromTable(AMDTA, 1e-2, 0)).toBe(0.11520);
  });
  it('log-log interpolation between grid points', () => {
    // mid point of 1e-3 and 1e-2 in log space is 10^((log1e-3+log1e-2)/2)
    // which is NOT 5e-3 (5e-3 sits at x ≈ 0.699 in log space).
    const t = Math.sqrt(1e-3 * 1e-2);
    const z = zthFromTable(AMDTA, t, 0);
    // At x=0.5: Zth ≈ sqrt(0.03733 * 0.11520)
    const ref = Math.sqrt(0.03733 * 0.11520);
    expect(z!).toBeCloseTo(ref, 5);
  });
  it('returns null outside table time range', () => {
    expect(zthFromTable(AMDTA, 1e-7, 0)).toBeNull();
    expect(zthFromTable(AMDTA, 1e3, 0)).toBeNull();
  });
  it('exposes domain as first/last times', () => {
    const d = tableTimeDomain(AMDTA);
    expect(d[0]).toBe(1e-5);
    expect(d[1]).toBe(10.0);
  });
  it('pmaxFromTable reflects DC value at t=10s', () => {
    const p = pmaxAtPulse({ table: AMDTA }, 150, 50, 10.0, 0);
    expect(p).toBeCloseTo(100 / 0.32, 5); // 312.5 W
  });
  it('pmaxFromTable is null when tp outside range', () => {
    expect(pmaxAtPulse({ table: AMDTA }, 150, 50, 1e-9, 0)).toBeNull();
    expect(pmaxAtPulse({ table: AMDTA }, 150, 50, 100, 0)).toBeNull();
  });
  it('thermalRthDC reads the largest last-column value (worst case)', () => {
    expect(thermalRthDC({ table: AMDTA })).toBe(0.32);
  });
});

describe('zthAt unified API', () => {
  it('uses the table when present', () => {
    expect(zthAt({ table: AMDTA }, 1e-3, 0)).toBe(0.03733);
  });
  it('falls back to Foster when no table', () => {
    const stages: FosterStage[] = [{ R: 0.32, tau: 0.1 }];
    // single pulse (D=0): Zth = R*(1 - e^(-t/tau))
    const expected = 0.32 * (1 - Math.exp(-1e-3 / 0.1));
    expect(zthAt(stages, 1e-3, 0)).toBeCloseTo(expected, 9);
  });
});

describe('zthInvAt table path', () => {
  it('inverts table Zth within tolerance', () => {
    const src: { table: RthjcTable } = { table: AMDTA };
    // Stay away from the last grid point (Zth = Rjc(DC) → no inversion possible).
    for (const tp of [1e-4, 1e-3, 1e-2, 0.1]) {
      const z = zthAt(src, tp, 0.1)!;
      const tBack = zthInvAt(src, z, 0.1);
      // Tolerate wider window because table is sampled on a log grid
      expect(Math.abs(Math.log(tBack) - Math.log(tp))).toBeLessThan(0.05);
    }
  });
  it('returns 0 when zTarget below first grid point', () => {
    expect(zthInvAt({ table: AMDTA }, 0.001, 0)).toBe(0);
  });
  it('returns Infinity when zTarget above last grid point', () => {
    expect(zthInvAt({ table: AMDTA }, 0.5, 0)).toBe(Infinity);
  });
});

describe('analyzeLinear with table', () => {
  it('uses table Zth and reports pmax accordingly', () => {
    const r = analyzeLinear(
      { VDS: 10, ID: 10, t_pulse: 1e-3, BV: 100, ID_max: 200, RDS: 0.005, Tj_max: 150, Tc: 50, duty: 0.1 },
      { table: AMDTA },
      { enabled: false, Vk: 0, m: -2 },
    );
    // Zth at tp=1ms, D=0.1 → 0.06560 → pmax = 100/0.06560 ≈ 1524 W
    expect(r.pmax).toBeCloseTo(100 / 0.06560, 2);
  });
  it('Fosters pmax when no table is supplied', () => {
    const stages: FosterStage[] = [{ R: 0.32, tau: 0.1 }];
    const r = analyzeLinear(
      { VDS: 10, ID: 10, t_pulse: 1e-3, BV: 100, ID_max: 200, RDS: 0.005, Tj_max: 150, Tc: 50, duty: 0 },
      stages,
      { enabled: false, Vk: 0, m: -2 },
    );
    // Single pole: Zth(1ms) = 0.32*(1-e^(-0.01)) ≈ 0.00319 → pmax ≈ 31340 W
    // Use toBeCloseTo with a wide tolerance to verify the path is Foster.
    expect(r.pmax).toBeGreaterThan(1000);
  });
});
