'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { DatasheetRecord } from '@/types/datasheet';
import { emptyDatasheetBody } from '@/types/datasheet';

export default function AdminDatasheetsPage() {
  const router = useRouter();
  const [datasheets, setDatasheets] = useState<DatasheetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDatasheets = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch('/api/datasheets?admin=true')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          const detail =
            typeof data?.error === 'string' && data.error ? data.error : `HTTP ${res.status}`;
          throw new Error(`Failed to load datasheets. ${detail}`);
        }
        setDatasheets(data.datasheets ?? []);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error && err.message ? err.message : 'Failed to load datasheets.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDatasheets();
  }, [fetchDatasheets]);

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/datasheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...emptyDatasheetBody(), published: true }),
      });
      const data = await res.json();
      if (res.ok && data.datasheet?.id) {
        router.push(`/admin/datasheets/${data.datasheet.id}`);
      } else {
        alert('Failed to create datasheet');
      }
    } catch {
      alert('Failed to create datasheet');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this datasheet?')) return;
    try {
      const res = await fetch(`/api/datasheets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDatasheets((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert('Failed to delete datasheet');
      }
    } catch {
      alert('Failed to delete datasheet');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1100px] px-6 py-12">
        {/* Section nav */}
        <nav className="mb-8 flex flex-wrap items-center gap-1">
          <Link
            href="/admin"
            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200/60 hover:text-gray-900"
          >
            Articles
          </Link>
          <Link
            href="/admin/datasheets"
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            Digital Datasheets
          </Link>
          <Link
            href="/admin/site-content"
            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200/60 hover:text-gray-900"
          >
            Site Content
          </Link>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Digital Datasheets</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your digital datasheets</p>
          </div>
          <button
            onClick={handleCreate}
            className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            + New Datasheet
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="p-12 text-center text-sm text-gray-400">Loading...</div>
          </div>
        ) : error ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="p-12 text-center">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </div>
        ) : datasheets.length === 0 ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="p-12 text-center">
              <p className="mb-4 text-gray-500">No datasheets yet.</p>
              <button
                onClick={handleCreate}
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                Create your first datasheet
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                    Part Number
                  </th>
                  <th className="hidden px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase md:table-cell">
                    Title
                  </th>
                  <th className="hidden px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase lg:table-cell">
                    Updated
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                    Sections
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                    Curves
                  </th>
                  <th className="hidden px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-400 uppercase sm:table-cell">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium tracking-wider text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {datasheets.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-gray-50 transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{d.meta.partNumber}</p>
                    </td>
                    <td className="hidden px-6 py-4 text-sm text-gray-500 md:table-cell">
                      {d.meta.title}
                    </td>
                    <td className="hidden px-6 py-4 text-sm text-gray-500 lg:table-cell">
                      {new Date(d.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{d.sections.length}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{d.curves.length}</td>
                    <td className="hidden px-6 py-4 sm:table-cell">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          d.published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {d.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => router.push(`/admin/datasheets/${d.id}`)}
                        className="mr-4 text-sm text-gray-600 transition-colors hover:text-black"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="text-sm text-red-500 transition-colors hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
