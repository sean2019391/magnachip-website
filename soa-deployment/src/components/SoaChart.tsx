import { forwardRef, useEffect, useRef, useMemo, useState, useCallback, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import { pickCurveByPulse, type SoaRawCurve } from '../engine/soaRawData';

export interface SoaChartHandle {
  exportSvg: () => void;
}

interface SoaChartProps {
  curves: SoaRawCurve[];
  vds: number;
  id: number;
  t_pulse: number;
  bv: number;
  idMax: number;
  idm: number;
  rds: number;
  verdict: 'PASS' | 'FAIL' | 'WARN';
  onOpMove?: (vds: number, id: number) => void;
}

const MARGIN = { t: 24, r: 24, b: 52, l: 72 };

const WARN_COLOR = '#EAB308';
const FAIL_COLOR = '#DC2626';
const PASS_COLOR = '#16A34A';
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

function triPoints(x: number, y: number, s: number): string {
  return `${x},${y - s} ${x + s},${y + s} ${x - s},${y + s}`;
}

function fmtTick(v: number): string {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1000) return String(Math.round(v));
  if (a >= 1) return Number.isInteger(v) ? String(v) : String(+v.toFixed(2));
  if (a >= 0.001) return String(+v.toFixed(3));
  return v.toExponential(1);
}

