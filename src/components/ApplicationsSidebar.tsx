'use client'

import Link from 'next/link'
import { applicationsData, toSlug } from '@/lib/products'

interface Props {
  activeCategory?: string
  activeSubcategory?: string
}

export default function ApplicationsSidebar({ activeCategory, activeSubcategory }: Props) {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <nav className="space-y-6">
        {Object.keys(applicationsData).map((cat) => {
          const subs = Object.keys(applicationsData[cat])
          const isCatActive = activeCategory === cat

          return (
            <div key={cat}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 px-3">
                {cat}
              </h3>
              <div className="space-y-0.5">
                {subs.map((sub) => {
                  const subSlug = toSlug(sub)
                  const isActive = activeSubcategory === sub && isCatActive
                  const isOverview = sub === 'Overview' && isCatActive && !activeSubcategory
                  return (
                    <Link
                      key={sub}
                      href={sub === 'Overview' ? `/applications/${toSlug(cat)}` : `/applications/${toSlug(cat)}/${subSlug}`}
                      className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive || isOverview
                          ? 'bg-black text-white font-medium'
                          : 'text-gray-600 hover:text-black hover:bg-gray-100'
                      }`}
                    >
                      {sub}
                    </Link>
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
