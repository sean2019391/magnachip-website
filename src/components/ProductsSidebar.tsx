'use client'

import Link from 'next/link'
import { productsData, toSlug, categoryForFamily } from '@/lib/products'

interface Props {
  activeFamily?: string
  activeVariant?: string
}

export default function ProductsSidebar({ activeFamily, activeVariant }: Props) {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <nav className="space-y-6">
        {Object.keys(productsData).map((cat) => {
          const families = Object.keys(productsData[cat])
          const isCategoryActive = activeFamily && categoryForFamily(activeFamily) === cat

          return (
            <div key={cat}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 px-3">
                {cat}
              </h3>
              <div className="space-y-0.5">
                {families.map((fam) => {
                  const variants = productsData[cat][fam]
                  const isFamilyActive = activeFamily === fam
                  const isOverview = activeVariant === undefined && isFamilyActive

                  return (
                    <div key={fam}>
                      {/* Family link */}
                      <Link
                        href={fam === 'Overview' ? '/products' : `/products/${toSlug(fam)}`}
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
                            const vSlug = toSlug(v)
                            const isVariantActive = activeVariant === v
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
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
