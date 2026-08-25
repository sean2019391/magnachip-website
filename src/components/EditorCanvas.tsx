'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const dragIndex = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setBlocks(toBlocks(initialContent));
  }, [initialContent]);

  useEffect(() => {
    onChange?.(fromBlocks(blocks));
  }, [blocks, onChange]);

  const updateBlock = (index: number, value: string) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? value : b)));
  };

  const addBlock = (index?: number, content: string = '') => {
    setBlocks((prev) => {
      const copy = [...prev];
      const at = index !== undefined ? index + 1 : prev.length;
      copy.splice(at, 0, content);
      return copy;
    });
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const moveBlock = (from: number, to: number) => {
    setBlocks((prev) => {
      const copy = [...prev];
      if (from < 0 || from >= copy.length || to < 0 || to > copy.length) return prev;
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  // HTML5 drag & drop handlers
  const onDragStart = (e: React.DragEvent, index: number) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const onDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === undefined) return;
    if (from === index) return;
    moveBlock(from, index);
    dragIndex.current = null;
  };

  // simple image upload: POST base64 to /api/uploads, write to public/uploads and return URL
  const triggerFile = () => fileInputRef.current?.click();
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Try server upload first (admin-protected endpoint). If upload fails or not configured,
    // fall back to embedding data URL so admin can still use images.
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/uploads', { method: 'POST', body: form });
      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          addBlock(undefined, `![${file.name}](${data.url})`);
          return;
        }
      }
    } catch (err) {
      // ignore and fall back to data URL
    }

    // fallback: embed as data URL
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      addBlock(undefined, `![${file.name}](${dataUrl})`);
    };
    reader.readAsDataURL(file);
  };

  const renderBlockContent = (b: string) => {
    // detect image markdown pattern: ![alt](url)
    const m = b.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (m) {
      const alt = m[1];
      const url = m[2];
      return <img src={url} alt={alt} className="max-w-full rounded" />;
    }
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        className="min-h-[80px] text-sm leading-relaxed outline-none"
        onInput={(e) => updateBlock(iRef.current!, (e.target as HTMLElement).innerText)}
        dangerouslySetInnerHTML={{ __html: (b || '').replace(/\n/g, '<br/>') }}
      />
    );
  };

  // need a stable ref for onInput handlers per block
  const iRef = useRef<number | null>(null);

  return (
    <div className="space-y-4">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => addBlock()}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm"
        >
          + Add block
        </button>
        <button
          type="button"
          onClick={triggerFile}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm"
        >
          ↑ Upload image
        </button>
      </div>

      {blocks.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
          빈 블록입니다. 아래 버튼으로 새 블록을 추가하세요.
        </div>
      )}

      {blocks.map((b, i) => (
        <div
          key={i}
          draggable
          onDragStart={(e) => onDragStart(e, i)}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, i)}
          className="rounded-xl border border-gray-200 bg-white p-4"
        >
          <div className="mb-2 flex items-start justify-between">
            <div className="text-xs text-gray-500">Block {i + 1}</div>
            <BlockToolbar
              onAdd={() => addBlock(i)}
              onRemove={() => removeBlock(i)}
              onMoveUp={() => moveBlock(i, i - 1)}
              onMoveDown={() => moveBlock(i, i + 1)}
            />
          </div>
          {(() => {
            // render content, but need to capture index for handlers
            iRef.current = i;
            const m = b.match(/^!\[(.*?)\]\((.*?)\)$/);
            if (m) {
              const alt = m[1];
              const url = m[2];
              return <img src={url} alt={alt} className="max-w-full rounded" />;
            }
            return (
              <div
                contentEditable
                suppressContentEditableWarning
                className="min-h-[80px] text-sm leading-relaxed outline-none"
                onInput={(e) => updateBlock(i, (e.target as HTMLElement).innerText)}
                dangerouslySetInnerHTML={{ __html: (b || '').replace(/\n/g, '<br/>') }}
              />
            );
          })()}
        </div>
      ))}
    </div>
  );
}
