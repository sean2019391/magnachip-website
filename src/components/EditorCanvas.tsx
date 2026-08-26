'use client';

import React, { useState, useEffect, useRef } from 'react';
import BlockToolbar from './BlockToolbar';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MediaLibrary from './MediaLibrary';

type Props = {
  initialContent?: string;
  onChange?: (content: string) => void;
};

export default function EditorCanvas({ initialContent = '', onChange }: Props) {
  // simple block model: split paragraphs by two newlines
  const toBlocks = (s: string) => (s ? s.split(/\n\n+/).map((t) => t.trim()) : []);
  const fromBlocks = (blocks: string[]) => blocks.map((b) => b.trim()).join('\n\n');

  const [blocks, setBlocks] = useState<string[]>(() => toBlocks(initialContent));
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  useEffect(() => {    setBlocks(toBlocks(initialContent));  }, [initialContent]);
  useEffect(() => {    onChange?.(fromBlocks(blocks));  }, [blocks, onChange]);
  const updateBlock = (index: number, value: string) => {    setBlocks((prev) => prev.map((b, i) => (i === index ? value : b)));  };
  const addBlock = (index?: number, content: string = '') => {    setBlocks((prev) => {      const copy = [...prev];      const at = index !== undefined ? index + 1 : prev.length;      copy.splice(at, 0, content);      return copy;    });  };
  const removeBlock = (index: number) => {    setBlocks((prev) => prev.filter((_, i) => i !== index));  };
  const moveBlock = (from: number, to: number) => {    setBlocks((prev) => arrayMove(prev, from, to));  };

  // sortable helper (dnd-kit)
  function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });    const style = {      transform: CSS.Transform.toString(transform),      transition,    } as React.CSSProperties;    return (      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>        {children}      </div>    );  }
  // simple image upload: POST base64 to /api/uploads, write to public/uploads and return URL
  const triggerFile = () => fileInputRef.current?.click();
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1) Try presign + direct S3 upload
    try {
      const presignRes = await fetch('/api/admin/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (presignRes.ok) {
        const presignData = await presignRes.json();
        if (presignData?.url && presignData?.publicUrl) {
          // PUT file to presigned URL
          const putRes = await fetch(presignData.url, {
            method: 'PUT',
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
            body: file,
          });
          if (putRes.ok) {
            addBlock(undefined, `![${file.name}](${presignData.publicUrl})`);
            return;
          }
        }
      }
    } catch (err) {
      // ignore and continue to next fallback
    }

    // 2) Try server-side upload endpoint (/api/admin/uploads)
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
      // ignore
    }

    // 3) fallback: embed as data URL
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      addBlock(undefined, `![${file.name}](${dataUrl})`);
    };
    reader.readAsDataURL(file);
  };

  const applyFormat = (index: number, format: 'bold' | 'italic') => {
    const wrapper = format === 'bold' ? '**' : '*';
    const sel = typeof window !== 'undefined' ? window.getSelection()?.toString() : null;
    const cur = blocks[index] ?? '';
    if (sel && sel.length > 0) {
      // naive: replace first occurrence of selected text in block with wrapped version
      const escaped = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped);
      const replaced = cur.replace(re, `${wrapper}${sel}${wrapper}`);
      updateBlock(index, replaced);
    } else {
      // toggle wrapper around whole block
      if (cur.startsWith(wrapper) && cur.endsWith(wrapper)) {
        updateBlock(index, cur.slice(wrapper.length, cur.length - wrapper.length));
      } else {
        updateBlock(index, `${wrapper}${cur}${wrapper}`);
      }
    }
  };

  const setBlockType = (index: number, type: 'h1' | 'ul' | 'code') => {
    const cur = blocks[index] ?? '';
    if (type === 'h1') {
      if (cur.startsWith('h1:')) {
        updateBlock(index, cur.replace(/^h1:\s*/, ''));
      } else {
        updateBlock(index, `h1: ${cur}`);
      }
    } else if (type === 'ul') {
      if (cur.startsWith('ul:')) {
        updateBlock(index, cur.replace(/^ul:\s*/, ''));
      } else {
        const lines = cur.split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const listText = lines.length ? lines.map((l) => `- ${l}`).join('\n') : '- ';
        updateBlock(index, `ul: ${listText}`);
      }
    } else if (type === 'code') {
      if (cur.startsWith('code:')) {
        updateBlock(index, cur.replace(/^code:\s*/, ''));
      } else {
        updateBlock(index, `code: ${cur}`);
      }
    }
  };

  const renderBlockContent = (b: string, idx: number) => {
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
        onKeyDown={(e) => {
          const isMod = e.ctrlKey || e.metaKey;
          if (isMod && (e.key === 'b' || e.key === 'B')) {
            e.preventDefault();
            applyFormat(idx, 'bold');
          }
          if (isMod && (e.key === 'i' || e.key === 'I')) {
            e.preventDefault();
            applyFormat(idx, 'italic');
          }
        }}
        onInput={(e) => updateBlock(idx, (e.target as HTMLElement).innerText)}
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

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (active.id && over?.id && active.id !== over.id) {
            const from = Number(String(active.id).split(':')[1]);
            const to = Number(String(over.id).split(':')[1]);
            moveBlock(from, to);
          }
        }}
      >
        <SortableContext items={blocks.map((_, i) => `block:${i}`)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {blocks.map((b, i) => (
              <SortableItem key={`block:${i}`} id={`block:${i}`}>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="text-xs text-gray-500">Block {i + 1}</div>
                    <BlockToolbar
                      onAdd={() => addBlock(i)}
                      onRemove={() => removeBlock(i)}
                      onMoveUp={() => moveBlock(i, i - 1)}
                      onMoveDown={() => moveBlock(i, i + 1)}
                      onFormat={(fmt) => applyFormat(i, fmt)}
                      onSetType={(t) => setBlockType(i, t)}
                    />
                  </div>
                  {renderBlockContent(b, i)}
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
