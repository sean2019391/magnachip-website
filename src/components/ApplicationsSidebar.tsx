'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toSlug } from '@/lib/products';
import {
  DEFAULT_APPLICATIONS,
  type TripleNestedStringMap,
  type SiteContent,
} from '@/lib/site-content';

interface Props {
  activeCategory?: string;
  activeSubcategory?: string;
}

export default function ApplicationsSidebar({ activeCategory, activeSubcategory }: Props) {
  const [applications, setApplications] = useState<TripleNestedStringMap>(DEFAULT_APPLICATIONS);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/site-content', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { content?: SiteContent } | null) => {
        if (cancelled || !data?.content?.applications) return;
        setApplications(data.content.applications);
      })
      .catch(() => {
        // Network error → keep defaults.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <nav className="space-y-6">
        {Object.keys(applications).map((cat) => {
          const subs = Object.keys(applications[cat]);
          const isCatActive = activeCategory === cat;

          return (
            <div key={cat}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 px-3">
                {cat}
              </h3>
              <div className="space-y-0.5">
                {subs.map((sub) => {
                  const subSlug = toSlug(sub);
                  const isActive = activeSubcategory === sub && isCatActive;
                  const isOverview = sub === 'Overview' && isCatActive && !activeSubcategory;
                  return (
                    <Link
                      key={sub}
                      href={
                        sub === 'Overview'
                          ? `/applications/${toSlug(cat)}`
                          : `/applications/${toSlug(cat)}/${subSlug}`
                      }
                      className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive || isOverview
                          ? 'bg-black text-white font-medium'
                          : 'text-gray-600 hover:text-black hover:bg-gray-100'
                      }`}
                    >
                      {sub}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
