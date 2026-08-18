'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toSlug } from '@/lib/products';
import {
  DEFAULT_DESIGN_RESOURCES,
  type NestedStringMap,
  type SiteContent,
} from '@/lib/site-content';

interface Props {
  activeCategory?: string;
}

export default function DesignResourcesSidebar({ activeCategory }: Props) {
  const [designResources, setDesignResources] =
    useState<NestedStringMap>(DEFAULT_DESIGN_RESOURCES);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/site-content', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { content?: SiteContent } | null) => {
        if (cancelled || !data?.content?.designResources) return;
        setDesignResources(data.content.designResources);
      })
      .catch(() => {
        // Network error → keep defaults.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = Object.keys(designResources).filter((c) => c !== 'Overview');

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <nav className="space-y-1">
        <Link
          href="/design-resources"
          className={`block px-3 py-2 rounded-lg text-sm transition-all ${
            !activeCategory
              ? 'bg-black text-white font-medium'
              : 'text-gray-600 hover:text-black hover:bg-gray-100'
          }`}
        >
          Overview
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/design-resources/${toSlug(cat)}`}
            className={`block px-3 py-2 rounded-lg text-sm transition-all ${
              activeCategory === cat
                ? 'bg-black text-white font-medium'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            {cat}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
