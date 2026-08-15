import { memo } from 'react';
import type { OpCheckResult } from '../engine/soaRawData';

interface SoaResultDetailProps {
  check: OpCheckResult;
  vds: number;
  bv: number;
  idMax: number;
  idm: number;
  t_pulse: number;
}

function Chip({ state, children }: { state: string; children?: React.ReactNode }) {
  return <span className={'chip ' + state}>{children ?? state}</span>;
}

export const SoaResultDetail = memo(function SoaResultDetail({ check, vds, bv, idMax, idm, t_pulse }: SoaResultDetailProps) {
  const iLimit = idm > 0 ? idm : idMax;

  const pulseLabel = t_pulse >= 1 ? `${t_pulse}s` :
    t_pulse >= 1e-3 ? `${(t_pulse * 1e3).toFixed(0)}ms` :
    t_pulse >= 1e-6 ? `${(t_pulse * 1e6).toFixed(0)}µs` :
    `${t_pulse.toExponential(1)}s`;

  return (
    <>
      <div className="d-op">V<sub>DS</sub>={vds.toFixed(1)}V × I<sub>D</sub>={check.operatingId.toFixed(1)}A = {(vds * check.operatingId).toFixed(1)} W</div>
      <div className="crow">
        <span className="c-lab">V<sub>DS</sub></span>
        <span className="c-val">{vds.toFixed(1)} V <span className="sub">vs BVDSS {bv}V</span></span>
        <Chip state={vds > bv ? 'FAIL' : vds > 0.8 * bv ? 'WARN' : 'PASS'} />
      </div>
      <div className="crow">
        <span className="c-lab">I<sub>D</sub></span>
        <span className="c-val">{check.operatingId.toFixed(1)} A <span className="sub">vs {idm > 0 ? 'IDM' : 'ID(max)'} {iLimit}A</span></span>
        <Chip state={check.operatingId > iLimit ? 'FAIL' : check.operatingId > 0.8 * iLimit ? 'WARN' : 'PASS'} />
      </div>
      <div className="crow">
        <span className="c-lab">SOA ({pulseLabel})</span>
        <span className="c-val">{check.operatingId.toFixed(1)} A <span className="sub">vs {check.curveLabel} limit {check.maxId === Infinity ? '∞' : check.maxId.toFixed(1)}A at {vds.toFixed(1)}V</span></span>
        <Chip state={check.verdict} />
      </div>
      <div className="d-overall">
        <span>OVERALL</span>
        <Chip state={check.verdict} />
      </div>
    </>
  );
});
