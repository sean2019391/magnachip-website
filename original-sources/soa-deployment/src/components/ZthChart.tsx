import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import {
  zthFromTable, tableTimeDomain,
  type RthjcTable,
} from '../engine/soaEngine';

interface ZthChartProps {
  table: RthjcTable;
  /** Highlight this duty column (e.g. the one matching the current D). */
  activeDuty?: number;
  /** Pulse width t_pulse for the current operating point (s) */
  t_pulse?: number;
  /** Title shown above the chart. */
  title?: string;
  /** Show scatter markers at original data points (typically true for DB table, false for fosterToTable). */
  showMarkers?: boolean;
}

const MARGIN = { t: 24, r: 24, b: 52, l: 76 };
const DUTY_COLORS = [
  '#1971C2', '#2F9E44', '#E8590C', '#9C36B5', '#0C8599', '#E03131', '#F08C00',
];
const SINGLE_COLOR = '#495057';
const GRID_COLOR = '#C8CDD6';
const MAJOR_GRID_COLOR = '#9CA3AF';
const AXIS_COLOR = '#6B7280';

function logTickVals(domain: [number, number]): number[] {
  const [mn, mx] = domain;
  const lo = Math.ceil(Math.log10(mn));
  const hi = Math.floor(Math.log10(mx));
  const out: number[] = [];
  for (let k = lo; k <= hi; k++) {
    const p = Math.pow(10, k);
    if (p >= mn && p <= mx) out.push(p);
    if (k < hi) {
      const t2 = 2 * p, t5 = 5 * p;
      if (t2 >= mn && t2 <= mx) out.push(t2);
      if (t5 >= mn && t5 <= mx) out.push(t5);
    }
  }
  return out;
}

function logGridVals(domain: [number, number], decades: number, plotPx: number): number[] {
  const [mn, mx] = domain;
  const out: number[] = [];
  const lo = Math.floor(Math.log10(mn));
  const hi = Math.ceil(Math.log10(mx));
  const targetPx = 14;
  const targetPerDecade = Math.max(2, Math.round(plotPx / targetPx / Math.max(decades, 0.01)));
  let step: number;
  if (targetPerDecade <= 3) step = 0.5;
  else if (targetPerDecade <= 5) step = 0.2;
  else if (targetPerDecade <= 10) step = 0.1;
  else if (targetPerDecade <= 20) step = 0.05;
  else step = 0.02;
  const mults: number[] = [];
  for (let v = step; v < 1; v += step) mults.push(v);
  mults.push(1);
  for (let k = lo; k <= hi; k++) {
    const base = Math.pow(10, k);
    for (const m of mults) {
      const v = base * m;
      if (v >= mn && v <= mx) out.push(v);
    }
  }
  return out;
}

function sciLabel(v: number): string {
  const e = Math.floor(Math.log10(v));
  if (v === Math.pow(10, e)) return `10^${e}`;
  const m = v / Math.pow(10, e);
  return `${m}·10^${e}`;
}

function fmtTick(v: number): string {
  if (v === 0) return '0';
  if (Math.abs(v) >= 100) return String(Math.round(v));
  if (Math.abs(v) >= 1) return v.toFixed(2);
  if (Math.abs(v) >= 0.01) return v.toFixed(3);
  return v.toExponential(1);
}

function styleTickLabels(g: d3.Selection<SVGGElement, unknown, null, undefined>) {
  g.selectAll('.tick text')
    .style('font-family', 'var(--ui)')
    .attr('font-size', '10px').attr('fill', AXIS_COLOR);
  g.selectAll('.tick text').each(function () {
    const el = d3.select(this);
    const txt = el.text();
    const m = txt.match(/^(\d+(?:\.\d+)?)([·]?)10\^([-]?\d+)$/);
    if (m) {
      el.text('');
      el.append('tspan').text(m[1] + m[2]);
      el.append('tspan').text('10');
      el.append('tspan').attr('font-size', '0.7em').attr('dy', '-0.35em').text(m[3]);
    } else {
      const m2 = txt.match(/^10\^([-]?\d+)$/);
      if (m2) {
        el.text('');
        el.append('tspan').text('10');
        el.append('tspan').attr('font-size', '0.7em').attr('dy', '-0.35em').text(m2[1]);
      }
    }
  });
}

