import { useEffect, useState, useCallback, useRef } from 'react';
import {
  PARAMS, DEV_KEYS, OP_LIN_KEYS, PROT_KEYS,
  type ParamMeta,
} from './engine/paramMeta';
import {
  parseNum,
  runProtectionSuite, combine, PROTECTION_INFO,
} from './engine/soaEngine';
import {
  RAW_SOA_CURVES, checkOperatingPoint,
  type OpCheckResult,
} from './engine/soaRawData';
import type { DeviceRecord } from './engine/deviceDatabase';
import { getDeviceDatabase } from './engine/deviceDatabase';
import { ParamTable, type ParamValues } from './components/ParamTable';
import { SoaChart, type SoaChartHandle } from './components/SoaChart';
import { SoaResultDetail } from './components/SoaResultDetail';
import { ProtectionResults } from './components/ProtectionResults';

import { DevicePicker } from './components/DevicePicker';
import { DatasheetImport } from './components/DatasheetImport';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useToast } from './components/Toast';

type Tab = 'soa' | 'prot';

function defaultValues(keys: readonly string[]): ParamValues {
  const out: ParamValues = {};
  keys.forEach((k) => { out[k] = PARAMS[k].typ; });
  return out;
}

const DEFAULT_PROT_ENABLED: Record<string, boolean> = {
  OVP: true, OCP: true, SCP: true, OTP: true, UVLO: true, DESAT: true,
};

