'use client';

import type { Cover, Ordering } from '@/types/datasheet';
import { AddButton, Card, Field, IconButton, PlusIcon, TextInput, XIcon } from './ui';

const ORDERING_FIELDS: { key: keyof Ordering; label: string }[] = [
  { key: 'type', label: 'Type / Code' },
  { key: 'package', label: 'Package' },
  { key: 'marking', label: 'Marking' },
  { key: 'packing', label: 'Packing' },
  { key: 'rohs', label: 'RoHS Status' },
  { key: 'url', label: 'URL' },
];

export function CoverEditor({
  cover,
  onChange,
}: {
  cover: Cover;
  onChange: (cover: Cover) => void;
}) {
  return (
    <div className="space-y-3">
      <Card title="Subtitle">
        <TextInput
          value={cover.subtitle ?? ''}
          onChange={(e) => onChange({ ...cover, subtitle: e.target.value })}
        />
      </Card>

      <Card
        title="Features"
        action={
          <AddButton
            onClick={() =>
              onChange({ ...cover, features: [...cover.features, { text: 'New feature' }] })
            }
          >
            <PlusIcon className="h-3 w-3" />
          </AddButton>
        }
      >
        {cover.features.map((f, i) => (
          <div key={i} className="flex items-center gap-1">
            <TextInput
              value={f.text}
              onChange={(e) =>
                onChange({
                  ...cover,
                  features: cover.features.map((x, j) =>
                    j === i ? { ...x, text: e.target.value } : x,
                  ),
                })
              }
            />
            <IconButton
              title="Remove"
              onClick={() =>
                onChange({ ...cover, features: cover.features.filter((_, j) => j !== i) })
              }
            >
              <XIcon className="h-3 w-3" />
            </IconButton>
          </div>
        ))}
      </Card>

      <Card
        title="Validation"
        action={
          <AddButton
            onClick={() =>
              onChange({ ...cover, validation: [...cover.validation, { text: 'New validation' }] })
            }
          >
            <PlusIcon className="h-3 w-3" />
          </AddButton>
        }
      >
        {cover.validation.map((f, i) => (
          <div key={i} className="flex items-center gap-1">
            <TextInput
              value={f.text}
              onChange={(e) =>
                onChange({
                  ...cover,
                  validation: cover.validation.map((x, j) =>
                    j === i ? { ...x, text: e.target.value } : x,
                  ),
                })
              }
            />
            <IconButton
              title="Remove"
              onClick={() =>
                onChange({ ...cover, validation: cover.validation.filter((_, j) => j !== i) })
              }
            >
              <XIcon className="h-3 w-3" />
            </IconButton>
          </div>
        ))}
      </Card>

      <Card
        title="Key Performance"
        action={
          <AddButton
            onClick={() =>
              onChange({
                ...cover,
                keyPerformance: [...cover.keyPerformance, { label: 'Param', value: '—', unit: '' }],
              })
            }
          >
            <PlusIcon className="h-3 w-3" />
          </AddButton>
        }
      >
        {cover.keyPerformance.map((k, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_64px_56px_24px] items-center gap-1">
            <TextInput
              size="sm"
              value={k.label}
              onChange={(e) =>
                onChange({
                  ...cover,
                  keyPerformance: cover.keyPerformance.map((x, j) =>
                    j === i ? { ...x, label: e.target.value } : x,
                  ),
                })
              }
            />
            <TextInput
              size="sm"
              value={k.value}
              onChange={(e) =>
                onChange({
                  ...cover,
                  keyPerformance: cover.keyPerformance.map((x, j) =>
                    j === i ? { ...x, value: e.target.value } : x,
                  ),
                })
              }
            />
            <TextInput
              size="sm"
              value={k.unit ?? ''}
              placeholder="unit"
              onChange={(e) =>
                onChange({
                  ...cover,
                  keyPerformance: cover.keyPerformance.map((x, j) =>
                    j === i ? { ...x, unit: e.target.value } : x,
                  ),
                })
              }
            />
            <label className="flex items-center justify-center gap-1 text-[10px] text-gray-500">
              <input
                type="checkbox"
                checked={k.highlight ?? false}
                onChange={(e) =>
                  onChange({
                    ...cover,
                    keyPerformance: cover.keyPerformance.map((x, j) =>
                      j === i ? { ...x, highlight: e.target.checked } : x,
                    ),
                  })
                }
                className="h-3.5 w-3.5 rounded border-gray-300 text-black focus:ring-black"
              />
              HL
            </label>
            <IconButton
              title="Remove"
              onClick={() =>
                onChange({
                  ...cover,
                  keyPerformance: cover.keyPerformance.filter((_, j) => j !== i),
                })
              }
            >
              <XIcon className="h-3 w-3" />
            </IconButton>
          </div>
        ))}
      </Card>

      <Card title="Ordering information">
        {ORDERING_FIELDS.map((f) => (
          <Field key={f.key} label={f.label}>
            <TextInput
              value={(cover.ordering ?? {})[f.key] ?? ''}
              onChange={(e) =>
                onChange({
                  ...cover,
                  ordering: { ...(cover.ordering ?? {}), [f.key]: e.target.value },
                })
              }
            />
          </Field>
        ))}
      </Card>

      <Card title="Package image (URL or data URL)">
        <TextInput
          value={cover.packageImageUrl ?? ''}
          placeholder="https://..."
          onChange={(e) => onChange({ ...cover, packageImageUrl: e.target.value })}
        />
        {cover.packageImageUrl && (
          <img
            src={cover.packageImageUrl}
            alt="package"
            className="max-h-40 rounded border border-gray-200 bg-white p-2"
          />
        )}
      </Card>
    </div>
  );
}