function drawGrid(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: any, y: any, pw: number, ph: number,
) {
  g.selectAll('[data-grid]').remove();
  const xDomain = x.domain() as [number, number];
  const yDomain = y.domain() as [number, number];
  const xDecades = Math.log10(xDomain[1]) - Math.log10(xDomain[0]);
  const yDecades = Math.log10(yDomain[1]) - Math.log10(yDomain[0]);
  const xGrid = logGridVals(xDomain, xDecades, pw);
  const yGrid = logGridVals(yDomain, yDecades, ph);
  xGrid.forEach((v) => {
    g.append('line').attr('data-grid', '').attr('x1', x(v)).attr('x2', x(v)).attr('y1', 0).attr('y2', ph)
      .attr('stroke', GRID_COLOR).attr('stroke-width', 0.6);
  });
  yGrid.forEach((v) => {
    g.append('line').attr('data-grid', '').attr('x1', 0).attr('x2', pw).attr('y1', y(v)).attr('y2', y(v))
      .attr('stroke', GRID_COLOR).attr('stroke-width', 0.6);
  });
  for (let k = Math.ceil(Math.log10(xDomain[0])); k <= Math.floor(Math.log10(xDomain[1])); k++) {
    const v = Math.pow(10, k);
    if (v >= xDomain[0] && v <= xDomain[1]) {
      g.append('line').attr('data-grid', '').attr('x1', x(v)).attr('x2', x(v)).attr('y1', 0).attr('y2', ph)
        .attr('stroke', MAJOR_GRID_COLOR).attr('stroke-width', 1.2);
    }
  }
  for (let k = Math.ceil(Math.log10(yDomain[0])); k <= Math.floor(Math.log10(yDomain[1])); k++) {
    const v = Math.pow(10, k);
    if (v >= yDomain[0] && v <= yDomain[1]) {
      g.append('line').attr('data-grid', '').attr('x1', 0).attr('x2', pw).attr('y1', y(v)).attr('y2', y(v))
        .attr('stroke', MAJOR_GRID_COLOR).attr('stroke-width', 1.2);
    }
  }
}

/* Interpolate sparse log-log points to ~40 points per decade for smooth curves.
 * Input and output are in DATA coordinates (not pixel). */
function interpolateLogLog(points: Array<[number, number]>, targetPerDecade = 40): Array<[number, number]> {
  if (points.length <= 2) return points;
  const result: Array<[number, number]> = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const [t0, z0] = points[i - 1];
    const [t1, z1] = points[i];
    if (t0 <= 0 || t1 <= 0 || z0 <= 0 || z1 <= 0) { result.push(points[i]); continue; }
    const logT0 = Math.log10(t0), logT1 = Math.log10(t1);
    const logZ0 = Math.log10(z0), logZ1 = Math.log10(z1);
    const logDecades = Math.abs(logT1 - logT0);
    const steps = Math.max(1, Math.round(logDecades * targetPerDecade));
    for (let j = 1; j <= steps; j++) {
      const frac = j / steps;
      const logT = logT0 + frac * (logT1 - logT0);
      const logZ = logZ0 + frac * (logZ1 - logZ0);
      result.push([Math.pow(10, logT), Math.pow(10, logZ)]);
    }
  }
  return result;
}

interface CurveInfo {
  duty: number;
  label: string;
  color: string;
  points: Array<[number, number]>;   // log-log interpolated (smooth line)
  rawPoints: Array<[number, number]>; // original data points (markers)
}

