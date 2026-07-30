'use client'

import Link from 'next/link'
import { designResourcesData, toSlug } from '@/lib/products'

interface Props {
  activeCategory?: string
}

export default function DesignResourcesSidebar({ activeCategory }: Props) {
  const categories = Object.keys(designResourcesData).filter((c) => c !== 'Overview')

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
  )
}
