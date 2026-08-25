'use client';

import React from 'react';

type Props = { title?: string };

export default function NotionTopbar({ title }: Props) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center gap-4">
        <div className="text-sm font-semibold">{title ?? 'Admin'}</div>
        <div className="text-xs text-gray-500">Control center</div>
      </div>
      <div className="flex items-center gap-2">
        <button className="text-sm rounded px-3 py-1 bg-gray-50 border border-gray-200">Share</button>
        <button className="text-sm rounded px-3 py-1 bg-black text-white">Publish</button>
      </div>
    </header>
  );
}