export const SoaChart = forwardRef<SoaChartHandle, SoaChartProps>(function SoaChart(props, ref) {
  const { curves, vds, id, t_pulse, bv, idMax, idm, rds, verdict, onOpMove } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const scalesRef = useRef({ x: null as any, y: null as any });
  const curvesRef = useRef<SoaRawCurve[] | null>(null);
  const skipDrawRef = useRef(false);
  const opDataRef = useRef({ vds, id, verdict });
  opDataRef.current = { vds, id, verdict };
  const opMoveRef = useRef(onOpMove);
  opMoveRef.current = onOpMove;

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

  // Determine which thermal curve applies for t_pulse
  const activeCurve = useMemo(() => pickCurveByPulse(curves, t_pulse), [curves, t_pulse]);
  const activeIdx = useMemo(() => curves.indexOf(activeCurve), [curves, activeCurve]);

  const xScale = useMemo(() => {
    let xmn = Infinity, xmx = -Infinity;
    curves.forEach((cv) => cv.points.forEach((p) => {
      if (p[0] > 0) { xmn = Math.min(xmn, p[0]); xmx = Math.max(xmx, p[0]); }
    }));
    if (!Number.isFinite(xmx) || xmx <= 0) xmx = 100;
    xmn = Math.min(xmn, vds);
    xmx = Math.max(xmx, vds, bv);
    const lo = Math.max(1e-3, xmn * 0.8);
    return d3.scaleLog().domain([lo, xmx * 1.2]).range([0, pw]);
  }, [curves, vds, bv, pw]);

  const yScale = useMemo(() => {
    let ymn = Infinity, ymx = -Infinity;
    curves.forEach((cv) => cv.points.forEach((p) => {
      if (p[1] > 0) { ymn = Math.min(ymn, p[1]); ymx = Math.max(ymx, p[1]); }
    }));
    if (!Number.isFinite(ymn)) ymn = 0.1;
    if (!Number.isFinite(ymx) || ymx <= 0) ymx = 10;
    ymn = Math.min(ymn, id);
    ymx = Math.max(ymx, id, idMax, idm || 0);
    if (!Number.isFinite(ymn)) ymn = 0.1;
    if (!Number.isFinite(ymx) || ymx <= 0) ymx = 10;
    return d3.scaleLog().domain([Math.max(ymn * 0.6, 1e-2), ymx * 2]).range([ph, 0]);
  }, [curves, id, idMax, idm, ph]);

  const draw = useCallback(() => {
    const svg = d3.select(svgRef.current!);
    const tooltip = d3.select(tooltipRef.current);
    svg.selectAll('*').remove();
    tooltip.style('display', 'none');

    if (!xScale || !yScale) return;
    const isLog = true;

    const chartBg = '#FAFBFC';
    const g = svg.append('g').attr('transform', `translate(${MARGIN.l},${MARGIN.t})`);
    const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');

    // Clip path
    defs.append('clipPath').attr('id', 'plot-clip')
      .append('rect').attr('width', pw).attr('height', ph);

    // Gradient fill for active SOA area
    const gradRGB = verdict === 'FAIL' ? '220,38,38' : verdict === 'WARN' ? '234,179,8' : '30,142,62';
    const grad = defs.append('linearGradient').attr('id', 'soa-fill').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', `rgba(${gradRGB},0.1)`);
    grad.append('stop').attr('offset', '100%').attr('stop-color', `rgba(${gradRGB},0)`);

    // Background
    g.append('rect').attr('width', pw).attr('height', ph).attr('fill', chartBg).attr('rx', 4);

    scalesRef.current = { x: xScale, y: yScale };
    curvesRef.current = curves;

    // Clipped content layers
    const clipped = g.append('g').attr('clip-path', 'url(#plot-clip)');
    const gridG = clipped.append('g');
    const contentG = clipped.append('g');
    const overlayG = clipped.append('g');

    drawGrid(gridG, xScale, yScale, pw, ph, isLog);

    // Axes
    const xDomain = xScale.domain() as [number, number];
    const yDomain = yScale.domain() as [number, number];
    const xAxisGen = d3.axisBottom(xScale).tickValues(logTickVals(xDomain)).tickFormat(sciLabel as any);
    const yAxisGen = d3.axisLeft(yScale).tickValues(logTickVals(yDomain)).tickFormat(sciLabel as any);

    const xAxisG = g.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${ph})`).call(xAxisGen);
    const yAxisG = g.append('g').attr('class', 'y-axis').call(yAxisGen);

    [xAxisG, yAxisG].forEach((ag) => {
      ag.selectAll('.domain').attr('stroke', '#D0D6DE').attr('stroke-width', 1);
      ag.selectAll('.tick line').attr('stroke', '#D0D6DE').attr('stroke-width', 1);
    });

    styleTickLabels(g);

    // Axis labels
    const xLabel = svg.append('text').attr('x', MARGIN.l + pw / 2).attr('y', h - 8)
      .attr('text-anchor', 'middle').attr('fill', '#000')
      .style('font-family', 'var(--ui)')
      .attr('font-size', '12px').attr('font-weight', '600');
    xLabel.append('tspan').text('V');
    xLabel.append('tspan').attr('dy', '4').attr('font-size', '0.65em').text('DS');
    xLabel.append('tspan').attr('dy', '-4').text(' (V)');

    const yLabel = svg.append('text').attr('x', 14).attr('y', MARGIN.t + ph / 2)
      .attr('text-anchor', 'middle').attr('fill', '#000')
      .style('font-family', 'var(--ui)')
      .attr('font-size', '12px').attr('font-weight', '600')
      .attr('transform', `rotate(-90,14,${MARGIN.t + ph / 2})`);
    yLabel.append('tspan').text('I');
    yLabel.append('tspan').attr('dy', '4').attr('font-size', '0.65em').text('D');
    yLabel.append('tspan').attr('dy', '-4').text(' (A)');

    drawCurvesOnly(contentG, curves, activeIdx, xScale, yScale, pw, ph, 'soa-fill', bv);

    // Crosshair lines (overlay layer)
    const crossX = overlayG.append('line').attr('class', 'crosshair-x')
      .attr('y1', 0).attr('y2', ph)
      .attr('stroke', '#0064FF').attr('stroke-width', 0.8).attr('opacity', 0).style('pointer-events', 'none');
    const crossY = overlayG.append('line').attr('class', 'crosshair-y')
      .attr('x1', 0).attr('x2', pw)
      .attr('stroke', '#0064FF').attr('stroke-width', 0.8).attr('opacity', 0).style('pointer-events', 'none');
    const snapDot = overlayG.append('circle')
      .attr('r', 5).attr('fill', '#fff').attr('stroke', '#0064FF').attr('stroke-width', 2.5)
      .attr('opacity', 0).style('pointer-events', 'none');

    const overlay = overlayG.append('rect')
      .attr('width', pw).attr('height', ph)
      .attr('fill', 'none').style('pointer-events', 'all').style('cursor', 'crosshair');

    overlay.on('mousemove', function (event: MouseEvent) {
      const [mx, my] = d3.pointer(event, this);
      const { x: sx, y: sy } = scalesRef.current;
      const rect = svgRef.current!.getBoundingClientRect();

      const vertex = snapToVertex(curvesRef.current, sx, sy, mx, my, 8);
      const snapped = vertex ?? snapToNearest(curvesRef.current, sx, sy, mx, my, 30);

      if (snapped) {
        const cx = snapped.px, cy = snapped.py;
        const isVertex = !!vertex;
        const label = `${snapped.label}: ${fmtTick(snapped.vds)}V, ${fmtTick(snapped.id)}A`;
        snapDot.attr('cx', cx).attr('cy', cy).attr('opacity', 1)
          .attr('r', isVertex ? 6 : 5)
          .attr('fill', isVertex ? '#DC2626' : '#fff')
          .attr('stroke', isVertex ? '#DC2626' : '#0064FF')
          .attr('stroke-width', isVertex ? 3 : 2.5);
        crossX.attr('x1', cx).attr('x2', cx).attr('opacity', 0.6);
        crossY.attr('y1', cy).attr('y2', cy).attr('opacity', 0.6);

        tooltip.style('display', 'block')
          .style('left', `${event.clientX - rect.left + 16}px`)
          .style('top', `${event.clientY - rect.top - 14}px`)
          .text(label);
      } else {
        snapDot.attr('opacity', 0);
        crossX.attr('opacity', 0);
        crossY.attr('opacity', 0);
        tooltip.style('display', 'none');
      }
    }).on('mouseleave', function () {
      crossX.attr('opacity', 0);
      crossY.attr('opacity', 0);
      snapDot.attr('opacity', 0);
      tooltip.style('display', 'none');
    });

    // Operating point marker (on top of overlay rect, draggable)
    const opHost = buildOpMarker(overlayG, vds, id, verdict, xScale, yScale);

    const drag = d3.drag<SVGGElement, unknown>()
      .on('start', (event) => {
        event.sourceEvent.stopPropagation();
        skipDrawRef.current = true;
      })
      .on('drag', (event) => {
        event.sourceEvent.stopPropagation();
        const [px, py] = d3.pointer(event, overlayG.node()!);
        const s = scalesRef.current;
        if (!s.x || !s.y) return;
        const newVds = Math.max(0, s.x.invert(px));
        const newId = Math.max(0, s.y.invert(py));
        if (Number.isFinite(newVds) && Number.isFinite(newId)) {
          updateOpMarker(opHost, newVds, newId, opDataRef.current.verdict, s.x, s.y);
          opMoveRef.current?.(newVds, newId);
        }
      })
      .on('end', () => {
        skipDrawRef.current = false;
      });
    opHost.call(drag as any);

    // Setup zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 40])
      .translateExtent([[-pw * 0.3, -ph * 0.3], [pw * 1.3, ph * 1.3]])
      .on('zoom', (event) => {
        const t = event.transform;
        const newX = d3.scaleLog().domain(xScale.domain()).range(xScale.range().map((r) => t.applyX(r)));
        const newY = d3.scaleLog().domain(yScale.domain()).range(yScale.range().map((r) => t.applyY(r)));

        drawGrid(gridG, newX, newY, pw, ph, true);

        xAxisG.call(d3.axisBottom(newX).tickValues(logTickVals(newX.domain() as [number, number])).tickFormat(sciLabel as any));
        yAxisG.call(d3.axisLeft(newY).tickValues(logTickVals(newY.domain() as [number, number])).tickFormat(sciLabel as any));

        [xAxisG, yAxisG].forEach((ag) => {
          ag.selectAll('.domain').attr('stroke', '#D0D6DE').attr('stroke-width', 1);
          ag.selectAll('.tick line').attr('stroke', '#D0D6DE').attr('stroke-width', 1);
        });
        styleTickLabels(g);

        // Redraw curves into content layer
        contentG.selectAll('*').remove();
        drawCurvesOnly(contentG, curves, activeIdx, newX, newY, pw, ph, 'soa-fill', bv);

        updateOpMarker(overlayG.select('[data-op-point]'), opDataRef.current.vds, opDataRef.current.id, opDataRef.current.verdict, newX, newY);
        scalesRef.current = { x: newX, y: newY };
      });

    svg.call(zoom);
    zoomRef.current = zoom;

  }, [curves, activeIdx, xScale, yScale, pw, ph, w, h, vds, id, bv, idMax, idm, rds, verdict, onOpMove]);

  useEffect(() => {
    if (skipDrawRef.current) return;
    draw();
  }, [draw]);

  useImperativeHandle(ref, () => ({
    exportSvg: () => {
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
      a.download = `soa-chart-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    },
  }), []);

  return (
    <div ref={containerRef} className="chart-wrap">
      <svg ref={svgRef} className="soa-svg" width={w} height={h} />
      <div ref={tooltipRef} className="chart-tooltip" />
    </div>
  );
});

