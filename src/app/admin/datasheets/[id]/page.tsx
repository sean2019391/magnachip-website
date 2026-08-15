'use client'

import { use, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { newId } from '@/types/datasheet'
import type {
  CellType,
  Column,
  Cover,
  Curve,
  CurveSeries,
  DatasheetMeta,
  DatasheetRecord,
  Feature,
  KeyPerformance,
  NoteRef,
  Ordering,
  Package,
  Row,
  Section,
  SectionType,
} from '@/types/datasheet'
import { DatasheetViewer } from '@/components/datasheet/DatasheetViewer'
import { MetaEditor } from '@/components/datasheet-editor/MetaEditor'
import { CoverEditor } from '@/components/datasheet-editor/CoverEditor'
import { SectionsEditor } from '@/components/datasheet-editor/SectionsEditor'
import { CurvesEditor } from '@/components/datasheet-editor/CurvesEditor'
import { PackageEditor } from '@/components/datasheet-editor/PackageEditor'
import {
  ArrowLeftIcon,
  DownloadIcon,
  SaveIcon,
  TrashIcon,
  UploadIcon,
  XIcon,
} from '@/components/datasheet-editor/ui'

type SidebarTab = 'meta' | 'cover' | 'sections' | 'curves' | 'package'
type ViewMode = 'editor' | 'split' | 'preview'

const TABS: { key: SidebarTab; label: string }[] = [
  { key: 'meta', label: 'Meta' },
  { key: 'cover', label: 'Cover' },
  { key: 'sections', label: 'Data' },
  { key: 'curves', label: 'Curves' },
  { key: 'package', label: 'Pkg' },
]

const VIEW_MODES: ViewMode[] = ['editor', 'split', 'preview']

const SECTION_TYPE_VALUES: ReadonlySet<SectionType> = new Set<SectionType>([
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
])

const DATASHEET_META_KEYS: (keyof DatasheetMeta)[] = [
  'title',
  'partNumber',
  'version',
  'date',
  'company',
  'classification',
  'disclaimer',
]

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function normalizeNoteRefs(raw: unknown): NoteRef[] {
  if (!Array.isArray(raw)) return []
  const notes: NoteRef[] = []
  for (const item of raw) {
    const obj = asRecord(item)
    if (!obj || typeof obj.text !== 'string') continue
    notes.push({ label: asString(obj.label), text: obj.text })
  }
  return notes
}

function normalizeColumns(raw: unknown): Column[] {
  if (!Array.isArray(raw)) return []
  const columns: Column[] = []
  for (const item of raw) {
    const obj = asRecord(item)
    if (!obj) continue
    const header = asOptionalString(obj.header) ?? asOptionalString(obj.label) ?? ''
    const type: CellType = obj.type === 'number' ? 'number' : 'text'
    const unit = asOptionalString(obj.unit)
    const width = typeof obj.width === 'number' && Number.isFinite(obj.width) ? obj.width : undefined
    columns.push({
      id: newId('col'),
      header,
      type,
      ...(unit !== undefined ? { unit } : {}),
      ...(width !== undefined ? { width } : {}),
    })
  }
  return columns
}

function normalizeRows(raw: unknown, columnCount: number): Row[] {
  if (!Array.isArray(raw)) return []
  const rows: Row[] = []
  for (const item of raw) {
    const obj = asRecord(item)
    if (!obj) continue
    const rawCells = Array.isArray(obj.cells) ? obj.cells.filter((c): c is string => typeof c === 'string') : []
    const cells = Array.from({ length: columnCount }, (_, i) => rawCells[i] ?? '')
    const notes = Array.isArray(obj.notes) ? obj.notes.filter((n): n is string => typeof n === 'string') : []
    rows.push({ id: newId('row'), cells, notes })
  }
  return rows
}

function normalizeSections(raw: unknown): { ok: true; sections: Section[] } | { ok: false; error: string } {
  if (!Array.isArray(raw)) {
    return { ok: false, error: 'Imported JSON must contain a valid "sections" array.' }
  }
  const sections: Section[] = []
  for (const item of raw) {
    const obj = asRecord(item)
    if (!obj) continue
    const rawType = obj.type
    const type: SectionType =
      typeof rawType === 'string' && SECTION_TYPE_VALUES.has(rawType as SectionType)
        ? (rawType as SectionType)
        : 'static'
    const title = asString(obj.title)
    const subtitle = asOptionalString(obj.subtitle)
    const columns = normalizeColumns(obj.columns)
    const rows = normalizeRows(obj.rows, columns.length)
    sections.push({
      id: newId('sec'),
      type,
      title,
      ...(subtitle !== undefined ? { subtitle } : {}),
      columns,
      rows,
      notes: normalizeNoteRefs(obj.notes),
    })
  }
  return { ok: true, sections }
}

function normalizeSeries(raw: unknown): CurveSeries[] {
  if (!Array.isArray(raw)) return []
  const series: CurveSeries[] = []
  for (const item of raw) {
    const obj = asRecord(item)
    if (!obj) continue
    const points: [number, number][] = []
    if (Array.isArray(obj.points)) {
      for (const point of obj.points) {
        if (!Array.isArray(point) || point.length < 2) continue
        const x = Number(point[0])
        const y = Number(point[1])
        if (Number.isFinite(x) && Number.isFinite(y)) points.push([x, y])
      }
    }
    const condition = asOptionalString(obj.condition)
    const color = asOptionalString(obj.color)
    const dash = asOptionalString(obj.dash)
    series.push({
      id: newId('series'),
      name: asString(obj.name),
      ...(condition !== undefined ? { condition } : {}),
      points,
      ...(color !== undefined ? { color } : {}),
      ...(dash !== undefined ? { dash } : {}),
      ...(typeof obj.showMarkers === 'boolean' ? { showMarkers: obj.showMarkers } : {}),
    })
  }
  return series
}

function normalizeCurves(raw: unknown): { ok: true; curves: Curve[] } | { ok: false; error: string } {
  if (!Array.isArray(raw)) {
    return { ok: false, error: 'Imported JSON must contain a valid "curves" array.' }
  }
  const curves: Curve[] = []
  for (const item of raw) {
    const obj = asRecord(item)
    if (!obj) continue
    const xScale: Curve['xScale'] = obj.xScale === 'log' ? 'log' : 'linear'
    const yScale: Curve['yScale'] = obj.yScale === 'log' ? 'log' : 'linear'
    const xUnit = asOptionalString(obj.xUnit)
    const yUnit = asOptionalString(obj.yUnit)
    curves.push({
      id: newId('curve'),
      figure: asString(obj.figure),
      title: asString(obj.title),
      xLabel: asString(obj.xLabel),
      yLabel: asString(obj.yLabel),
      ...(xUnit !== undefined ? { xUnit } : {}),
      ...(yUnit !== undefined ? { yUnit } : {}),
      xScale,
      yScale,
      series: normalizeSeries(obj.series),
      notes: normalizeNoteRefs(obj.notes),
    })
  }
  return { ok: true, curves }
}

function normalizeFeatures(raw: unknown): Feature[] {
  if (!Array.isArray(raw)) return []
  const features: Feature[] = []
  for (const item of raw) {
    const obj = asRecord(item)
    if (!obj || typeof obj.text !== 'string') continue
    const icon = asOptionalString(obj.icon)
    features.push({ text: obj.text, ...(icon !== undefined ? { icon } : {}) })
  }
  return features
}

function normalizeKeyPerformance(raw: unknown): KeyPerformance[] {
  if (!Array.isArray(raw)) return []
  const items: KeyPerformance[] = []
  for (const item of raw) {
    const obj = asRecord(item)
    if (!obj) continue
    const unit = asOptionalString(obj.unit)
    items.push({
      label: asString(obj.label),
      value: asString(obj.value),
      highlight: typeof obj.highlight === 'boolean' ? obj.highlight : false,
      ...(unit !== undefined ? { unit } : {}),
    })
  }
  return items
}

function normalizeOrdering(raw: unknown): Ordering | undefined {
  const obj = asRecord(raw)
  if (!obj) return undefined
  const ordering: Ordering = {}
  const keys: (keyof Ordering)[] = ['type', 'package', 'marking', 'packing', 'rohs', 'url']
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'string') ordering[key] = value
  }
  return ordering
}

