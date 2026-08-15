'use client';

/* ────────────────────────────────────────────────────────────────────
 * Digital Datasheet Viewer
 *
 * Faithful port of the Digital Datasheet Studio renderer
 * (digital-datasheet/app/src/components/DatasheetRenderer.tsx).
 * Renders a datasheet record exactly like the original Excel:
 * cover → characteristic tables → interactive curves → package → footer.
 * ──────────────────────────────────────────────────────────────────── */

import { type DatasheetRecord, type Section, type Curve, type Row } from '@/types/datasheet';
import { formatNumericLike } from '@/lib/datasheet-format';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const NUMERIC_CELL_RE = /^[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?[A-Za-z]*$/;

function isFullyNumeric(v: string) {
  return NUMERIC_CELL_RE.test(v.trim().replace(/,/g, ''));
}

function isNumericCol(section: Section, colIdx: number) {
  const col = section.columns[colIdx];
  if (!col) return false;
  if (col.type === 'number') return true;
  const sample = section.rows
    .map((r) => r.cells[colIdx])
    .filter((c) => c !== '' && c != null)
    .slice(0, 12);
  if (sample.length === 0) return false;
  const numericCount = sample.filter((c) => isFullyNumeric(c)).length;
  return numericCount > sample.length / 2;
}

function renderCell(section: Section, colIdx: number, row: Row) {
  const col = section.columns[colIdx];
  const v = row.cells[colIdx] ?? '';
  const numeric = isNumericCol(section, colIdx);
  if (numeric) {
    return <span className="ds-num">{formatNumericLike(v, col?.unit)}</span>;
  }
  return <span>{v}</span>;
}

function getCellColSpan(section: Section, colIdx: number, row: Row) {
  // Heuristic: empty cells stretch to the right when surrounded by empty
  // neighbors to mimic the way Excel merges long descriptive cells.
  if (colIdx >= section.columns.length) return 1;
  if (row.cells[colIdx] !== '' && row.cells[colIdx] != null) return 1;
  let span = 1;
  for (let i = colIdx + 1; i < section.columns.length; i++) {
    if (row.cells[i] === '' || row.cells[i] == null) span++;
    else break;
  }
  return span;
}

/* ------------------------------------------------------------------ */
/* Cover                                                               */
/* ------------------------------------------------------------------ */

function Cover({ d }: { d: DatasheetRecord }) {
  const c = d.cover ?? { features: [], validation: [], keyPerformance: [] };
  return (
    <section className="ds-page relative">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <header>
            <div className="text-xs font-medium tracking-widest text-gray-500 uppercase">
              {d.meta.classification}
            </div>
            <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-gray-900 text-balance">
              {d.meta.partNumber}
            </h1>
            {c.subtitle && <p className="mt-2 text-lg text-gray-500 text-pretty">{c.subtitle}</p>}
            <p className="mt-2 text-xs text-gray-400">
              {d.meta.company} · v{d.meta.version} · {d.meta.date}
            </p>
          </header>

          {c.features.length > 0 && (
            <div>
              <h2 className="ds-section-title">Features</h2>
              <ul className="mt-2 space-y-1.5 text-sm">
                {c.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {c.validation.length > 0 && (
            <div>
              <h2 className="ds-section-title">Product Validation</h2>
              <ul className="mt-2 space-y-1.5 text-sm">
                {c.validation.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {c.keyPerformance.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Key Performance
              </div>
              <dl className="mt-3 grid grid-cols-1 gap-3">
                {c.keyPerformance.map((k, i) => (
                  <div
                    key={i}
                    className={`flex items-baseline justify-between gap-3 border-b border-gray-100 pb-2 last:border-b-0 last:pb-0 ${
                      k.highlight ? 'rounded-md bg-blue-50/50 px-2 py-2 border border-blue-200' : ''
                    }`}
                  >
                    <dt className="text-xs text-gray-500">{k.label}</dt>
                    <dd className="ds-num text-base font-semibold text-gray-900">
                      {k.value}
                      {k.unit && (
                        <span className="ml-1 text-xs font-normal text-gray-400">{k.unit}</span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {c.ordering && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Ordering Information
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                {(
                  [
                    ['Type', c.ordering.type],
                    ['Package', c.ordering.package],
                    ['Marking', c.ordering.marking],
                    ['Packing', c.ordering.packing],
                    ['RoHS', c.ordering.rohs],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[10px] uppercase tracking-wider text-gray-400">{k}</dt>
                    <dd className="font-medium text-gray-800">{v || '—'}</dd>
                  </div>
                ))}
              </dl>
              {c.ordering.url && (
                <a
                  href={c.ordering.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 block truncate text-xs text-blue-600 underline"
                >
                  {c.ordering.url}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section table                                                       */
/* ------------------------------------------------------------------ */

function SectionTable({ s }: { s: Section }) {
  return (
    <section className="ds-page space-y-2">
      <header>
        <h2 className="ds-section-title">{s.title}</h2>
        {s.subtitle && <p className="ds-section-subtitle">{s.subtitle}</p>}
      </header>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="ds-table">
          <thead>
            <tr>
              {s.columns.map((c) => (
                <th key={c.id} style={c.width ? { minWidth: c.width + 'ch' } : undefined}>
                  {c.header}
                  {c.unit && <span className="ml-1 text-gray-400 font-normal">({c.unit})</span>}
                </th>
              ))}
              {s.rows.some((r) => (r.notes ?? []).length > 0) && (
                <th className="w-12 text-center">Note</th>
              )}
            </tr>
          </thead>
          <tbody>
            {s.rows.map((r) => {
              const plan: { start: number; span: number; ci: number }[] = [];
              let i = 0;
              while (i < s.columns.length) {
                const span = getCellColSpan(s, i, r);
                if (span === 0) {
                  i += 1;
                  continue;
                }
                plan.push({ start: i, span, ci: i });
                i += span;
              }
              return (
                <tr key={r.id}>
                  {plan.map((p, idx) => (
                    <td key={idx} colSpan={p.span} className="text-sm">
                      {renderCell(s, p.ci, r)}
                    </td>
                  ))}
                  {s.rows.some((rr) => (rr.notes ?? []).length > 0) && (
                    <td className="text-center text-xs text-gray-400">
                      {(r.notes ?? []).join(' ')}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {(s.notes ?? []).length > 0 && (
        <ol className="mt-2 space-y-1 text-xs text-gray-500">
          {(s.notes ?? []).map((n) => (
            <li key={n.label} className="flex gap-2">
              <span className="ds-num font-semibold text-gray-800">{n.label}</span>
              <span>{n.text}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Curve chart                                                         */
/* ------------------------------------------------------------------ */

const PALETTE = [
  '#2563eb', // primary blue
  '#dc2626', // red
  '#16a34a', // green
  '#9333ea', // purple
  '#ea580c', // orange
  '#0891b2', // cyan
  '#ca8a04', // amber
  '#db2777', // pink
  '#0f766e', // teal
  '#475569', // slate
];

function CurveChart({ c, index }: { c: Curve; index: number }) {
  return (
    <section className="ds-page space-y-2">
      <header className="flex items-baseline justify-between gap-4">
        <h3 className="ds-section-title">
          <span className="ds-pill mr-2">{c.figure}</span>
          {c.title}
        </h3>
        {c.series.length > 0 && (
          <div className="text-[11px] text-gray-400">
            {c.xLabel}
            {c.xUnit ? ` (${c.xUnit})` : ''} · {c.yLabel}
            {c.yUnit ? ` (${c.yUnit})` : ''}
          </div>
        )}
      </header>
      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="x"
                type="number"
                scale={c.xScale === 'log' ? 'log' : 'linear'}
                domain={['auto', 'auto']}
                allowDataOverflow
                tick={{ fontSize: 11 }}
                label={{
                  value: `${c.xLabel}${c.xUnit ? ` (${c.xUnit})` : ''}`,
                  position: 'insideBottom',
                  offset: -2,
                  fontSize: 11,
                  fill: '#9ca3af',
                }}
                stroke="#9ca3af"
              />
              <YAxis
                scale={c.yScale === 'log' ? 'log' : 'linear'}
                domain={['auto', 'auto']}
                allowDataOverflow
                tick={{ fontSize: 11 }}
                label={{
                  value: `${c.yLabel}${c.yUnit ? ` (${c.yUnit})` : ''}`,
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: 11,
                  fill: '#9ca3af',
                }}
                stroke="#9ca3af"
                width={50}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  color: '#111827',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {c.series.map((s, i) => (
                <Line
                  key={s.id}
                  data={s.points
                    .filter(
                      ([x, y]) =>
                        (c.xScale === 'log' ? x > 0 : true) && (c.yScale === 'log' ? y > 0 : true),
                    )
                    .map(([x, y]) => ({ x, y }))}
                  type="monotone"
                  dataKey="y"
                  name={s.name}
                  stroke={s.color ?? PALETTE[(i + index) % PALETTE.length]}
                  strokeWidth={1.8}
                  dot={s.showMarkers ?? (s.points.length < 30 ? { r: 2.5 } : false)}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {(c.notes ?? []).length > 0 && (
          <ol className="mt-3 space-y-1 text-xs text-gray-500">
            {(c.notes ?? []).map((n) => (
              <li key={n.label} className="flex gap-2">
                <span className="ds-num font-semibold text-gray-800">{n.label}</span>
                <span>{n.text}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Curves grid                                                         */
/* ------------------------------------------------------------------ */

function CurvesSection({ curves }: { curves: Curve[] }) {
  if (curves.length === 0) return null;
  return (
    <section className="ds-page space-y-4">
      <header>
        <h2 className="ds-section-title">Characteristic Curves</h2>
        <p className="ds-section-subtitle">
          Interactive plots — hover to inspect values, click legend to toggle series.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {curves.map((c, i) => (
          <CurveChart key={c.id} c={c} index={i} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

function Disclaimer({ d }: { d: DatasheetRecord }) {
  return (
    <section className="ds-page mt-10">
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-4 text-xs leading-relaxed text-gray-500">
        <strong className="text-gray-800">Disclaimer —</strong> {d.meta.disclaimer}
      </div>
      <div className="mt-3 text-center text-[11px] text-gray-400">
        Generated by Magnachip Digital Datasheet · {d.meta.partNumber} · v{d.meta.version} ·{' '}
        {d.meta.date}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Top-level renderer                                                   */
/* ------------------------------------------------------------------ */

export interface RenderOptions {
  showHeader?: boolean;
  printLayout?: boolean;
}

export function DatasheetViewer({ d, options }: { d: DatasheetRecord; options?: RenderOptions }) {
  const showHeader = options?.showHeader ?? true;
  return (
    <div className="ds-renderer" data-print={options?.printLayout ? 'true' : 'false'}>
      {showHeader && (
        <div className="ds-print-header">
          <div className="ds-print-header-inner">
            <span className="font-bold">{d.meta.partNumber}</span>
            <span className="text-gray-500">{d.meta.title}</span>
            <span className="ml-auto text-gray-500">
              v{d.meta.version} · {d.meta.date}
            </span>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-[1100px] space-y-8 px-6 py-8">
        <Cover d={d} />
        {d.sections.map((s) => (
          <SectionTable key={s.id} s={s} />
        ))}
        {d.curves.length > 0 && <CurvesSection curves={d.curves} />}
        {d.pkg && (d.pkg.name || d.pkg.imageUrl || (d.pkg.notes ?? []).length > 0) && (
          <section className="ds-page space-y-2">
            <h2 className="ds-section-title">Package Outlines</h2>
            <p className="text-sm">{d.pkg.name}</p>
            {d.pkg.imageUrl && (
              <img
                src={d.pkg.imageUrl}
                alt={d.pkg.name}
                className="max-h-72 rounded border border-gray-200 bg-white p-2"
              />
            )}
            {(d.pkg.notes ?? []).length > 0 && (
              <ul className="text-xs text-gray-500">
                {(d.pkg.notes ?? []).map((n, i) => (
                  <li key={i}>• {n}</li>
                ))}
              </ul>
            )}
          </section>
        )}
        <Disclaimer d={d} />
      </div>
    </div>
  );
}
