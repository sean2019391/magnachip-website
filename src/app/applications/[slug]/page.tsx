'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { applicationsData, slugToCategory, toSlug } from '@/lib/products'
import ApplicationsSidebar from '@/components/ApplicationsSidebar'
import FadeIn from '@/components/FadeIn'

export default function ApplicationCategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const category = slugToCategory[slug]

  if (!category) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-28 px-6 bg-[#f9fafb] min-h-screen">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col lg:flex-row gap-10">
              <ApplicationsSidebar />
              <div className="flex-1 min-w-0 text-center pt-10">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h1>
                <Link href="/applications" className="text-sm text-gray-600 hover:text-black underline">
                  Back to applications
                </Link>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  const subs = Object.keys(applicationsData[category]).filter((s) => s !== 'Overview')

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-28 px-6 bg-[#f9fafb] min-h-screen">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 flex-wrap">
              <Link href="/applications" className="hover:text-black transition-colors">Applications</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{category}</span>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar */}
            <ApplicationsSidebar activeCategory={category} />

            {/* Main content — Overview */}
            <div className="flex-1 min-w-0">
              <FadeIn>
                <div className="max-w-2xl mb-10">
                  <p className="text-sm font-medium tracking-[0.2em] uppercase text-black mb-3">Application</p>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance mb-4">
                    {category}
                  </h1>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    MagnaChip&apos;s power semiconductor solutions for {category} applications.
                    Browse the subcategories below or use the sidebar to explore recommended
                    products and detailed information.
                  </p>
                </div>
              </FadeIn>

              {subs.length > 0 && (
                <FadeIn delay={0.1}>
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">Subcategories</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {subs.map((sub, i) => (
                      <FadeIn key={sub} delay={Math.min(i * 0.04, 0.2)}>
                        <Link
                          href={`/applications/${slug}/${toSlug(sub)}`}
                          className="block p-5 rounded-xl bg-white border border-gray-200 hover:border-black/30 hover:shadow-sm transition-all"
                        >
                          <p className="text-sm font-semibold text-gray-900">{sub}</p>
                          {applicationsData[category][sub].length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              {applicationsData[category][sub].length} solution detail{applicationsData[category][sub].length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </Link>
                      </FadeIn>
                    ))}
                  </div>
                </FadeIn>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
