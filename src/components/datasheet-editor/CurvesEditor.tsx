'use client';

import { useEffect, useState } from 'react';
import type { ClipboardEvent } from 'react';
import type { Curve, CurveSeries } from '@/types/datasheet';
import { newId } from '@/types/datasheet';
import {
  AddButton,
  Card,
  Field,
  IconButton,
  PlusIcon,
  SelectInput,
  TextArea,
  TextInput,
  TrashIcon,
  XIcon,
} from './ui';

export function CurvesEditor({
  curves,
  onChange,
}: {
  curves: Curve[];
  onChange: (curves: Curve[]) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(curves[0]?.id ?? null);
  const selectedId = curves.some((c) => c.id === activeId) ? activeId : (curves[0]?.id ?? null);
  const active = curves.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId !== activeId) setActiveId(selectedId);
  }, [selectedId, activeId]);

  const addCurve = () => {
    const id = newId('curve');
    const nextFigure =
      curves.reduce((max, c) => {
        const m = /(\d+)/.exec(c.figure);
        return Math.max(max, m ? parseInt(m[1], 10) : 0);
      }, 0) + 1;
    const nc: Curve = {
      id,
      figure: `Fig. ${nextFigure}`,
      title: 'New curve',
      xLabel: 'X',
      yLabel: 'Y',
      series: [{ id: newId('series'), name: 'Series 1', points: [] }],
      xScale: 'linear',
      yScale: 'linear',
      notes: [],
    };
    onChange([...curves, nc]);
    setActiveId(id);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Curves</h3>
        <AddButton onClick={addCurve}>
          <PlusIcon className="h-3 w-3" /> Add curve
        </AddButton>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {curves.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveId(c.id)}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-colors ${
              selectedId === c.id
                ? 'border-black bg-gray-100 text-gray-900'
                : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            <span className="rounded-full border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
              {c.figure}
            </span>
            <span className="max-w-[150px] truncate">{c.title}</span>
          </button>
        ))}
      </div>

      {active && (
        <CurveEditor
          curve={active}
          onChange={(c) => onChange(curves.map((x) => (x.id === c.id ? c : x)))}
          onRemove={() => {
            if (!window.confirm(`Delete curve "${active.title}"? This cannot be undone.`)) return;
            const idx = curves.findIndex((c) => c.id === active.id);
            const remaining = curves.filter((c) => c.id !== active.id);
            onChange(remaining);
            setActiveId(remaining[Math.min(idx, remaining.length - 1)]?.id ?? null);
          }}
        />
      )}
    </div>
  );
}

