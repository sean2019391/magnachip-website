'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toSlug } from '@/lib/products';
import {
  DEFAULT_PRODUCTS,
  type TripleNestedStringMap,
  type SiteContent,
} from '@/lib/site-content';

interface Props {
  activeFamily?: string;
  activeVariant?: string;
}

export default function ProductsSidebar({ activeFamily, activeVariant }: Props) {
  const [products, setProducts] = useState<TripleNestedStringMap>(DEFAULT_PRODUCTS);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/site-content', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { content?: SiteContent } | null) => {
        if (cancelled || !data?.content?.products) return;
        setProducts(data.content.products);
      })
      .catch(() => {
        // Network error → keep defaults.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Build a reverse lookup: family name → category. The static module also
  // exposes this via `categoryForFamily`, but we recompute here so the sidebar
  // stays in sync with whatever the admin has saved.
  const familyToCategory: Record<string, string> = {};
  for (const cat of Object.keys(products)) {
    for (const fam of Object.keys(products[cat])) {
      familyToCategory[fam] = cat;
    }
  }

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <nav className="space-y-6">
        {Object.keys(products).map((cat) => {
          const families = Object.keys(products[cat]);
          const isCategoryActive = activeFamily && familyToCategory[activeFamily] === cat;

          return (
            <div key={cat}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 px-3">
                {cat}
              </h3>
              <div className="space-y-0.5">
                {families.map((fam) => {
                  const variants = products[cat][fam];
                  const isFamilyActive = activeFamily === fam;
                  const isOverview = activeVariant === undefined && isFamilyActive;

                  return (
                    <div key={fam}>
                      {/* Family link */}
                      <Link
                        href={
                          fam === 'Overview' ? '/products/overview' : `/products/${toSlug(fam)}`
                        }
                        className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                          isFamilyActive
                            ? 'bg-black/10 text-black font-medium'
                            : 'text-gray-600 hover:text-black hover:bg-gray-100'
                        }`}
                      >
                        {fam === 'Overview' ? 'Overview' : fam}
                      </Link>

                      {/* Variant sub-links */}
                      {isFamilyActive && variants.length > 0 && (
                        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-gray-200 pl-2">
                          {variants.map((v) => {
                            const vSlug = toSlug(v);
                            const isVariantActive = activeVariant === v;
                            return (
                              <Link
                                key={v}
                                href={`/products/${toSlug(fam)}/${vSlug}`}
                                className={`block px-3 py-1.5 rounded-md text-xs transition-all ${
                                  isVariantActive
                                    ? 'bg-black text-white font-medium'
                                    : 'text-gray-500 hover:text-black hover:bg-gray-100'
                                }`}
                              >
                                {v}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
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
