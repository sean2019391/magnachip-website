'use client'

import { useEffect, useState } from 'react'
import type { Column, Row, Section, SectionType } from '@/types/datasheet'
import { newId } from '@/types/datasheet'
import {
  AddButton,
  Card,
  ChevronDownIcon,
  ChevronUpIcon,
  Field,
  IconButton,
  PlusIcon,
  SelectInput,
  TextInput,
  TrashIcon,
  XIcon,
} from './ui'

const SECTION_TYPES: SectionType[] = [
  'absoluteMax',
  'static',
  'dynamic',
  'diode',
  'gateCharge',
  'thermal',
  'avalanche',
  'soa',
  'custom',
  'notes',
]

export function SectionsEditor({
  sections,
  onChange,
}: {
  sections: Section[]
  onChange: (sections: Section[]) => void
}) {
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null)
  const selectedId = sections.some((s) => s.id === activeId) ? activeId : (sections[0]?.id ?? null)
  const active = sections.find((s) => s.id === selectedId) ?? null

  useEffect(() => {
    if (selectedId !== activeId) setActiveId(selectedId)
  }, [selectedId, activeId])

  const addSection = () => {
    const id = newId('sec')
    const newSec: Section = {
      id,
      type: 'custom',
      title: 'New section',
      columns: [
        { id: newId('col'), header: 'Parameter', type: 'text' },
        { id: newId('col'), header: 'Value', type: 'text' },
      ],
      rows: [{ id: newId('row'), cells: ['', ''], notes: [] }],
      notes: [],
    }
    onChange([...sections, newSec])
    setActiveId(id)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Sections</h3>
        <AddButton onClick={addSection}>
          <PlusIcon className="h-3 w-3" /> Add section
        </AddButton>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveId(s.id)}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-colors ${
              selectedId === s.id
                ? 'border-black bg-gray-100 text-gray-900'
                : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            <span className="rounded-full border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
              {s.type}
            </span>
            <span className="max-w-[150px] truncate">{s.title}</span>
          </button>
        ))}
      </div>

      {active && (
        <SectionEditor
          section={active}
          onChange={(next) => onChange(sections.map((s) => (s.id === next.id ? next : s)))}
          onRemove={() => {
            if (!window.confirm(`Delete section "${active.title}"? This cannot be undone.`)) return
            const idx = sections.findIndex((s) => s.id === active.id)
            const remaining = sections.filter((s) => s.id !== active.id)
            onChange(remaining)
            setActiveId(remaining[Math.min(idx, remaining.length - 1)]?.id ?? null)
          }}
          onMoveUp={() => {
            const idx = sections.findIndex((s) => s.id === active.id)
            if (idx <= 0) return
            const arr = [...sections]
            ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
            onChange(arr)
          }}
          onMoveDown={() => {
            const idx = sections.findIndex((s) => s.id === active.id)
            if (idx < 0 || idx === sections.length - 1) return
            const arr = [...sections]
            ;[arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]]
            onChange(arr)
          }}
        />
      )}
    </div>
  )
}