function CurveEditor({
  curve,
  onChange,
  onRemove,
}: {
  curve: Curve;
  onChange: (curve: Curve) => void;
  onRemove: () => void;
}) {
  return (
    <Card>
      <div className="space-y-2 px-4 pt-3">
        <div className="flex items-center gap-1">
          <TextInput
            value={curve.figure}
            onChange={(e) => onChange({ ...curve, figure: e.target.value })}
            className="w-24"
          />
          <TextInput
            value={curve.title}
            onChange={(e) => onChange({ ...curve, title: e.target.value })}
            className="flex-1"
          />
          <IconButton onClick={onRemove} title="Delete" className="text-red-500 hover:text-red-600">
            <TrashIcon className="h-3 w-3" />
          </IconButton>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <Field label="X label">
            <TextInput
              size="sm"
              value={curve.xLabel}
              onChange={(e) => onChange({ ...curve, xLabel: e.target.value })}
            />
          </Field>
          <Field label="X unit">
            <TextInput
              size="sm"
              value={curve.xUnit ?? ''}
              onChange={(e) => onChange({ ...curve, xUnit: e.target.value })}
            />
          </Field>
          <Field label="X scale">
            <SelectInput
              size="sm"
              value={curve.xScale}
              onChange={(v) => onChange({ ...curve, xScale: v as Curve['xScale'] })}
              options={['linear', 'log']}
            />
          </Field>
          <Field label="Y label">
            <TextInput
              size="sm"
              value={curve.yLabel}
              onChange={(e) => onChange({ ...curve, yLabel: e.target.value })}
            />
          </Field>
          <Field label="Y unit">
            <TextInput
              size="sm"
              value={curve.yUnit ?? ''}
              onChange={(e) => onChange({ ...curve, yUnit: e.target.value })}
            />
          </Field>
          <Field label="Y scale">
            <SelectInput
              size="sm"
              value={curve.yScale}
              onChange={(v) => onChange({ ...curve, yScale: v as Curve['yScale'] })}
              options={['linear', 'log']}
            />
          </Field>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Series ({curve.series.length})</span>
          <AddButton
            onClick={() =>
              onChange({
                ...curve,
                series: [
                  ...curve.series,
                  { id: newId('series'), name: `Series ${curve.series.length + 1}`, points: [] },
                ],
              })
            }
          >
            <PlusIcon className="h-3 w-3" /> Series
          </AddButton>
        </div>
        <div className="space-y-2">
          {curve.series.map((s, i) => (
            <SeriesEditor
              key={s.id}
              series={s}
              onChange={(ns) =>
                onChange({ ...curve, series: curve.series.map((x, j) => (j === i ? ns : x)) })
              }
              onRemove={() => {
                if (window.confirm(`Delete series "${s.name}"? This cannot be undone.`)) {
                  onChange({ ...curve, series: curve.series.filter((_, j) => j !== i) });
                }
              }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

function SeriesEditor({
  series,
  onChange,
  onRemove,
}: {
  series: CurveSeries;
  onChange: (series: CurveSeries) => void;
  onRemove: () => void;
}) {
  const [tab, setTab] = useState<'table' | 'csv'>('table');
  const [text, setText] = useState(() => series.points.map(([x, y]) => `${x},${y}`).join('\n'));
  const [draft, setDraft] = useState<Record<string, string>>({});

  // Keep CSV view in sync if external points change.
  useEffect(() => {
    setText(series.points.map(([x, y]) => `${x},${y}`).join('\n'));
    // Keep CSV text in sync when series.id changes only; other internal changes are handled elsewhere
  }, [series.id]);

  const parseCsv = (raw: string): [number, number][] =>
    raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [x, y] = l.split(/[,\s\t]+/).map(Number);
        return [Number.isFinite(x) ? x : 0, Number.isFinite(y) ? y : 0] as [number, number];
      });

  const updateRow = (idx: number, axis: 0 | 1, v: number) => {
    const next = series.points.map((p, i) => {
      if (i !== idx) return p;
      return [axis === 0 ? v : p[0], axis === 1 ? v : p[1]] as [number, number];
    });
    onChange({ ...series, points: next });
  };

  const draftKey = (rowIdx: number, axis: 0 | 1) => `${rowIdx}:${axis}`;

  const commitDraft = (rowIdx: number, axis: 0 | 1) => {
    const key = draftKey(rowIdx, axis);
    const raw = draft[key];
    if (raw === undefined) return;
    const trimmed = raw.trim();
    const v = trimmed === '' ? NaN : Number(trimmed);
    if (Number.isFinite(v)) updateRow(rowIdx, axis, v);
    setDraft((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const isDraftInvalid = (key: string) => {
    const raw = draft[key];
    if (raw === undefined || raw.trim() === '') return false;
    return !Number.isFinite(Number(raw.trim()));
  };

  const removeRow = (idx: number) => {
    if (!window.confirm('Delete this point? This cannot be undone.')) return;
    setDraft({});
    onChange({ ...series, points: series.points.filter((_, i) => i !== idx) });
  };

  const addRow = () => {
    const last = series.points[series.points.length - 1] ?? [0, 0];
    onChange({ ...series, points: [...series.points, [last[0], last[1]] as [number, number]] });
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text');
    // Tab- or comma- or whitespace-separated 2+ column data -> multi-row insert.
    const lines = pasted
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    const parsed = lines.map((l) => l.split(/[\s,;\t]+/).map(Number));
    const looksLikeMulti = parsed.every(
      (row) => row.length >= 2 && row.slice(0, 2).every((v) => Number.isFinite(v)),
    );
    if (looksLikeMulti) {
      e.preventDefault();
      const newPoints = parsed.map((row) => [row[0], row[1]] as [number, number]);
      onChange({ ...series, points: [...series.points, ...newPoints] });
      setText([...text.split('\n'), ...lines].join('\n'));
    }
  };

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50/40 p-2">
      <div className="mb-1 grid grid-cols-[1fr_1fr_24px] items-center gap-1">
        <TextInput
          size="xs"
          value={series.name}
          placeholder="Series name"
          onChange={(e) => onChange({ ...series, name: e.target.value })}
        />
        <TextInput
          size="xs"
          value={series.condition ?? ''}
          placeholder="Condition (e.g. VGS=10V)"
          onChange={(e) => onChange({ ...series, condition: e.target.value })}
        />
        <IconButton onClick={onRemove} title="Remove" className="text-red-500 hover:text-red-600">
          <XIcon className="h-3 w-3" />
        </IconButton>
      </div>

      <div className="mb-1 flex items-center gap-1 text-[10px] text-gray-500">
        <button
          type="button"
          onClick={() => setTab('table')}
          className={`rounded px-2 py-0.5 ${tab === 'table' ? 'bg-gray-200 text-gray-900' : 'hover:text-gray-900'}`}
        >
          Table
        </button>
        <button
          type="button"
          onClick={() => setTab('csv')}
          className={`rounded px-2 py-0.5 ${tab === 'csv' ? 'bg-gray-200 text-gray-900' : 'hover:text-gray-900'}`}
        >
          CSV
        </button>
        <span className="ml-auto">{series.points.length} points</span>
      </div>

      {tab === 'table' ? (
        <div className="max-h-64 overflow-auto rounded border border-gray-200 bg-white">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-gray-100">
              <tr className="text-left text-gray-500">
                <th className="w-10 px-2 py-1 font-medium">#</th>
                <th className="px-2 py-1 font-medium">X</th>
                <th className="px-2 py-1 font-medium">Y</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {series.points.map(([x, y], i) => (
                <tr key={i} className="odd:bg-gray-50">
                  <td className="px-2 py-0.5 text-gray-400">{i + 1}</td>
                  <td className="px-1 py-0.5">
                    <TextInput
                      size="xs"
                      value={draft[draftKey(i, 0)] ?? String(x)}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, [draftKey(i, 0)]: e.target.value }))
                      }
                      onBlur={() => commitDraft(i, 0)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur();
                      }}
                      className={
                        isDraftInvalid(draftKey(i, 0)) ? '!border-red-500 !text-red-600' : ''
                      }
                    />
                  </td>
                  <td className="px-1 py-0.5">
                    <TextInput
                      size="xs"
                      value={draft[draftKey(i, 1)] ?? String(y)}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, [draftKey(i, 1)]: e.target.value }))
                      }
                      onBlur={() => commitDraft(i, 1)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur();
                      }}
                      className={
                        isDraftInvalid(draftKey(i, 1)) ? '!border-red-500 !text-red-600' : ''
                      }
                    />
                  </td>
                  <td className="px-1 py-0.5 text-center">
                    <IconButton className="h-5 w-5" onClick={() => removeRow(i)}>
                      <XIcon className="h-2.5 w-2.5" />
                    </IconButton>
                  </td>
                </tr>
              ))}
              {series.points.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-2 py-2 text-center text-gray-400">
                    No points yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handlePaste}
          onBlur={() => onChange({ ...series, points: parseCsv(text) })}
          rows={Math.min(8, Math.max(3, text.split('\n').length))}
          className="font-mono text-[11px]"
          placeholder={'x1,y1\nx2,y2\n... (paste a 2-column block to bulk add)'}
        />
      )}

      <div className="mt-1 flex items-center justify-between gap-1">
        <AddButton onClick={addRow}>
          <PlusIcon className="h-3 w-3" /> Add point
        </AddButton>
        {tab === 'csv' && (
          <span className="text-[10px] text-gray-400">
            CSV per line - paste a block to bulk add
          </span>
        )}
      </div>
    </div>
  );
}
