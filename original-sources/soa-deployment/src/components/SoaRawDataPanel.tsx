import { useState } from 'react';
import type { SoaRawCurve } from '../engine/soaRawData';

interface Props {
  curves: SoaRawCurve[];
}

const CURVE_LABELS: Record<string, string> = {
  '10µs': '10 µs Pulse',
  '100µs': '100 µs Pulse',
  '1ms': '1 ms Pulse',
  '10ms': '10 ms Pulse',
  DC: 'DC',
};

export function SoaRawDataPanel({ curves }: Props) {
  const [collapsed, setCollapsed] = useState(true);

  const thermalCurves = curves.filter((c) => !c.isBoundary);
  const boundaryCurves = curves.filter((c) => c.isBoundary);

  return (
    <div className="group raw-data-panel">
      <div className="group-h" onClick={() => setCollapsed((c) => !c)} style={{ cursor: 'pointer', userSelect: 'none' }}>
        <span>SOA Raw Data (Fig. 9)</span>
        <span className="collapse-arrow">{collapsed ? '▸' : '▾'}</span>
      </div>
      {!collapsed && (
        <div className="group-b raw-data-scroll">
          <div className="raw-data-source">
            Source: AMDTA080N017RH datasheet Fig. 9 — Safe Operating Area
          </div>

          {thermalCurves.map((cv) => {
            const header = CURVE_LABELS[cv.label] ?? `${cv.label} Pulse`;
            return (
              <details key={cv.label} className="raw-curve-details" open>
                <summary>
                  <span className="raw-curve-badge" style={{ background: cv.color }} />
                  {header}
                  <span className="raw-pt-count">{cv.points.length} pts</span>
                </summary>
                <table className="raw-pt-table">
                  <thead>
                    <tr>
                      <th>V<sub>DS</sub> (V)</th>
                      <th>I<sub>D</sub> (A)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cv.points.map(([vds, id], i) => (
                      <tr key={i}>
                        <td>{vds.toFixed(3)}</td>
                        <td>{id.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            );
          })}

          <details className="raw-curve-details" style={{ marginTop: 8 }}>
            <summary>
              <span className="raw-curve-badge" style={{ background: '#6B7280' }} />
              Boundary Lines
              <span className="raw-pt-count">{boundaryCurves.reduce((s, c) => s + c.points.length, 0)} pts</span>
            </summary>
            {boundaryCurves.map((cv) => (
              <div key={cv.label} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#4B5563', marginBottom: 2 }}>{cv.label}</div>
                <table className="raw-pt-table">
                  <thead>
                    <tr>
                      <th>V<sub>DS</sub> (V)</th>
                      <th>I<sub>D</sub> (A)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cv.points.map(([vds, id], i) => (
                      <tr key={i}>
                        <td>{vds.toFixed(3)}</td>
                        <td>{id.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </details>
        </div>
      )}
    </div>
  );
}
