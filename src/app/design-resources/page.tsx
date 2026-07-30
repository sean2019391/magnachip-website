'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { designResourcesData, toSlug } from '@/lib/products'
import DesignResourcesSidebar from '@/components/DesignResourcesSidebar'
import FadeIn from '@/components/FadeIn'
import Link from 'next/link'

export default function DesignResourcesPage() {
  const categories = Object.keys(designResourcesData).filter((c) => c !== 'Overview')

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-28 px-6 bg-[#f9fafb] min-h-screen">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
              <span className="text-gray-900 font-medium">Design Resources</span>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-10">
            <DesignResourcesSidebar />

            <div className="flex-1 min-w-0">
              <FadeIn>
                <div className="max-w-2xl mb-10">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance mb-4">
                    Design Resources
                  </h1>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Technical documentation, application notes, and design resources for engineers.
                    Browse categories below to find the tools and support you need.
                  </p>
                </div>
              </FadeIn>

              <div className="grid sm:grid-cols-2 gap-4">
                {categories.map((cat, i) => {
                  const items = designResourcesData[cat]
                  return (
                    <FadeIn key={cat} delay={Math.min(i * 0.08, 0.2)}>
                      <Link
                        href={`/design-resources/${toSlug(cat)}`}
                        className="block p-6 rounded-xl bg-white border border-gray-200 hover:border-black/30 hover:shadow-sm transition-all"
                      >
                        <h2 className="text-lg font-bold text-gray-900 mb-2">{cat}</h2>
                        {items.length > 0 && (
                          <p className="text-xs text-gray-400">
                            {items.length} resource{items.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </Link>
                    </FadeIn>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