export function ZthChart({ table, activeDuty, t_pulse, title, showMarkers = false }: ZthChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const curvesRef = useRef<CurveInfo[] | null>(null);
  const scalesRef = useRef<{ x: any; y: any } | null>(null);

  const [dim, setDim] = useState({ w: 600, h: 400 });

  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width } = e.contentRect;
        setDim({ w: Math.max(width, 300), h: Math.max(Math.round(width * 0.56), 240) });
      }
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const { w, h } = dim;
  const pw = w - MARGIN.l - MARGIN.r;
  const ph = h - MARGIN.t - MARGIN.b;

  // Build curves: single + each per-pulse column
  const rawSingle = table.times.map((t, i) => [t, table.single[i]] as [number, number]);
  const rawPerPulse = table.perPulse.map((c) => ({
    duty: c.duty,
    raw: table.times.map((t, i) => [t, c.values[i]] as [number, number]),
  }));
  const curves: CurveInfo[] = [
    { duty: 0, label: 'Single pulse', color: SINGLE_COLOR, points: interpolateLogLog(rawSingle), rawPoints: rawSingle },
    ...rawPerPulse.map((r, idx) => ({
      duty: r.duty,
      label: `D = ${r.duty}`,
      color: DUTY_COLORS[idx % DUTY_COLORS.length],
      points: interpolateLogLog(r.raw),
      rawPoints: r.raw,
    })),
  ];

  // Domain — table range only (no extrapolation)
  const [tMin, tMax] = tableTimeDomain(table);
  const xDomain: [number, number] = [tMin, tMax];
  const yDomain: [number, number] = (() => {
    let lo = Infinity, hi = -Infinity;
    for (const c of curves) for (const [, z] of c.points) {
      if (z > 0) { lo = Math.min(lo, z); hi = Math.max(hi, z); }
    }
    // pad log-y a little
    lo = Math.max(lo * 0.5, 1e-6);
    hi = hi * 1.6;
    return [lo, hi];
  })();

  const xScale = d3.scaleLog().domain(xDomain).range([0, pw]);
  const yScale = d3.scaleLog().domain(yDomain).range([ph, 0]);

  const draw = useCallback(() => {
    const svg = d3.select(svgRef.current!);
    const tooltip = d3.select(tooltipRef.current);
    svg.selectAll('*').remove();
    tooltip.style('display', 'none');

    const chartBg = '#FAFBFC';
    const g = svg.append('g').attr('transform', `translate(${MARGIN.l},${MARGIN.t})`);
    const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
    defs.append('clipPath').attr('id', 'zth-clip')
      .append('rect').attr('width', pw).attr('height', ph);

    g.append('rect').attr('width', pw).attr('height', ph).attr('fill', chartBg).attr('rx', 4);

    const clipped = g.append('g').attr('clip-path', 'url(#zth-clip)');
    const gridG = clipped.append('g');
    const contentG = clipped.append('g');
    const overlayG = clipped.append('g');

    drawGrid(gridG, xScale, yScale, pw, ph);

    const xAxisG = g.append('g').attr('class', 'x-axis')
      .attr('transform', `translate(0,${ph})`)
      .call(d3.axisBottom(xScale).tickValues(logTickVals(xDomain)).tickFormat(sciLabel as any));
    const yAxisG = g.append('g').attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).tickValues(logTickVals(yDomain)).tickFormat(sciLabel as any));
    [xAxisG, yAxisG].forEach((ag) => {
      ag.selectAll('.domain').attr('stroke', '#D0D6DE').attr('stroke-width', 1);
      ag.selectAll('.tick line').attr('stroke', '#D0D6DE').attr('stroke-width', 1);
    });
    styleTickLabels(g);

    // Axis labels
    const xLabel = svg.append('text').attr('x', MARGIN.l + pw / 2).attr('y', h - 8)
      .attr('text-anchor', 'middle').attr('fill', '#000')
      .style('font-family', 'var(--ui)').attr('font-size', '12px').attr('font-weight', '600');
    xLabel.append('tspan').text('t');
    xLabel.append('tspan').attr('dy', '4').attr('font-size', '0.65em').text('p');
    xLabel.append('tspan').attr('dy', '-4').text(' (s)');

    const yLabel = svg.append('text').attr('x', 14).attr('y', MARGIN.t + ph / 2)
      .attr('text-anchor', 'middle').attr('fill', '#000')
      .style('font-family', 'var(--ui)').attr('font-size', '12px').attr('font-weight', '600')
      .attr('transform', `rotate(-90,14,${MARGIN.t + ph / 2})`);
    yLabel.append('tspan').text('Z');
    yLabel.append('tspan').attr('dy', '4').attr('font-size', '0.65em').text('th(jc)');
    yLabel.append('tspan').attr('dy', '-4').text(' (°C/W)');

    curvesRef.current = curves;
    scalesRef.current = { x: xScale, y: yScale };

    const isActive = (duty: number) => {
      if (activeDuty == null) return false;
      if (activeDuty <= 0) return duty === 0;
      let best = 0;
      for (const c of curves) if (c.duty > 0 && c.duty <= activeDuty) best = c.duty;
      return duty === best;
    };

    // Build a reusable line generator for the curves
    const lineGen = d3.line<[number, number]>()
      .x((d) => xScale(d[0])).y((d) => yScale(d[1]))
      .curve(d3.curveLinear);

    // Draw curves + scatter markers (extracted so zoom handler reuses it)
    const drawCurvesAndMarkers = (g: d3.Selection<SVGGElement, unknown, null, undefined>, x: any, y: any) => {
      curves.forEach((c) => {
        const active = isActive(c.duty);
        const opacity = active ? 1 : (c.duty === 0 ? 0.7 : 0.55);
        const sw = active ? 2.6 : 1.6;

        // Smooth line (log-log interpolated points, linear segments → enough density)
        g.append('path').datum(c.points)
          .attr('data-curve', c.duty)
          .attr('d', lineGen.x((d) => x(d[0])).y((d) => y(d[1]))(c.points))
          .attr('fill', 'none')
          .attr('stroke', c.color)
          .attr('stroke-width', sw)
          .attr('opacity', opacity);

        // Scatter markers at original data points (only when DB source)
        if (showMarkers) {
          const dutyKey = Math.round(c.duty * 1000);
          c.rawPoints.forEach(([t, z]) => {
            g.append('circle')
              .attr('class', `curve-d${dutyKey}`)
              .attr('cx', x(t)).attr('cy', y(z))
              .attr('r', active ? 3.5 : 2.2)
              .attr('fill', c.color)
              .attr('opacity', opacity);
          });
        }
      });
    };

    drawCurvesAndMarkers(contentG, xScale, yScale);

    // Legend
    addLegend(g, curves, pw, ph);

    // Crosshair tracing
    const crossX = overlayG.append('line').attr('class', 'crosshair-x')
      .attr('y1', 0).attr('y2', ph)
      .attr('stroke', '#6B7280').attr('stroke-width', 0.8).attr('opacity', 0).style('pointer-events', 'none');
    const crossY = overlayG.append('line').attr('class', 'crosshair-y')
      .attr('x1', 0).attr('x2', pw)
      .attr('stroke', '#6B7280').attr('stroke-width', 0.8).attr('opacity', 0).style('pointer-events', 'none');
    const snapDot = overlayG.append('circle')
      .attr('r', 5).attr('fill', '#fff').attr('stroke', '#0064FF').attr('stroke-width', 2.5)
      .attr('opacity', 0).style('pointer-events', 'none');

    const overlay = overlayG.append('rect')
      .attr('width', pw).attr('height', ph)
      .attr('fill', 'none').style('pointer-events', 'all').style('cursor', 'crosshair');

    overlay.on('mousemove', function (event: MouseEvent) {
      const [mx, my] = d3.pointer(event, this);
      const { x: sx, y: sy } = scalesRef.current!;
      const tVal = sx.invert(mx);
      const zVal = sy.invert(my);
      const rect = svgRef.current!.getBoundingClientRect();

      const snapped = snapToNearest(curvesRef.current, sx, sy, mx, my, 14);
      let cx = mx, cy = my;
      let label: string;
      if (snapped) {
        cx = snapped.px;
        cy = snapped.py;
        label = `${snapped.label} · t = ${fmtTick(snapped.t)}s, Zth = ${fmtTick(snapped.z)} °C/W`;
        snapDot.attr('cx', cx).attr('cy', cy).attr('opacity', 1)
          .attr('stroke', snapped.color).attr('fill', snapped.color);
      } else {
        // Read Zth on active duty column if t inside domain
        if (tVal >= tMin && tVal <= tMax && activeDuty != null) {
          const z = zthFromTable(table, tVal, activeDuty);
          if (z != null) {
            cy = sy(z);
            crossY.attr('y1', cy).attr('y2', cy);
          }
        }
        snapDot.attr('opacity', 0);
        label = `t = ${fmtTick(tVal)}s, Zth = ${fmtTick(zVal)} °C/W`;
      }
      crossX.attr('x1', cx).attr('x2', cx).attr('opacity', 0.5);
      crossY.attr('x1', 0).attr('x2', pw).attr('y1', cy).attr('y2', cy).attr('opacity', 0.5);
      tooltip.style('display', 'block')
        .style('left', `${event.clientX - rect.left + 16}px`)
        .style('top', `${event.clientY - rect.top - 14}px`)
        .text(label);
    }).on('mouseleave', function () {
      crossX.attr('opacity', 0);
      crossY.attr('opacity', 0);
      snapDot.attr('opacity', 0);
      tooltip.style('display', 'none');
    });

    // Zoom (wheel / drag pan, dblclick reset) — matches SoaChart pattern
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 40])
      .translateExtent([[-pw * 0.3, -ph * 0.3], [pw * 1.3, ph * 1.3]])
      .on('zoom', (event) => {
        const t = event.transform;
        const newX = d3.scaleLog().domain(xDomain).range(xScale.range().map((r) => t.applyX(r)));
        const newY = d3.scaleLog().domain(yDomain).range(yScale.range().map((r) => t.applyY(r)));

        drawGrid(gridG, newX, newY, pw, ph);

        xAxisG.call(d3.axisBottom(newX).tickValues(logTickVals(newX.domain() as [number, number])).tickFormat(sciLabel as any));
        yAxisG.call(d3.axisLeft(newY).tickValues(logTickVals(newY.domain() as [number, number])).tickFormat(sciLabel as any));
        [xAxisG, yAxisG].forEach((ag) => {
          ag.selectAll('.domain').attr('stroke', '#D0D6DE').attr('stroke-width', 1);
          ag.selectAll('.tick line').attr('stroke', '#D0D6DE').attr('stroke-width', 1);
        });
        styleTickLabels(g);

        // Full redraw — remove everything and use same draw functions
        contentG.selectAll('*').remove();
        drawCurvesAndMarkers(contentG, newX, newY);

        scalesRef.current = { x: newX, y: newY };
      });

    svg.call(zoom);
  }, [curves, xScale, yScale, pw, ph, w, h, table, t_pulse, activeDuty, title]);

  useEffect(() => { draw(); }, [draw]);

  const exportSvg = useCallback(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(clone);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zth-curve-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div ref={containerRef} className="chart-wrap">
      <button className="chart-export" onClick={exportSvg} title="Export SVG" aria-label="Export SVG">
        <svg viewBox="0 0 16 16"><path d="M8 1v9l3-3 1 1-5 5-5-5 1-1 3 3V1h2z"/><path d="M1 13v2h14v-2"/></svg>
        SVG
      </button>
      <svg ref={svgRef} className="soa-svg" width={w} height={h} />
      <div ref={tooltipRef} className="chart-tooltip" />
    </div>
  );
}