/* ── Draw all curves from SoaRawCurve data ── */
function drawCurvesOnly(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  curves: SoaRawCurve[],
  activeIdx: number,
  x: any, y: any,
  pw: number, ph: number,
  gradId: string,
  bv: number,
) {
  const lineGen = d3.line<[number, number]>()
    .x((d) => x(d[0])).y((d) => y(d[1]))
    .curve(d3.curveLinear);

  const areaGen = d3.area<[number, number]>()
    .x((d) => x(d[0])).y0(ph).y1((d) => y(d[1]))
    .curve(d3.curveLinear);

  g.selectAll('[data-soa-fill]').remove();
  if (activeIdx >= 0 && activeIdx < curves.length && !curves[activeIdx].isBoundary) {
    g.append('path').datum(curves[activeIdx].points)
      .attr('data-soa-fill', '')
      .attr('d', areaGen).attr('fill', `url(#${gradId})`);
  }

  const thermalCurves: { curve: SoaRawCurve; idx: number }[] = [];
  const boundaryCurves: { curve: SoaRawCurve; idx: number }[] = [];
  curves.forEach((cv, i) => {
    if (cv.isBoundary) boundaryCurves.push({ curve: cv, idx: i });
    else thermalCurves.push({ curve: cv, idx: i });
  });

  const baselineG = g.append('g').attr('data-baseline', '');
  boundaryCurves.forEach(({ curve: cv }) => {
    baselineG.append('path').datum(cv.points)
      .attr('d', lineGen)
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', 2.5)
      .attr('opacity', 1);
  });

  const thresholdG = g.append('g').attr('data-threshold', '');
  const lpData: { idx: number; y: number; origY: number }[] = [];

  thermalCurves.forEach(({ curve: cv, idx }) => {
    thresholdG.append('path').datum(cv.points)
      .attr('d', lineGen)
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', 2.5)
      .attr('opacity', 1);

    if (cv.points.length) {
      const p = cv.points[cv.points.length - 1];
      lpData.push({ idx, y: y(p[1]), origY: y(p[1]) });
    }
  });

  lpData.sort((a, b) => a.y - b.y);
  const gap = 20;
  for (let j = 1; j < lpData.length; j++) {
    const minY = lpData[j - 1].y + gap;
    if (lpData[j].y < minY) lpData[j].y = minY;
  }

  const bx = x(bv);
  lpData.forEach((lp) => {
    const curve = curves[lp.idx];
    const isActive = lp.idx === activeIdx;

    if (Math.abs(lp.y - lp.origY) > 2) {
      thresholdG.append('line').attr('data-label-leader', '')
        .attr('x1', bx).attr('y1', lp.origY)
        .attr('x2', bx + 4).attr('y2', lp.y)
        .attr('stroke', '#000').attr('stroke-width', 0.6).attr('opacity', 0.2);
    }

    const labelG = thresholdG.append('g').attr('data-label', '');
    const textEl = labelG.append('text')
      .attr('x', bx + 8).attr('y', lp.y + 3.5)
      .attr('text-anchor', 'start')
      .attr('fill', '#000')
      .style('font-family', 'var(--ui)')
      .attr('font-size', '9px')
      .attr('font-weight', isActive ? '700' : '400')
      .text(curve.label);

    const tw = (textEl.node() as SVGTextElement)?.getComputedTextLength() ?? 0;
    const pillW = tw + 10;
    const pillH = 15;
    labelG.insert('rect', 'text')
      .attr('x', bx + 4).attr('y', lp.y - pillH + 4)
      .attr('width', pillW).attr('height', pillH)
      .attr('rx', 7.5).attr('ry', 7.5)
      .attr('fill', '#fff')
      .attr('stroke', isActive ? '#000' : '#ccc')
      .attr('stroke-width', isActive ? 1.2 : 0.6);
  });

}

