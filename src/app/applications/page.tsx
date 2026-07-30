'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { applicationsData, toSlug } from '@/lib/products'
import ApplicationsSidebar from '@/components/ApplicationsSidebar'
import FadeIn from '@/components/FadeIn'

export default function ApplicationsPage() {
  const categories = Object.keys(applicationsData)

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-28 px-6 bg-[#f9fafb] min-h-screen">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
              <span className="text-gray-900 font-medium">Applications</span>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar */}
            <ApplicationsSidebar />

            {/* Main content — Overview */}
            <div className="flex-1 min-w-0">
              <FadeIn>
                <div className="max-w-2xl mb-10">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance mb-4">
                    Applications
                  </h1>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    MagnaChip&apos;s power semiconductor solutions are deployed across
                    server, solar/ESS, and automotive applications. Select a category below
                    to explore recommended products and solutions.
                  </p>
                </div>
              </FadeIn>

              {/* Category Overview Cards */}
              <div className="space-y-6">
                {categories.map((cat, i) => {
                  const subs = Object.keys(applicationsData[cat]).filter((s) => s !== 'Overview')
                  const catSlug = toSlug(cat)
                  return (
                    <FadeIn key={cat} delay={Math.min(i * 0.08, 0.2)}>
                      <Link
                        href={`/applications/${catSlug}`}
                        className="block p-6 rounded-xl bg-white border border-gray-200 hover:border-black/30 hover:shadow-sm transition-all"
                      >
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                          Overview
                        </p>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{cat}</h2>
                        <p className="text-sm text-gray-500 mb-3">
                          {subs.length} sub-categor{subs.length !== 1 ? 'ies' : 'y'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {subs.slice(0, 4).map((sub) => (
                            <span
                              key={sub}
                              className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
                            >
                              {sub}
                            </span>
                          ))}
                          {subs.length > 4 && (
                            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-400">
                              +{subs.length - 4} more
                            </span>
                          )}
                        </div>
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
