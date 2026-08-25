'use client';

import React, { useState, useEffect } from 'react';
import BlockToolbar from './BlockToolbar';

type Props = {
  initialContent?: string;
  onChange?: (content: string) => void;
};

export default function EditorCanvas({ initialContent = '', onChange }: Props) {
  // simple block model: split paragraphs by two newlines
  const toBlocks = (s: string) => (s ? s.split(/\n\n+/).map((t) => t.trim()) : []);
  const fromBlocks = (blocks: string[]) => blocks.map((b) => b.trim()).join('\n\n');

  const [blocks, setBlocks] = useState<string[]>(() => toBlocks(initialContent));

  useEffect(() => {
    setBlocks(toBlocks(initialContent));
  }, [initialContent]);

  useEffect(() => {
    onChange?.(fromBlocks(blocks));
  }, [blocks, onChange]);

  const updateBlock = (index: number, value: string) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? value : b)));
  };

  const addBlock = (index?: number) => {
    setBlocks((prev) => {
      const copy = [...prev];
      const at = index !== undefined ? index + 1 : prev.length;
      copy.splice(at, 0, '');
      return copy;
    });
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, dir: 'up' | 'down') => {
    setBlocks((prev) => {
      const copy = [...prev];
      const to = dir === 'up' ? index - 1 : index + 1;
      if (to < 0 || to >= copy.length) return prev;
      const tmp = copy[to];
      copy[to] = copy[index];
      copy[index] = tmp;
      return copy;
    });
  };

  return (
    <div className="space-y-4">
      {blocks.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
          빈 블록입니다. 아래 버튼으로 새 블록을 추가하세요.
        </div>
      )}

      {blocks.map((b, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-start justify-between">
            <div className="text-xs text-gray-500">Block {i + 1}</div>
            <BlockToolbar
              onAdd={() => addBlock(i)}
              onRemove={() => removeBlock(i)}
              onMoveUp={() => moveBlock(i, 'up')}
              onMoveDown={() => moveBlock(i, 'down')}
            />
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            className="min-h-[80px] text-sm leading-relaxed outline-none"
            onInput={(e) => updateBlock(i, (e.target as HTMLElement).innerText)}
            dangerouslySetInnerHTML={{ __html: (b || '').replace(/\n/g, '<br/>') }}
          />
        </div>
      ))}

      <div>
        <button
          type="button"
          onClick={() => addBlock()}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm"
        >
          + Add block
        </button>
      </div>
    </div>
  );
}
