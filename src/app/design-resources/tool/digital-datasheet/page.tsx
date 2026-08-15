'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FadeIn from '@/components/FadeIn';
import { DatasheetViewer } from '@/components/datasheet/DatasheetViewer';
import selectionData from '@/data/selection-guide.json';
import type { DatasheetRecord } from '@/types/datasheet';

type SG = typeof selectionData;

function downloadCSV(rows: any[], filename = 'selection-guide.csv') {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const lines = [keys.join(',')].concat(
    rows.map((r) => keys.map((k) => `"${String(r[k] ?? '')}"`).join(',')),
  );
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DesignDigitalDatasheetPage() {
  const [query, setQuery] = useState('');
  const [selectedPn, setSelectedPn] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showOnlyWithPdf, setShowOnlyWithPdf] = useState(false);

  const meta = (selectionData as SG).meta;
  const products = (selectionData as SG).products as any[];

  useEffect(() => {
    // read partNumber param
    try {
      const qp = new URLSearchParams(window.location.search);
      const p = qp.get('partNumber');
      if (p) setSelectedPn(p);
    } catch {}
  }, []);

  const rows = useMemo(() => {
    let list = products.slice();
    if (query) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) =>
        (p.pn + ' ' + (p.fam || '') + ' ' + (p.pkg || '')).toLowerCase().includes(q),
      );
    }
    if (showOnlyWithPdf) list = list.filter((p) => p.ds && p.ds.length);
    if (sortKey) {
      list.sort((a, b) => {
        const av = a.vals?.[sortKey]?.n ?? null;
        const bv = b.vals?.[sortKey]?.n ?? null;
        if (av === null && bv === null) return 0;
        if (av === null) return 1;
        if (bv === null) return -1;
        return sortDir === 'asc' ? av - bv : bv - av;
      });
    }
    return list;
  }, [products, query, showOnlyWithPdf, sortKey, sortDir]);

  const selectedProduct = useMemo(() => {
    if (!selectedPn) return null;
    return products.find((p) => p.pn.toLowerCase() === selectedPn.toLowerCase()) || null;
  }, [selectedPn, products]);

  // If a published datasheet exists in site's API, prefer that. Otherwise create a minimal DatasheetRecord
  const toDatasheetRecord = async (pn: string): Promise<DatasheetRecord> => {
    // try fetch from /api/datasheets
    try {
      const res = await fetch('/api/datasheets?partNumber=' + encodeURIComponent(pn));
      if (res.ok) {
        const j = await res.json();
        const found = (j.datasheets ?? []).find(
          (d: any) => d.meta.partNumber.toLowerCase() === pn.toLowerCase(),
        );
        if (found) return found as DatasheetRecord;
      }
    } catch {}
    // fallback using selection data
    const p = products.find((x) => x.pn.toLowerCase() === pn.toLowerCase());
    const id = p ? p.pn.toLowerCase() : pn.toLowerCase();
    const metaRec: any = {
      title: p?.pn ?? pn,
      partNumber: p?.pn ?? pn,
      version: '1.0',
      date: new Date().toISOString().slice(0, 10),
      company: 'Magnachip Semiconductor',
      classification: 'Selection Guide',
    };
    return {
      id,
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: 1,
      meta: metaRec,
      cover: {},
      sections: [],
      datas: {},
    } as unknown as DatasheetRecord;
  };

  const sanitizeCell = (v: unknown) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'number' || typeof v === 'boolean') return v;
    const s = String(v);
    if (s.length > 1000) return s.slice(0, 1000); // limit cell size
    return s;
  };

  const sanitizeRecord = (r: any) => ({
    pn: sanitizeCell(r.pn),
    family: sanitizeCell(r.fam),
    pkg: sanitizeCell(r.pkg),
    vds: sanitizeCell(r.vals?.vds?.d ?? ''),
    id: sanitizeCell(r.vals?.id?.d ?? ''),
    rds_on: sanitizeCell(r.vals?.rmax10?.d ?? ''),
    ds: sanitizeCell(r.ds ?? ''),
  });

  const handleExportXlsx = async () => {
    try {
      const { utils, writeFile } = await import('xlsx');
      const MAX_ROWS = 5000;
      const flat = rows.slice(0, MAX_ROWS).map((r) => sanitizeRecord(r));
      const ws = utils.json_to_sheet(flat);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'SelectionGuide');
      writeFile(wb, 'selection-guide.xlsx');
      if (rows.length > MAX_ROWS) alert(`Export truncated to ${MAX_ROWS} rows for safety.`);
    } catch (e) {
      console.error('Export failed', e);
      alert('Failed to export Excel file.');
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-28 px-6 bg-[#f9fafb] min-h-screen print:bg-white print:pt-0 print:pb-0 print:min-h-0">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn>
            <div className="mb-6">
              <h1 className="text-2xl font-semibold">Design resources / Tools</h1>
              <p className="text-sm text-gray-500">
                Digital Datasheet — Selection Guide integrated into site
              </p>
            </div>
          </FadeIn>

          <div className="flex gap-6">
            <aside className="w-72">
              <div className="rounded-xl border bg-white p-4 mb-4">
                <input
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Search part, family, package..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    className="btn"
                    onClick={() => {
                      setQuery('');
                      setShowOnlyWithPdf(false);
                      setSortKey(null);
                    }}
                  >
                    Reset
                  </button>
                  <button
                    className="btn"
                    onClick={() =>
                      downloadCSV(
                        rows.map((r) => ({
                          pn: r.pn,
                          family: r.fam,
                          pkg: r.pkg,
                          vds: r.vals?.vds?.d,
                          id: r.vals?.id?.d,
                          ds: r.ds,
                        })),
                      )
                    }
                  >
                    CSV
                  </button>
                  <button className="btn primary" onClick={handleExportXlsx}>
                    Excel (.xlsx)
                  </button>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showOnlyWithPdf}
                      onChange={(e) => setShowOnlyWithPdf(e.target.checked)}
                    />{' '}
                    Show only with PDF
                  </label>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-4 max-h-[60vh] overflow-auto">
                <h3 className="font-medium mb-2">Products ({rows.length})</h3>
                <ul className="space-y-1">
                  {rows.map((p, i) => (
                    <li key={`${p.pn}-${i}`}>
                      <button
                        className={`w-full text-left px-3 py-2 rounded ${selectedPn === p.pn ? 'bg-black text-white' : ''}`}
                        onClick={() => setSelectedPn(p.pn)}
                      >
                        <div className="flex justify-between">
                          <div className="font-medium">{p.pn}</div>
                          <div className="text-xs text-gray-500">{p.pkg}</div>
                        </div>
                        <div className="text-xs text-gray-500">{p.fam}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <div className="flex-1">
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden p-4">
                {selectedPn ? (
                  <SelectedViewer pn={selectedPn} toDatasheetRecord={toDatasheetRecord} />
                ) : (
                  <div className="p-12 text-center text-gray-400">
                    Select a product to view its digital datasheet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function SelectedViewer({
  pn,
  toDatasheetRecord,
}: {
  pn: string;
  toDatasheetRecord: (pn: string) => Promise<DatasheetRecord>;
}) {
  const [rec, setRec] = useState<DatasheetRecord | null>(null);
  useEffect(() => {
    let mounted = true;
    toDatasheetRecord(pn)
      .then((r) => {
        if (mounted) setRec(r);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [pn]);
  if (!rec) return <div className="p-12 text-center text-gray-400">Loading datasheet…</div>;
  return <DatasheetViewer d={rec} />;
}