function addLegend(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  curves: CurveInfo[],
  pw: number, ph: number,
) {
  const pad = 6, lh = 14, sw = 18, dotR = 3;
  const items = curves.map((c) => ({ t: c.label, c: c.color }));
  const temp = g.append('text').style('font-family', 'var(--ui)').attr('font-size', '10px');
  let maxW = 0;
  items.forEach((it) => { maxW = Math.max(maxW, (temp.text(it.t).node() as any)?.getComputedTextLength() ?? 0); });
  temp.remove();
  const boxW = maxW + sw + dotR * 2 + pad * 2 + 6;
  const boxH = items.length * lh + pad * 2 - 2;
  const bx = pw - boxW - 8;
  const by = 8;

  g.append('rect').attr('x', bx).attr('y', by).attr('width', boxW).attr('height', boxH)
    .attr('rx', 5).attr('fill', 'rgba(255,255,255,.92)')
    .attr('stroke', '#d0d0d0').attr('stroke-width', 1);

  items.forEach((it, i) => {
    const yy = by + pad + i * lh + lh / 2 + 4;
    const x0 = bx + pad;
    g.append('line').attr('x1', x0).attr('y1', yy).attr('x2', x0 + sw).attr('y2', yy)
      .attr('stroke', it.c).attr('stroke-width', 1.8);
    g.append('circle').attr('cx', x0 + sw / 2).attr('cy', yy).attr('r', dotR)
      .attr('fill', it.c);
    g.append('text').attr('x', x0 + sw + dotR * 2 + 4).attr('y', yy + 3)
      .attr('fill', '#000').style('font-family', 'var(--ui)')
      .attr('font-size', '10px').text(it.t);
  });
}

interface SnapResult { t: number; z: number; label: string; color: string; px: number; py: number }
function snapToNearest(
  curves: CurveInfo[] | null,
  x: any, y: any,
  mx: number, my: number,
  threshold: number,
): SnapResult | null {
  if (!curves) return null;
  let bestDist = threshold;
  let best: SnapResult | null = null;
  for (const c of curves) {
    for (const [t, z] of c.points) {
      const px = x(t), py = y(z);
      const dx = px - mx, dy = py - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = { t, z, label: c.label, color: c.color, px, py };
      }
    }
  }
  return best;
}