export default function App() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('soa');

  const [devVals, setDevVals] = useState<ParamValues>(defaultValues(DEV_KEYS));
  const [opVals, setOpVals] = useState<ParamValues>(defaultValues(OP_LIN_KEYS));
  const [protVals, setProtVals] = useState<ParamValues>(defaultValues(PROT_KEYS));

  const [protEnabled, setProtEnabled] = useState<Record<string, boolean>>(DEFAULT_PROT_ENABLED);

  const [soaCheck, setSoaCheck] = useState<OpCheckResult | null>(null);
  const [protResults, setProtResults] = useState<Array<import('./engine/soaEngine').ProtectionResult>>([]);
  const [protOverall, setProtOverall] = useState<string>('IDLE');

  const [pickerOpen, setPickerOpen] = useState(false);
  const [importerOpen, setImporterOpen] = useState(false);
  const [pickedDevice, setPickedDevice] = useState<DeviceRecord | null>(null);
  const configInputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<SoaChartHandle>(null);

  const [err, setErr] = useState<string | null>(null);
  const [protErr, setProtErr] = useState<string | null>(null);
  const [computing, setComputing] = useState(false);

  const recomputeTimer = useRef<number | null>(null);

  const [devWarnings, setDevWarnings] = useState<Set<string>>(new Set());
  const [opWarnings, setOpWarnings] = useState<Set<string>>(new Set());
  const [protWarnings, setProtWarnings] = useState<Set<string>>(new Set());

  const [devErrors, setDevErrors] = useState<Set<string>>(new Set());
  const [opErrors, setOpErrors] = useState<Set<string>>(new Set());
  const [protFieldErrors, setProtFieldErrors] = useState<Set<string>>(new Set());

  const gatherAndCompute = useCallback(() => {
    setErr(null);

    const devParsed: Record<string, number> = {};
    const devErrs: string[] = [];
    const devWarnKeys = new Set<string>();
    for (const k of DEV_KEYS) {
      const meta: ParamMeta = PARAMS[k];
      const raw = devVals[k] ?? '';
      if (meta.opt && raw.trim() === '') {
        devParsed[k] = 0;
        continue;
      }
      try {
        const v = parseNum(raw);
        if (!Number.isFinite(v)) throw new Error('nan');
        if (meta.pos && !(v > 0)) throw new Error('pos');
        if (meta.nonneg && v < 0) throw new Error('neg');
        devParsed[k] = v;
        if (v < meta.min || v > meta.max) devWarnKeys.add(k);
      } catch {
        devErrs.push(k);
      }
    }
    const opKeys = OP_LIN_KEYS;
    const opParsed: Record<string, number> = {};
    const opErrs: string[] = [];
    const opWarnKeys = new Set<string>();
    for (const k of opKeys) {
      const meta = PARAMS[k];
      const raw = opVals[k] ?? '';
      if (meta.opt && raw.trim() === '') {
        opParsed[k] = 0;
        continue;
      }
      try {
        const v = parseNum(raw);
        if (!Number.isFinite(v)) throw new Error('nan');
        if (meta.pos && !(v > 0)) throw new Error('pos');
        if (meta.nonneg && v < 0) throw new Error('neg');
        opParsed[k] = v;
        if (v < meta.min || v > meta.max) opWarnKeys.add(k);
      } catch {
        opErrs.push(k);
      }
    }
    setDevWarnings(devWarnKeys);
    setOpWarnings(opWarnKeys);
    setDevErrors(new Set(devErrs));
    setOpErrors(new Set(opErrs));
    if (devErrs.length || opErrs.length) {
      const parts: string[] = [];
      if (devErrs.length) parts.push('Device: ' + devErrs.join(', '));
      if (opErrs.length) parts.push('Operating: ' + opErrs.join(', '));
      const detail = devErrs.map((k) => {
        const meta = PARAMS[k];
        return `??${k}: enter a${meta.pos ? ' positive' : ''} number${meta.opt ? ' (or leave blank)' : ''}`;
      }).concat(opErrs.map((k) => {
        const meta = PARAMS[k];
        return `??${k}: enter a${meta.pos ? ' positive' : ''} number${meta.opt ? ' (or leave blank)' : ''}`;
      })).join('\n');
      setErr(detail);
      setSoaCheck(null);
      return;
    }

    const BV = devParsed['BV'];
    const ID_max = devParsed['ID_max'];
    const IDM = devParsed['IDM'] ?? 0;
    const RDS = devParsed['RDS'] ?? 0;
    const VDS = opParsed['VDS'];
    const ID = opParsed['ID'];
    const t_pulse = opParsed['t_pulse'];

    try {
      const check = checkOperatingPoint(RAW_SOA_CURVES, VDS, ID, t_pulse, ID_max, IDM, BV, RDS);
      setSoaCheck(check);
    } catch (e: unknown) {
      setErr('Check error: ' + (e instanceof Error ? e.message : String(e)));
      setSoaCheck(null);
    } finally {
      setComputing(false);
    }
  }, [devVals, opVals]);

  const runProtectionCheck = useCallback(() => {
    setProtErr(null);
    const p: Record<string, number> = {};
    const errs: string[] = [];
    const warnKeys = new Set<string>();
    for (const k of PROT_KEYS) {
      const meta = PARAMS[k];
      try {
        const v = parseNum(protVals[k] ?? '');
        if (!Number.isFinite(v)) throw new Error('nan');
        if (meta.pos && !(v > 0)) throw new Error('pos');
        if (meta.nonneg && v < 0) throw new Error('neg');
        p[k] = v;
        if (v < meta.min || v > meta.max) warnKeys.add(k);
      } catch {
        errs.push(k);
      }
    }
    setProtWarnings(warnKeys);
    setProtFieldErrors(new Set(errs));
    if (errs.length) {
      const detail = errs.map((k) => {
        const meta = PARAMS[k];
        return `??${k}: enter a${meta.pos ? ' positive' : ''} number`;
      }).join('\n');
      setProtErr(detail);
      setProtResults([]);
      setProtOverall('IDLE');
      return;
    }
    const enabled = Object.keys(protEnabled).filter((n) => protEnabled[n]);
    if (!enabled.length) {
      setProtErr('Tick at least one protection to test.');
      setProtResults([]);
      setProtOverall('IDLE');
      return;
    }
    try {
      const results = runProtectionSuite(p, enabled);
      setProtResults(results);
      const states = results.map((r) => r.state);
      setProtOverall(combine(states));
    } catch (e: unknown) {
      setProtErr('Calculation error: ' + (e instanceof Error ? e.message : String(e)));
    }
  }, [protVals, protEnabled]);

  const handleRun = useCallback(() => {
    setComputing(true);
    setTimeout(() => {
      gatherAndCompute();
      runProtectionCheck();
    }, 30);
  }, [gatherAndCompute, runProtectionCheck]);

  useEffect(() => {
    if (recomputeTimer.current) window.clearTimeout(recomputeTimer.current);
    recomputeTimer.current = window.setTimeout(() => {
      recomputeAndProt();
    }, 30);
    return () => {
      if (recomputeTimer.current) window.clearTimeout(recomputeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devVals, opVals, protVals, protEnabled]);

  const recomputeAndProt = useCallback(() => {
    gatherAndCompute();
    runProtectionCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gatherAndCompute, runProtectionCheck]);

  useEffect(() => {
    recomputeAndProt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        if (tab === 'soa') gatherAndCompute();
        else runProtectionCheck();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tab, gatherAndCompute, runProtectionCheck]);

  const onDevChange = (k: string, v: string) => setDevVals((p) => ({ ...p, [k]: v }));
  const onOpChange = (k: string, v: string) => setOpVals((p) => ({ ...p, [k]: v }));
  const onOpPointMove = useCallback((newVds: number, newId: number) => {
    setOpVals((p) => ({
      ...p,
      VDS: String(Math.round(newVds * 100) / 100),
      ID: String(Math.round(newId * 100) / 100),
    }));
  }, []);
  const onProtChange = (k: string, v: string) => setProtVals((p) => ({ ...p, [k]: v }));

  const applyDevice = (dev: DeviceRecord) => {
    setPickedDevice(dev);
    const next: ParamValues = { ...devVals };
    next['BV'] = String(dev.BV);
    next['ID_max'] = String(dev.ID_max);
    next['RDS'] = String(dev.RDS);
    next['Tj_max'] = String(dev.Tj_max);
    if (dev.IDM) next['IDM'] = String(dev.IDM); else next['IDM'] = '';
    setDevVals(next);
  };

  const applyExtracted = (dev: Partial<DeviceRecord>) => {
    const next: ParamValues = { ...devVals };
    if (typeof dev.BV === 'number') next['BV'] = String(dev.BV);
    if (typeof dev.ID_max === 'number') next['ID_max'] = String(dev.ID_max);
    if (typeof dev.RDS === 'number') next['RDS'] = String(dev.RDS);
    if (typeof dev.Tj_max === 'number') next['Tj_max'] = String(dev.Tj_max);
    if (typeof dev.IDM === 'number') next['IDM'] = String(dev.IDM); else if ('IDM' in dev) next['IDM'] = '';
    setDevVals(next);
    if (dev.partNumber) setPickedDevice({ ...(dev as DeviceRecord), id: dev.id ?? 'imported' });
  };

  const saveCurrentAsDevice = async () => {
    try {
      const idBase = (pickedDevice?.partNumber ?? 'custom').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const id = `custom-${idBase}-${Date.now().toString(36)}`;
      const dev: DeviceRecord = {
        id,
        manufacturer: pickedDevice?.manufacturer ?? 'Custom',
        partNumber: pickedDevice?.partNumber ?? idBase,
        technology: pickedDevice?.technology ?? 'Si',
        package: pickedDevice?.package,
        description: pickedDevice?.description,
        BV: parseNum(devVals['BV']),
        ID_max: parseNum(devVals['ID_max']),
        IDM: devVals['IDM'] && devVals['IDM'].trim() !== '' ? parseNum(devVals['IDM']) : undefined,
        RDS: parseNum(devVals['RDS']),
        Tj_max: parseNum(devVals['Tj_max']),
        Rjc: 0,
        tSC_DS: protVals['tSC_DS'] && protVals['tSC_DS'].trim() !== '' ? parseNum(protVals['tSC_DS']) : undefined,
        datasheetUrl: pickedDevice?.datasheetUrl,
        verifiedAt: new Date().toISOString(),
      };
      await getDeviceDatabase().upsert(dev);
      setPickedDevice(dev);
      toast(`Saved "${dev.partNumber}" to local device database.`, 'success');
    } catch (e: unknown) {
      toast('Failed to save device: ' + (e instanceof Error ? e.message : String(e)), 'error');
    }
  };

  const saveConfig = () => {
    const config = { devVals, opVals, protVals, protEnabled };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soa-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Configuration saved.', 'success');
  };

  const loadConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const cfg = JSON.parse(ev.target?.result as string);
        if (!cfg || typeof cfg !== 'object') {
          throw new Error('Invalid config structure');
        }
        if (typeof cfg.devVals !== 'object' || typeof cfg.opVals !== 'object') {
          throw new Error('Config missing device/operating values');
        }
        if (cfg.protEnabled != null && (typeof cfg.protEnabled !== 'object' || Array.isArray(cfg.protEnabled))) {
          throw new Error('Config protEnabled must be an object');
        }
        setDevVals(cfg.devVals);
        setOpVals(cfg.opVals);
        setProtVals(cfg.protVals ?? {});
        if (cfg.protEnabled) {
          setProtEnabled({ ...DEFAULT_PROT_ENABLED, ...cfg.protEnabled });
        }
        toast('Configuration loaded.', 'success');
      } catch (e: unknown) {
        toast('Failed to load config: ' + (e instanceof Error ? e.message : String(e)), 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const overall = soaCheck?.verdict ?? 'IDLE';

  const copyResults = useCallback(() => {
    if (!soaCheck) return;
    const lines: string[] = [
      `SOA Result: ${soaCheck.verdict}`,
      `VDS check, ID check, ${soaCheck.curveLabel}: ${soaCheck.operatingId}A vs limit ${soaCheck.maxId === Infinity ? '∞' : soaCheck.maxId.toFixed(1)}A`,
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      toast('Results copied to clipboard.', 'success');
    });
  }, [soaCheck]);

  const copyProtResults = useCallback(() => {
    if (!protResults.length) return;
    const lines = [`Protection Suite: ${protOverall}`];
    protResults.forEach((r) => lines.push(`${r.name}: ${r.state} ??${r.msg}`));
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      toast('Protection results copied to clipboard.', 'success');
    });
  }, [protResults, protOverall]);

  const showBanner = (ov: string) => {
    if (ov === 'IDLE') {
      return { cls: 'banner idle', text: 'Enter values and press Check SOA' };
    }
    if (ov === 'PASS') return { cls: 'banner pass', text: 'PASS' };
    if (ov === 'WARN') return { cls: 'banner warn', text: 'MARGINAL' };
    return { cls: 'banner fail', text: 'FAIL' };
  };
  const sb = showBanner(overall);

  const protBanner = (() => {
    if (protOverall === 'IDLE') return { cls: 'banner idle', text: 'Select protections and press Run' };
    if (protOverall === 'PASS') return { cls: 'banner pass', text: 'ALL PASS' };
    if (protOverall === 'WARN') return { cls: 'banner warn', text: 'PASS WITH WARNINGS' };
    return { cls: 'banner fail', text: 'PROTECTION FAIL' };
  })();

  const parsedOp = (() => {
    try {
      return {
        vds: parseNum(opVals['VDS'] ?? ''),
        id: parseNum(opVals['ID'] ?? ''),
        t_pulse: parseNum(opVals['t_pulse'] ?? ''),
      };
    } catch { return null; }
  })();
  const parsedDev = (() => {
    try {
      return {
        bv: parseNum(devVals['BV'] ?? ''),
        idMax: parseNum(devVals['ID_max'] ?? ''),
        idm: devVals['IDM']?.trim() ? parseNum(devVals['IDM']) : 0,
        rds: parseNum(devVals['RDS'] ?? ''),
      };
    } catch { return null; }
  })();

  return (
    <div className="app">
      <header className="topbar">
        <h1>Safe Operating Area Calculator</h1>
        <div className="topbar-actions">
          <button className="topbtn" onClick={() => setPickerOpen(true)}>Device DB</button>
          <button className="topbtn" onClick={() => setImporterOpen(true)}>Import</button>
          <button className="topbtn" onClick={saveConfig}>Save</button>
          <button className="topbtn" onClick={() => configInputRef.current?.click()}>Load</button>
          <input ref={configInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={loadConfig} />
        </div>
      </header>

      <nav className="tabs" onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          setTab((t) => t === 'soa' ? 'prot' : 'soa');
        }
      }}>
        <button className={'tab' + (tab === 'soa' ? ' active' : '')} onClick={() => setTab('soa')}>
          SOA Check
        </button>
        <button className={'tab' + (tab === 'prot' ? ' active' : '')} onClick={() => setTab('prot')}>
          Protection
        </button>
      </nav>

      <main>
        {tab === 'soa' ? (
          <div className="app-layout">
            <div className="top-row">
              <aside className="panel inputs">
                <div className="input-row-3">
                  <div className="group">
                    <div className="group-h">Device Parameters</div>
                    <div className="group-b">
                      <ParamTable
                        keys={DEV_KEYS}
                        values={devVals}
                        onChange={onDevChange}
                        errors={devErrors}
                        warnings={devWarnings}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <div className="group-h">Operating Point (Linear)</div>
                    <div className="group-b">
                      <ParamTable
                        keys={OP_LIN_KEYS}
                        values={opVals}
                        onChange={onOpChange}
                        errors={opErrors}
                        warnings={opWarnings}
                      />
                    </div>
                  </div>

                </div>

                {err && (
                  <div className="err-msg show">
                    <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                    <button className="err-dismiss" onClick={() => setErr(null)} aria-label="Dismiss error">×</button>
                  </div>
                )}
                <button className="run-btn" onClick={handleRun} disabled={computing}>
                  {computing ? 'Running...' : 'Run SOA Check'}
                </button>
              </aside>

              <section className="results">
                <div className={sb.cls}>
                  <span>{sb.text}</span>
                  {soaCheck && (
                    <button className="banner-copy" onClick={copyResults} title="Copy results to clipboard" aria-label="Copy results to clipboard">📋</button>
                  )}
                </div>

                <div className="detail">
                  <ErrorBoundary key={soaCheck ? 'detail-has-data' : 'detail-empty'} label="SoaResultDetail">
                    {soaCheck && parsedDev ? (
                      <SoaResultDetail
                        check={soaCheck}
                        vds={parsedOp?.vds ?? 0}
                        bv={parsedDev.bv}
                        idMax={parsedDev.idMax}
                        idm={parsedDev.idm}
                        t_pulse={parsedOp?.t_pulse ?? 1e-3}
                      />
                    ) : (
                      <div className="muted">Awaiting valid inputs.</div>
                    )}
                  </ErrorBoundary>
                </div>

                <div className="card chart-card">
                  <div className="card-h">
                    SOA Diagram
                    <button className="chart-export-hdr" onClick={() => chartRef.current?.exportSvg()} title="Export SVG" aria-label="Export SVG">
                      <svg viewBox="0 0 16 16"><path d="M8 1v9l3-3 1 1-5 5-5-5 1-1 3 3V1h2z"/><path d="M1 13v2h14v-2"/></svg>
                      SVG
                    </button>
                  </div>
                  <ErrorBoundary key={soaCheck ? 'chart-has-data' : 'chart-empty'} label="SoaChart">
                    {soaCheck && parsedOp && parsedDev ? (
                      <SoaChart
                        ref={chartRef}
                        curves={RAW_SOA_CURVES}
                        vds={parsedOp.vds}
                        id={parsedOp.id}
                        t_pulse={parsedOp.t_pulse}
                        bv={parsedDev.bv}
                        idMax={parsedDev.idMax}
                        idm={parsedDev.idm}
                        rds={parsedDev.rds}
                        verdict={soaCheck.verdict}
                        onOpMove={onOpPointMove}
                      />
                    ) : (
                      <div className="chart-empty">Enter parameters to render the SOA curve.</div>
                    )}
                  </ErrorBoundary>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="app-layout">
            <div className="top-row" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
              <aside className="panel inputs">
                <div className="prot-row-2">
                  <div className="group">
                    <div className="group-h">Protections</div>
                    <div className="group-b">
                      <div className="prot-list">
                        {Object.entries(PROTECTION_INFO).map(([name]) => {
                          return (
                            <label className="prot-chk" key={name}>
                              <input
                                type="checkbox"
                                checked={protEnabled[name] ?? false}
                                onChange={(e) => setProtEnabled((p) => ({ ...p, [name]: e.target.checked }))}
                              />
                              <span className="pc-t"><b>{name}</b></span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="group">
                    <div className="group-h">Parameters</div>
                    <div className="group-b">
                      <div className="scrollbox prot-params-2col">
                        <ParamTable
                          keys={PROT_KEYS.slice(0, 9)}
                          values={protVals}
                          onChange={onProtChange}
                          errors={protFieldErrors}
                          warnings={protWarnings}
                        />
                        <ParamTable
                          keys={PROT_KEYS.slice(9)}
                          values={protVals}
                          onChange={onProtChange}
                          errors={protFieldErrors}
                          warnings={protWarnings}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {protErr && (
                  <div className="err-msg show">
                    <span>{protErr}</span>
                    <button className="err-dismiss" onClick={() => setProtErr(null)} aria-label="Dismiss error">×</button>
                  </div>
                )}
                <button className="run-btn" onClick={runProtectionCheck} disabled={computing}>
                  {computing ? 'Running...' : 'Run Protection Check'}
                </button>
              </aside>

              <section className="results">
                <div className={protBanner.cls}>
                  <span>{protBanner.text}</span>
                  {protResults.length > 0 && (
                    <button className="banner-copy" onClick={copyProtResults} title="Copy protection results to clipboard" aria-label="Copy protection results to clipboard">📋</button>
                  )}
                </div>
                {protWarnings.size > 0 && (
                  <div className="advisory show">
                    <div className="adv-h">??Out of typical range</div>
                    <ul>
                      {Array.from(protWarnings).map((k) => {
                        const m = PARAMS[k];
                        return <li key={k}>{k} is outside the typical range [{m.min}, {m.max}]</li>;
                      })}
                    </ul>
                  </div>
                )}
                <ErrorBoundary key={`prot-${protResults.length}`} label="ProtectionResults">
                  <ProtectionResults results={protResults} />
                </ErrorBoundary>
              </section>
            </div>
          </div>
        )}
      </main>

      <footer>
        MOSFET SOA Calculator · all computation is local.
      </footer>

      <DevicePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(d) => { applyDevice(d); setPickerOpen(false); }}
      />
      <DatasheetImport
        open={importerOpen}
        onClose={() => setImporterOpen(false)}
        onApply={applyExtracted}
      />
    </div>
  );
}
