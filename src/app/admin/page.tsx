'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Article } from '@/types/article';
import type { DatasheetRecord } from '@/types/datasheet';
import { hasRawDatasheetData } from '@/types/datasheet';
import NotionLayout from '@/components/NotionLayout';

export default function AdminPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [datasheets, setDatasheets] = useState<DatasheetRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [articlesRes, datasheetsRes] = await Promise.all([
        fetch('/api/admin/articles'),
        fetch('/api/admin/datasheets'),
      ]);

      const articleData = await articlesRes.json();
      const datasheetData = await datasheetsRes.json();

      setArticles(articleData.articles ?? []);
      setDatasheets(datasheetData.datasheets ?? []);
    } catch {
      setArticles([]);
      setDatasheets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const publishedArticles = articles.filter((a) => a.published).length;
  const visibleDatasheets = datasheets.filter(
    (d) => d.published !== false && hasRawDatasheetData(d),
  ).length;
  const hiddenDatasheets = datasheets.filter(
    (d) => !(d.published !== false && hasRawDatasheetData(d)),
  ).length;

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert('Failed to delete article');
      }
    } catch {
      alert('Failed to delete article');
    }
  };

  return (
    <NotionLayout title="Admin Control Center">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <nav className="mb-8 flex flex-wrap items-center gap-1">
          <Link
            href="/admin"
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/datasheets"
            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200/60 hover:text-gray-900"
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

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
            <p className="mt-1 text-sm text-gray-500">
              Full website, article, datasheet, and raw-data control from one place.
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/edit/new')}
            className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            + New Article
          </button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Articles</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{articles.length}</div>
            <div className="mt-1 text-sm text-gray-500">{publishedArticles} published</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Datasheets</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{datasheets.length}</div>
            <div className="mt-1 text-sm text-gray-500">{visibleDatasheets} visible publicly</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Hidden</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{hiddenDatasheets}</div>
            <div className="mt-1 text-sm text-gray-500">No raw data or draft</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Site Data</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">4</div>
            <div className="mt-1 text-sm text-gray-500">Products / Apps / Resources / About</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Quick controls</h2>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/admin/edit/new')}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
              >
                <span>
                  <span className="block font-medium text-gray-900">Create article</span>
                  <span className="text-sm text-gray-500">Newsroom and press content</span>
                </span>
                <span className="text-lg text-gray-500">→</span>
              </button>
              <button
                onClick={() => router.push('/admin/datasheets')}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
              >
                <span>
                  <span className="block font-medium text-gray-900">Manage datasheets</span>
                  <span className="text-sm text-gray-500">Publish only records with raw data</span>
                </span>
                <span className="text-lg text-gray-500">→</span>
              </button>
              <button
                onClick={() => router.push('/admin/site-content')}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
              >
                <span>
                  <span className="block font-medium text-gray-900">Edit site content</span>
                  <span className="text-sm text-gray-500">Products, applications, resources, and about pages</span>
                </span>
                <span className="text-lg text-gray-500">→</span>
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent articles</h2>
              <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-black">
                View all
              </Link>
            </div>

            {loading ? (
              <div className="text-sm text-gray-400">Loading...</div>
            ) : articles.length === 0 ? (
              <div className="text-sm text-gray-500">No articles yet.</div>
            ) : (
              <div className="space-y-3">
                {articles.slice(0, 4).map((article) => (
                  <div key={article.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{article.title}</p>
                      <p className="text-xs text-gray-500">{new Date(article.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/edit/${article.id}`)}
                        className="text-xs font-medium text-gray-600 hover:text-black"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="text-xs font-medium text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </NotionLayout>
  );
}
