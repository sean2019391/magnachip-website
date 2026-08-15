'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { productsData, toSlug } from '@/lib/products'
import FadeIn from '@/components/FadeIn'

export default function ProductsPage() {
  const categories = Object.keys(productsData)

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-36 pb-28 px-6 bg-[#f9fafb] min-h-screen">
        <div className="max-w-[1100px] mx-auto">
          <FadeIn>
            <div className="max-w-2xl mb-14">
              <p className="text-sm font-medium tracking-[0.2em] uppercase text-black mb-3">Products</p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance">Our Product Portfolio</h1>
            </div>
          </FadeIn>

          {categories.map((cat, ci) => (
            <div key={cat} className="mb-14">
              <FadeIn delay={ci * 0.08}>
                <h2 className="text-xl font-bold text-gray-800 mb-5">{cat}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.keys(productsData[cat]).map((fam, fi) => {
                    const items = productsData[cat][fam]
                    return (
                      <Link
                        key={fam}
                        href={fam === 'Overview' ? '/products/overview' : items.length > 0 ? `/products/${toSlug(fam)}` : '#'}
                        className="block p-5 rounded-xl bg-white border border-gray-200 hover:border-black/30 hover:shadow-sm transition-all"
                      >
                        <h3 className="text-base font-semibold text-gray-900 mb-1">{fam}</h3>
                        {items.length > 0 && (
                          <p className="text-xs text-gray-400">{items.length} variants</p>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </FadeIn>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  )
}
