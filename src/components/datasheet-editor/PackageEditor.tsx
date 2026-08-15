'use client';

import type { Package } from '@/types/datasheet';
import { AddButton, Card, IconButton, PlusIcon, TextInput, XIcon } from './ui';

export function PackageEditor({
  pkg,
  onChange,
}: {
  pkg?: Package;
  onChange: (pkg: Package) => void;
}) {
  const p: Package = pkg ?? { name: '', notes: [] };

  return (
    <div className="space-y-3">
      <Card title="Name">
        <TextInput
          value={p.name ?? ''}
          placeholder="e.g. TOLL"
          onChange={(e) => onChange({ ...p, name: e.target.value })}
        />
      </Card>

      <Card title="Image (URL or data URL)">
        <TextInput
          value={p.imageUrl ?? ''}
          placeholder="https://..."
          onChange={(e) => onChange({ ...p, imageUrl: e.target.value })}
        />
        {p.imageUrl && (
          <img
            src={p.imageUrl}
            alt="package"
            className="max-h-40 rounded border border-gray-200 bg-white p-2"
          />
        )}
      </Card>

      <Card
        title="Notes"
        action={
          <AddButton onClick={() => onChange({ ...p, notes: [...p.notes, 'New note'] })}>
            <PlusIcon className="h-3 w-3" /> Add
          </AddButton>
        }
      >
        {p.notes.map((n, i) => (
          <div key={i} className="flex items-center gap-1">
            <TextInput
              value={n}
              onChange={(e) =>
                onChange({ ...p, notes: p.notes.map((x, j) => (j === i ? e.target.value : x)) })
              }
            />
            <IconButton
              title="Remove"
              onClick={() => onChange({ ...p, notes: p.notes.filter((_, j) => j !== i) })}
            >
              <XIcon className="h-3 w-3" />
            </IconButton>
          </div>
        ))}
      </Card>
    </div>
  );
}
