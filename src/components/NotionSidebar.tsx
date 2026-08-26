'use client';

import React from 'react';
import Link from 'next/link';

export default function NotionSidebar() {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white min-h-screen p-4 hidden md:block">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">MagnaChip</div>
          <div className="text-xs text-gray-500">Admin</div>
        </div>
        <button className="text-xs px-2 py-1 rounded border border-gray-200 bg-gray-50">New</button>
      </div>

      <nav className="space-y-2 text-sm">
        <Link href="/admin" className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-100">
          <span className="text-gray-500">🏠</span>
          <span>Dashboard</span>
        </Link>
        <Link href="/admin/datasheets" className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-100">
          <span className="text-gray-500">📄</span>
          <span>Datasheets</span>
        </Link>
        <Link href="/admin/site-content" className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-100">
          <span className="text-gray-500">🧭</span>
          <span>Site Content</span>
        </Link>
        <Link href="/admin/edit/new" className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-100">
          <span className="text-gray-500">✍️</span>
          <span>New Article</span>
        </Link>
      </nav>

      <div className="mt-6 text-xs text-gray-400">Design inspired by Notion-clone UI and Lotion</div>
    </aside>
  );
}