function normalizeCover(raw: unknown): Cover {
  const obj = asRecord(raw) ?? {}
  const subtitle = asOptionalString(obj.subtitle)
  const packageImageUrl = asOptionalString(obj.packageImageUrl)
  const packageImageCaption = asOptionalString(obj.packageImageCaption)
  const ordering = normalizeOrdering(obj.ordering)
  return {
    ...(subtitle !== undefined ? { subtitle } : {}),
    features: normalizeFeatures(obj.features),
    validation: normalizeFeatures(obj.validation),
    keyPerformance: normalizeKeyPerformance(obj.keyPerformance),
    ...(ordering !== undefined ? { ordering } : {}),
    ...(packageImageUrl !== undefined ? { packageImageUrl } : {}),
    ...(packageImageCaption !== undefined ? { packageImageCaption } : {}),
  }
}

function normalizePackage(raw: unknown): Package {
  const obj = asRecord(raw) ?? {}
  const name = asOptionalString(obj.name)
  const imageUrl = asOptionalString(obj.imageUrl)
  const notes = Array.isArray(obj.notes) ? obj.notes.filter((n): n is string => typeof n === 'string') : []
  return {
    ...(name !== undefined ? { name } : {}),
    ...(imageUrl !== undefined ? { imageUrl } : {}),
    notes,
  }
}

