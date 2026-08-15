'use client'

import type { DatasheetMeta } from '@/types/datasheet'
import { Card, Field, TextArea, TextInput } from './ui'

export function MetaEditor({
  meta,
  onChange,
}: {
  meta: DatasheetMeta
  onChange: (meta: DatasheetMeta) => void
}) {
  return (
    <div className="space-y-3">
      <Card title="Datasheet info">
        <Field label="Title">
          <TextInput
            value={meta.title}
            onChange={(e) => onChange({ ...meta, title: e.target.value })}
          />
        </Field>
        <Field label="Part number">
          <TextInput
            value={meta.partNumber}
            onChange={(e) => onChange({ ...meta, partNumber: e.target.value })}
          />
        </Field>
        <Field label="Version">
          <TextInput
            value={meta.version}
            onChange={(e) => onChange({ ...meta, version: e.target.value })}
          />
        </Field>
        <Field label="Date">
          <TextInput
            value={meta.date}
            onChange={(e) => onChange({ ...meta, date: e.target.value })}
          />
        </Field>
        <Field label="Company">
          <TextInput
            value={meta.company}
            onChange={(e) => onChange({ ...meta, company: e.target.value })}
          />
        </Field>
        <Field label="Classification">
          <TextInput
            value={meta.classification}
            onChange={(e) => onChange({ ...meta, classification: e.target.value })}
          />
        </Field>
      </Card>

      <Card title="Disclaimer">
        <label htmlFor="meta-disclaimer" className="sr-only">
          Disclaimer
        </label>
        <TextArea
          id="meta-disclaimer"
          rows={5}
          value={meta.disclaimer}
          onChange={(e) => onChange({ ...meta, disclaimer: e.target.value })}
        />
      </Card>
    </div>
  )
}
