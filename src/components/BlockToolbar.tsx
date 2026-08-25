'use client';

import React from 'react';

type Props = {
  onAdd?: () => void;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

export default function BlockToolbar({ onAdd, onRemove, onMoveUp, onMoveDown }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onMoveUp}
        title="Move up"
        className="text-xs px-2 py-1 rounded border border-gray-200 bg-gray-50"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        title="Move down"
        className="text-xs px-2 py-1 rounded border border-gray-200 bg-gray-50"
      >
        ↓
      </button>
      <button
        type="button"
        onClick={onAdd}
        title="Add block"
        className="text-xs px-2 py-1 rounded border border-gray-200 bg-gray-50"
      >
        +
      </button>
      <button
        type="button"
        onClick={onRemove}
        title="Remove block"
        className="text-xs px-2 py-1 rounded border border-gray-200 bg-red-50 text-red-600"
      >
        ✕
      </button>
    </div>
  );
}
