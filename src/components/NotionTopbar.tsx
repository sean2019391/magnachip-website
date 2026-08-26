'use client';

import React from 'react';

type Props = { title?: string };

export default function NotionTopbar({ title }: Props) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="text-sm font-semibold">{title ?? 'Admin'}</div>
        <div className="hidden sm:block text-xs text-gray-500">Control center</div>
        <div className="ml-4 hidden md:block">
          <input
            placeholder="Search site content..."
            className="rounded-lg border border-gray-200 px-3 py-1 text-sm w-64 bg-gray-50"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="text-sm rounded px-3 py-1 bg-gray-50 border border-gray-200">Share</button>
        <button className="text-sm rounded px-3 py-1 bg-black text-white">Publish</button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">ML</div>
        </div>
      </div>
    </header>
  );
}
