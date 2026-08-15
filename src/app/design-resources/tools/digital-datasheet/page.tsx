'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FadeIn from '@/components/FadeIn'
import { DatasheetViewer } from '@/components/datasheet/DatasheetViewer'
import type { DatasheetRecord } from '@/types/datasheet'

export default function DesignDigitalDatasheetPage() {
  const [datasheets, setDatasheets] = useState<DatasheetRecord[]>([])
  const [selected, setSelected] = useState<DatasheetRecord | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    let cancelled = false
    fetch('/api/datasheets?published=true')
      .then((r) => r.ok ? r.json() : Promise.reject(new Error('fetch failed')))
      .then((json) => {
        if (cancelled) return
        const list: DatasheetRecord[] = json.datasheets ?? []
        setDatasheets(list)
        // Try to read partNumber from URL to preselect
        try {
          const qp = new URLSearchParams(window.location.search)
          const part = qp.get('partNumber')
          if (part) {
            const found = list.find((d) => d.meta.partNumber.toLowerCase() === part.toLowerCase())
            if (found) setSelected(found)
          }
        } catch {}
        if (!selected && list.length) setSelected(list[0])
        setLoading(false)
      })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-28 px-6 bg-[#f9fafb] min-h-screen print:bg-white print:pt-0 print:pb-0 print:min-h-0">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn>
            <div className="mb-6">
              <h1 className="text-2xl font-semibold">Design resources / Tools</h1>
              <p className="text-sm text-gray-500">Digital Datasheet — integrated and unified with site UI/UX</p>
            </div>
          </FadeIn>

          <div className="flex gap-6">
            <div className="w-64">
              <div className="rounded-xl border bg-white p-4">
                <h3 className="font-medium mb-2">Available datasheets</h3>
                {loading ? (
                  <p className="text-sm text-gray-400">Loading…</p>
                ) : (
                  <ul className="space-y-2 max-h-[60vh] overflow-auto">
                    {datasheets.map((d) => (
                      <li key={d.id}>
                        <button
                          className={`w-full text-left px-3 py-2 rounded ${selected?.id === d.id ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
                          onClick={() => setSelected(d)}
                        >
                          {d.meta.partNumber}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center text-gray-400">Loading datasheet…</div>
                ) : selected ? (
                  <DatasheetViewer d={selected} />
                ) : (
                  <div className="p-12 text-center text-gray-400">No datasheet selected</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
