'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductsSidebar from '@/components/ProductsSidebar'
import FadeIn from '@/components/FadeIn'
import { DatasheetViewer } from '@/components/datasheet/DatasheetViewer'
import type { DatasheetRecord } from '@/types/datasheet'

function OverviewContent() {
  const searchParams = useSearchParams()
  const partNumber = searchParams.get('partNumber')

  const [datasheet, setDatasheet] = useState<DatasheetRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    fetch('/api/datasheets?published=true')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load datasheets (${res.status})`)
        }
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        const list: DatasheetRecord[] = data.datasheets ?? []
        const requested = partNumber ? partNumber.trim().toLowerCase() : null
        const target =
          (requested &&
            list.find(
              (d) => d.meta.partNumber.trim().toLowerCase() === requested,
            )) ||
          list.find((d) => d.meta.partNumber.startsWith('AMDTA')) ||
          list[0] ||
          null
        setDatasheet(target)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [partNumber, reloadKey])

  return (
    <>
      <FadeIn>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 flex-wrap">
          <Link href="/products" className="hover:text-black transition-colors print:hidden">
            Products
          </Link>
          <span className="print:hidden">/</span>
          <span className="text-gray-900 font-medium print:hidden">Overview</span>
        </div>
      </FadeIn>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="print:hidden">
          <ProductsSidebar />
        </div>

        <div className="flex-1 min-w-0">
          <FadeIn>
            <div className="max-w-2xl mb-8 print:hidden">
              <p className="text-sm font-medium tracking-[0.2em] uppercase text-black mb-3">
                Digital Datasheet
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance mb-2">
                {datasheet ? datasheet.meta.partNumber : 'Overview'}
              </h1>
              <p className="text-gray-500 text-sm">
                Interactive product datasheet — hover the charts to inspect values,
                and use your browser&apos;s print dialog to save a PDF.
              </p>
            </div>
          </FadeIn>

          {loading ? (
            <div className="rounded-xl bg-white border border-gray-200 p-12 text-center">
              <p className="text-gray-400 text-sm">Loading datasheet...</p>
            </div>
          ) : error ? (
            <FadeIn delay={0.1}>
              <div className="rounded-xl bg-white border border-gray-200 p-12 text-center">
                <p className="text-sm text-gray-700 mb-4">
                  Failed to load the digital datasheet. Please try again.
                </p>
                <button
                  type="button"
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Retry
                </button>
              </div>
            </FadeIn>
          ) : datasheet ? (
            <FadeIn delay={0.1}>
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden p-8">
                <div className="max-w-2xl mx-auto text-center">
                  <p className="text-lg font-semibold mb-2">Interactive Digital Datasheet moved</p>
                  <p className="text-sm text-gray-500 mb-4">The full, integrated Digital Datasheet experience has been moved to Design resources → Tool. Click below to open the unified viewer.</p>
                  <div className="flex justify-center gap-3">
                    <Link href={`/design-resources/tool/digital-datasheet?partNumber=${encodeURIComponent(datasheet.meta.partNumber)}`} className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800">
                      Open Digital Datasheet (Design resources → Tool)
                    </Link>
                    <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="px-4 py-2 rounded-lg border text-sm">Refresh</button>
                  </div>
                </div>
              </div>
            </FadeIn>
          ) : (
            <FadeIn delay={0.1}>
              <div className="rounded-xl bg-white border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">
                  No published digital datasheet available yet.
                </p>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </>
  )
}

export default function ProductOverviewPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-28 px-6 bg-[#f9fafb] min-h-screen print:bg-white print:pt-0 print:pb-0 print:min-h-0">
        <div className="max-w-[1200px] mx-auto">
          <Suspense fallback={null}>
            <OverviewContent />
          </Suspense>
        </div>
      </section>
      <Footer />
    </main>
  )
}