function buildOpMarker(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  vds: number, id: number,
  verdict: 'PASS' | 'FAIL' | 'WARN',
  x: any, y: any,
): d3.Selection<SVGGElement, unknown, null, undefined> {
  const ok = verdict === 'PASS';
  const warn = verdict === 'WARN';
  const col = ok ? PASS_COLOR : warn ? WARN_COLOR : FAIL_COLOR;
  const cx = x(vds), cy = y(id);
  const host = g.append('g').attr('data-op-point', '').style('cursor', 'grab');

  if (ok) {
    host.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 9)
      .attr('fill', '#fff').attr('stroke', col).attr('stroke-width', 2.5);
    host.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 5)
      .attr('fill', col);
  } else if (warn) {
    host.append('polygon').attr('points', triPoints(cx, cy, 9))
      .attr('fill', '#fff').attr('stroke', col).attr('stroke-width', 2.5);
    host.append('polygon').attr('points', triPoints(cx, cy, 5))
      .attr('fill', col);
  } else {
    const s = 8;
    host.append('line').attr('x1', cx - s).attr('y1', cy - s)
      .attr('x2', cx + s).attr('y2', cy + s)
      .attr('stroke', col).attr('stroke-width', 3.5).attr('stroke-linecap', 'round');
    host.append('line').attr('x1', cx - s).attr('y1', cy + s)
      .attr('x2', cx + s).attr('y2', cy - s)
      .attr('stroke', col).attr('stroke-width', 3.5).attr('stroke-linecap', 'round');
  }
  return host;
}