function SectionEditor({
  section,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  section: Section
  onChange: (section: Section) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const nextNoteNumber = section.notes.reduce((max, n) => {
    const m = /(\d+)/.exec(n.label)
    return Math.max(max, m ? parseInt(m[1], 10) : 0)
  }, 0) + 1
  return (
    <Card>
      <div className="space-y-2 px-4 pt-3">
        <div className="flex items-center gap-1">
          <TextInput
            value={section.title}
            onChange={(e) => onChange({ ...section, title: e.target.value })}
            className="border-transparent px-1 text-sm font-semibold hover:border-gray-200 focus-visible:border-gray-400"
          />
          <IconButton onClick={onMoveUp} title="Move up">
            <ChevronUpIcon className="h-3 w-3" />
          </IconButton>
          <IconButton onClick={onMoveDown} title="Move down">
            <ChevronDownIcon className="h-3 w-3" />
          </IconButton>
          <IconButton onClick={onRemove} title="Delete" className="text-red-500 hover:text-red-600">
            <TrashIcon className="h-3 w-3" />
          </IconButton>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <Field label="Type">
            <SelectInput
              size="sm"
              value={section.type}
              onChange={(v) => onChange({ ...section, type: v as SectionType })}
              options={SECTION_TYPES}
            />
          </Field>
          <Field label="Subtitle">
            <TextInput
              size="sm"
              value={section.subtitle ?? ''}
              onChange={(e) => onChange({ ...section, subtitle: e.target.value })}
              placeholder="e.g. at TC=25C unless otherwise specified"
            />
          </Field>
        </div>
      </div>

      <div className="space-y-3 px-4 pb-4">
        {/* Columns */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Columns</span>
            <AddButton
              onClick={() =>
                onChange({
                  ...section,
                  columns: [...section.columns, { id: newId('col'), header: 'Header', type: 'text' }],
                  rows: section.rows.map((r) => ({ ...r, cells: [...r.cells, ''] })),
                })
              }
            >
              <PlusIcon className="h-3 w-3" /> Column
            </AddButton>
          </div>
          <div className="space-y-1">
            {section.columns.map((c, i) => (
              <div key={c.id} className="grid grid-cols-[1fr_70px_80px_24px] items-center gap-1">
                <TextInput
                  size="sm"
                  value={c.header}
                  onChange={(e) =>
                    onChange({
                      ...section,
                      columns: section.columns.map((x, j) => (j === i ? { ...x, header: e.target.value } : x)),
                    })
                  }
                />
                <TextInput
                  size="sm"
                  value={c.unit ?? ''}
                  placeholder="unit"
                  onChange={(e) =>
                    onChange({
                      ...section,
                      columns: section.columns.map((x, j) => (j === i ? { ...x, unit: e.target.value } : x)),
                    })
                  }
                />
                <SelectInput
                  size="sm"
                  value={c.type}
                  onChange={(v) =>
                    onChange({
                      ...section,
                      columns: section.columns.map((x, j) => (j === i ? { ...x, type: v as Column['type'] } : x)),
                    })
                  }
                  options={['text', 'number']}
                />
                <IconButton
                  title="Remove"
                  onClick={() => {
                    if (!window.confirm('Remove this column and its cell values?')) return
                    onChange({
                      ...section,
                      columns: section.columns.filter((_, j) => j !== i),
                      rows: section.rows.map((r) => ({ ...r, cells: r.cells.filter((_, ci) => ci !== i) })),
                    })
                  }}
                >
                  <XIcon className="h-3 w-3" />
                </IconButton>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Rows */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Rows ({section.rows.length})</span>
            <AddButton
              onClick={() =>
                onChange({
                  ...section,
                  rows: [
                    ...section.rows,
                    { id: newId('row'), cells: section.columns.map(() => ''), notes: [] },
                  ],
                })
              }
            >
              <PlusIcon className="h-3 w-3" /> Row
            </AddButton>
          </div>
          <div className="space-y-1.5">
            {section.rows.map((r, i) => (
              <RowEditor
                key={r.id}
                row={r}
                columnsCount={section.columns.length}
                onChange={(nr) =>
                  onChange({ ...section, rows: section.rows.map((x, j) => (j === i ? nr : x)) })
                }
                onRemove={() => {
                  if (window.confirm('Delete this row? This cannot be undone.')) {
                    onChange({ ...section, rows: section.rows.filter((_, j) => j !== i) })
                  }
                }}
                onMoveUp={() => {
                  if (i === 0) return
                  const arr = [...section.rows]
                  ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
                  onChange({ ...section, rows: arr })
                }}
                onMoveDown={() => {
                  if (i === section.rows.length - 1) return
                  const arr = [...section.rows]
                  ;[arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]
                  onChange({ ...section, rows: arr })
                }}
              />
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Footnotes */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Footnotes</span>
            <AddButton
              onClick={() =>
                onChange({
                  ...section,
                  notes: [...section.notes, { label: `${nextNoteNumber})`, text: '' }],
                })
              }
            >
              <PlusIcon className="h-3 w-3" /> Note
            </AddButton>
          </div>
          <div className="space-y-1">
            {section.notes.map((n, i) => (
              <div key={i} className="grid grid-cols-[60px_1fr_24px] items-center gap-1">
                <TextInput
                  size="sm"
                  value={n.label}
                  onChange={(e) =>
                    onChange({
                      ...section,
                      notes: section.notes.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                    })
                  }
                />
                <TextInput
                  size="sm"
                  value={n.text}
                  onChange={(e) =>
                    onChange({
                      ...section,
                      notes: section.notes.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)),
                    })
                  }
                />
                <IconButton
                  title="Remove"
                  onClick={() => onChange({ ...section, notes: section.notes.filter((_, j) => j !== i) })}
                >
                  <XIcon className="h-3 w-3" />
                </IconButton>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

function RowEditor({
  row,
  columnsCount,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  row: Row
  columnsCount: number
  onChange: (row: Row) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50/40 p-1.5">
      <div
        className="grid items-center gap-1"
        style={{ gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr)) 90px 64px` }}
      >
        {Array.from({ length: columnsCount }).map((_, ci) => (
          <TextInput
            key={ci}
            size="xs"
            value={row.cells[ci] ?? ''}
            onChange={(e) => {
              const next = [...row.cells]
              next[ci] = e.target.value
              onChange({ ...row, cells: next })
            }}
          />
        ))}
        <TextInput
          size="xs"
          value={row.notes.join(' ')}
          placeholder="1) 2)"
          onChange={(e) =>
            onChange({
              ...row,
              notes: e.target.value ? e.target.value.split(/[\s,]+/).filter(Boolean) : [],
            })
          }
        />
        <div className="flex items-center gap-0.5">
          <IconButton onClick={onMoveUp} className="h-6 w-6">
            <ChevronUpIcon className="h-3 w-3" />
          </IconButton>
          <IconButton onClick={onMoveDown} className="h-6 w-6">
            <ChevronDownIcon className="h-3 w-3" />
          </IconButton>
          <IconButton
            onClick={onRemove}
            className="h-6 w-6 text-red-500 hover:text-red-600"
            title="Delete"
          >
            <XIcon className="h-3 w-3" />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
