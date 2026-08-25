'use client';

import React from 'react';
import Link from 'next/link';

export default function NotionSidebar() {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white min-h-screen p-4 hidden md:block">
      <div className="mb-4">
        <div className="text-sm font-semibold">MagnaChip</div>
        <div className="text-xs text-gray-500">Admin</div>
      </div>

      <nav className="space-y-2 text-sm">
        <Link href="/admin" className="block rounded px-2 py-1 hover:bg-gray-100">Dashboard</Link>
        <Link href="/admin/datasheets" className="block rounded px-2 py-1 hover:bg-gray-100">Datasheets</Link>
        <Link href="/admin/site-content" className="block rounded px-2 py-1 hover:bg-gray-100">Site Content</Link>
        <Link href="/admin/edit/new" className="block rounded px-2 py-1 hover:bg-gray-100">New Article</Link>
      </nav>

      <div className="mt-6 text-xs text-gray-400">Design inspired by Notion-clone UI</div>
    </aside>
  );
}