function updateOpMarker(
  host: d3.Selection<any, unknown, null, undefined>,
  vds: number, id: number,
  verdict: 'PASS' | 'FAIL' | 'WARN',
  x: any, y: any,
) {
  if (host.empty()) return;
  host.selectAll('*').remove();
  const cx = x(vds), cy = y(id);
  const col = verdict === 'PASS' ? PASS_COLOR : verdict === 'WARN' ? WARN_COLOR : FAIL_COLOR;

  if (verdict === 'PASS') {
    host.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 9)
      .attr('fill', '#fff').attr('stroke', col).attr('stroke-width', 2.5);
    host.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 5)
      .attr('fill', col);
  } else if (verdict === 'WARN') {
    host.append('polygon').attr('points', triPoints(cx, cy, 9))
      .attr('fill', '#fff').attr('stroke', col).attr('stroke-width', 2.5);
    host.append('polygon').attr('points', triPoints(cx, cy, 5))
      .attr('fill', col);
  } else {
    const s = 8;
    host.append('line').attr('x1', cx - s).attr('y1', cy - s)
      .attr('x2', cx + s).attr('y2', cy + s)
      .attr('stroke', col).attr('stroke-width', 3.5).attr('stroke-linecap', 'round');
    host.append('line').attr('x1', cx - s).attr('y1', cy + s)
      .attr('x2', cx + s).attr('y2', cy - s)
      .attr('stroke', col).attr('stroke-width', 3.5).attr('stroke-linecap', 'round');
  }
}

/* ── Tick label styling ── */
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

/* ── Grid ── */
function drawGrid(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: any, y: any,
  pw: number, ph: number,
  isLog: boolean,
) {
  g.selectAll('[data-grid]').remove();
  const xDomain = x.domain() as [number, number];
  const yDomain = y.domain() as [number, number];

  if (isLog) {
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
  } else {
    const xTicks = x.ticks(6);
    const yTicks = y.ticks(6);
    xTicks.forEach((v: number) => {
      g.append('line').attr('data-grid', '').attr('x1', x(v)).attr('x2', x(v)).attr('y1', 0).attr('y2', ph)
        .attr('stroke', GRID_COLOR).attr('stroke-width', 0.6);
    });
    yTicks.forEach((v: number) => {
      g.append('line').attr('data-grid', '').attr('x1', 0).attr('x2', pw).attr('y1', y(v)).attr('y2', y(v))
        .attr('stroke', GRID_COLOR).attr('stroke-width', 0.6);
    });
  }
}

interface SnapResult { vds: number; id: number; label: string; px: number; py: number }

function snapToVertex(
  curves: SoaRawCurve[] | null,
  x: any, y: any,
  mx: number, my: number,
  threshold: number,
): SnapResult | null {
  if (!curves) return null;
  let bestDist = threshold;
  let best: SnapResult | null = null;
  for (let ci = 0; ci < curves.length; ci++) {
    const pts = curves[ci].points;
    for (let pi = 0; pi < pts.length; pi++) {
      const [vds, id] = pts[pi];
      const px = x(vds), py = y(id);
      const dx = px - mx, dy = py - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = { vds, id, label: curves[ci].label, px, py };
      }
    }
  }
  return best;
}

function snapToNearest(
  curves: SoaRawCurve[] | null,
  x: any, y: any,
  mx: number, my: number,
  threshold: number,
): SnapResult | null {
  if (!curves) return null;
  let bestDist = threshold;
  let best: SnapResult | null = null;
  for (let ci = 0; ci < curves.length; ci++) {
    const pts = curves[ci].points;
    for (let pi = 0; pi < pts.length - 1; pi++) {
      const [vds1, id1] = pts[pi];
      const [vds2, id2] = pts[pi + 1];
      const ax = x(vds1), ay = y(id1);
      const bx = x(vds2), by = y(id2);
      const abx = bx - ax, aby = by - ay;
      const denom = abx * abx + aby * aby;
      if (denom === 0) continue;
      let t = ((mx - ax) * abx + (my - ay) * aby) / denom;
      t = Math.max(0, Math.min(1, t));
      const ppx = ax + t * abx;
      const ppy = ay + t * aby;
      const dx = ppx - mx, dy = ppy - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        const vds = vds1 + t * (vds2 - vds1);
        const idVal = id1 + t * (id2 - id1);
        best = { vds, id: idVal, label: curves[ci].label, px: ppx, py: ppy };
      }
    }
  }
  return best;
}
