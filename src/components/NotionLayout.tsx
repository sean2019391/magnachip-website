'use client';

import React from 'react';
import NotionSidebar from './NotionSidebar';
import NotionTopbar from './NotionTopbar';

type Props = {
  title?: string;
  children: React.ReactNode;
};

export default function NotionLayout({ title, children }: Props) {
  return (
    <div className="min-h-screen bg-[#f7f7f8] text-gray-900">
      <div className="flex">
        <NotionSidebar />
        <div className="flex-1">
          <NotionTopbar title={title} />
          <main className="p-6 max-w-[1200px] mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