function normalizeMeta(raw: unknown): Partial<DatasheetMeta> {
  const obj = asRecord(raw)
  if (!obj) return {}
  const meta: Partial<DatasheetMeta> = {}
  for (const key of DATASHEET_META_KEYS) {
    const value = obj[key]
    if (typeof value === 'string') meta[key] = value
  }
  return meta
}

export default function DatasheetEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [doc, setDoc] = useState<DatasheetRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedJson, setSavedJson] = useState('')
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('meta')
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState<string | null>(null)

  const docRef = useRef<DatasheetRecord | null>(null)

  const commitDoc = (updater: (prev: DatasheetRecord | null) => DatasheetRecord | null) => {
    setDoc((prev) => {
      const next = updater(prev)
      docRef.current = next
      return next
    })
  }

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/datasheets/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.datasheet) {
          setDoc(data.datasheet)
          docRef.current = data.datasheet
          setSavedJson(JSON.stringify(data.datasheet))
        } else {
          setSaveError(data.error ?? 'Failed to load datasheet')
        }
        setLoading(false)
      })
      .catch(() => {
        setSaveError('Failed to load datasheet')
        setLoading(false)
      })
  }, [id])

  const dirty = doc !== null && JSON.stringify(doc) !== savedJson

  const patch = (updater: (d: DatasheetRecord) => DatasheetRecord) => {
    commitDoc((prev) => (prev ? updater(prev) : prev))
  }

  const confirmDiscard = () => {
    if (dirty && !window.confirm('You have unsaved changes. Leave anyway?')) {
      return false
    }
    return true
  }

  useEffect(() => {
    if (!dirty) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [dirty])

  useEffect(() => {
    if (!importOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeImport()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [importOpen])

  const handleSave = async () => {
    if (!doc) return
    setSaving(true)
    setSaveError(null)
    const sentJson = JSON.stringify(doc)
    try {
      const res = await fetch(`/api/datasheets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: sentJson,
      })
      const data = await res.json()
      if (res.ok && data.datasheet) {
        if (docRef.current !== null && JSON.stringify(docRef.current) === sentJson) {
          commitDoc(() => data.datasheet)
          setSavedJson(JSON.stringify(data.datasheet))
        }
      } else {
        setSaveError(data.error ?? 'Failed to save datasheet')
      }
    } catch {
      setSaveError('Failed to save datasheet')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!doc) return
    if (!window.confirm('Are you sure you want to delete this datasheet?')) return
    try {
      const res = await fetch(`/api/datasheets/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin/datasheets')
      } else {
        alert('Failed to delete datasheet')
      }
    } catch {
      alert('Failed to delete datasheet')
    }
  }

  const handleExportJson = () => {
    if (!doc) return
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.meta.partNumber}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    try {
      const parsed: unknown = JSON.parse(importText)
      const src = asRecord(parsed)
      if (!src) {
        setImportError('Invalid JSON. Make sure it matches the datasheet schema.')
        return
      }
      const sectionsResult = normalizeSections(src.sections)
      if (!sectionsResult.ok) {
        setImportError(sectionsResult.error)
        return
      }
      const curvesResult = normalizeCurves(src.curves)
      if (!curvesResult.ok) {
        setImportError(curvesResult.error)
        return
      }
      const cover = src.cover !== null && src.cover !== undefined ? normalizeCover(src.cover) : undefined
      const pkg = src.pkg !== null && src.pkg !== undefined ? normalizePackage(src.pkg) : undefined
      const meta = normalizeMeta(src.meta)
      commitDoc((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          id: prev.id,
          published: typeof src.published === 'boolean' ? src.published : prev.published,
          createdAt: prev.createdAt,
          updatedAt: prev.updatedAt,
          schemaVersion: prev.schemaVersion,
          meta: { ...prev.meta, ...meta },
          cover: cover ?? prev.cover,
          sections: sectionsResult.sections,
          curves: curvesResult.curves,
          pkg: pkg ?? prev.pkg,
        }
      })
      setSavedJson('')
      setImportOpen(false)
      setImportText('')
      setImportError(null)
    } catch {
      setImportError('Invalid JSON. Make sure it matches the datasheet schema.')
    }
  }

  const closeImport = () => {
    setImportOpen(false)
    setImportText('')
    setImportError(null)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-sm text-red-500">{saveError ?? 'Datasheet not found.'}</p>
          <Link
            href="/admin/datasheets"
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Back to datasheets
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 px-4 py-2 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/datasheets"
            title="Back to datasheets"
            onClick={(e) => {
              if (!confirmDiscard()) e.preventDefault()
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>

          <label htmlFor="datasheet-part-number" className="sr-only">
            Part number
          </label>
          <input
            id="datasheet-part-number"
            value={doc.meta.partNumber}
            onChange={(e) =>
              patch((d) => ({ ...d, meta: { ...d.meta, partNumber: e.target.value, title: e.target.value } }))
            }
            className="w-64 rounded-md border border-transparent bg-transparent px-2 py-1.5 text-base font-semibold text-gray-900 transition-colors outline-none hover:border-gray-200 focus:border-gray-400"
          />
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
            v{doc.meta.version}
          </span>
          <span className={`text-[11px] ${dirty ? 'text-amber-600' : 'text-gray-400'}`}>
            {dirty ? 'Unsaved changes' : 'Saved'}
          </span>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5 text-xs">
              {VIEW_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setViewMode(m)}
                  aria-pressed={viewMode === m}
                  className={`rounded-md px-2 py-1 font-medium capitalize transition-colors ${
                    viewMode === m ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              onClick={() => setImportOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <UploadIcon className="h-4 w-4" /> Import
            </button>
            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <DownloadIcon className="h-4 w-4" /> Export JSON
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-1 rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              <SaveIcon className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
        {saveError && (
          <div className="mt-2 border-t border-red-100 bg-red-50 px-2 py-2 text-sm text-red-600">
            {saveError}
          </div>
        )}
      </header>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col lg:flex-row">
        {viewMode !== 'preview' && (
          <aside className="w-full shrink-0 border-b border-gray-200 bg-white lg:sticky lg:top-[52px] lg:h-[calc(100vh-52px)] lg:w-[400px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
            {/* Tabs */}
            <div role="tablist" className="sticky top-0 z-10 grid grid-cols-5 gap-1 border-b border-gray-100 bg-white p-2">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={sidebarTab === t.key}
                  onClick={() => setSidebarTab(t.key)}
                  className={`rounded-md px-1 py-1.5 text-xs font-medium transition-colors ${
                    sidebarTab === t.key
                      ? 'bg-black text-white'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-3">
              {sidebarTab === 'meta' && (
                <MetaEditor meta={doc.meta} onChange={(meta) => patch((d) => ({ ...d, meta }))} />
              )}
              {sidebarTab === 'cover' && (
                <CoverEditor cover={doc.cover} onChange={(cover) => patch((d) => ({ ...d, cover }))} />
              )}
              {sidebarTab === 'sections' && (
                <SectionsEditor
                  sections={doc.sections}
                  onChange={(sections) => patch((d) => ({ ...d, sections }))}
                />
              )}
              {sidebarTab === 'curves' && (
                <CurvesEditor
                  curves={doc.curves}
                  onChange={(curves) => patch((d) => ({ ...d, curves }))}
                />
              )}
              {sidebarTab === 'package' && (
                <PackageEditor pkg={doc.pkg} onChange={(pkg) => patch((d) => ({ ...d, pkg }))} />
              )}
            </div>
          </aside>
        )}

        {/* Preview */}
        {viewMode !== 'editor' && (
          <main className="min-h-0 flex-1 overflow-x-auto">
            <div className="mx-auto my-6 max-w-[1100px] px-4">
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <DatasheetViewer d={doc} />
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Import JSON dialog */}
      {importOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Import JSON"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Import datasheet JSON</h3>
                <p className="text-sm text-gray-500">
                  Paste a datasheet JSON file exported from this app.
                </p>
              </div>
              <button
                onClick={closeImport}
                aria-label="Close"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <label htmlFor="import-json-input" className="sr-only">
              Import datasheet JSON
            </label>
            <textarea
              id="import-json-input"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="min-h-[180px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-900 transition-colors outline-none focus:border-black focus:ring-1 focus:ring-black"
              placeholder='{ "schemaVersion": 1, "meta": { ... } }'
            />
            {importError && <p className="mt-2 text-xs text-red-600">{importError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeImport}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="inline-flex items-center gap-1 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                <UploadIcon className="h-4 w-4" /> Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
