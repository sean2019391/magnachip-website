'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Article } from '@/types/article';

export default function AdminPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = () => {
    setLoading(true);
    fetch('/api/articles?admin=true')
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1100px] mx-auto px-6 py-12">
        {/* Section nav */}
        <nav className="flex items-center gap-1 mb-8">
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl text-sm font-medium bg-black text-white transition-colors"
          >
            Articles
          </Link>
          <Link
            href="/admin/datasheets"
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200/60 hover:text-gray-900 transition-colors"
          >
            Digital Datasheets
          </Link>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your newsroom articles</p>
          </div>
          <button
            onClick={() => router.push('/admin/edit/new')}
            className="px-4 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            + New Article
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-12 text-center text-gray-400 text-sm">Loading...</div>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No articles yet.</p>
              <button
                onClick={() => router.push('/admin/edit/new')}
                className="px-4 py-2 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Create your first article
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">
                    Title
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden sm:table-cell">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr
                    key={article.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{article.title}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                      {new Date(article.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          article.published
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => router.push(`/admin/edit/${article.id}`)}
                        className="text-sm text-gray-600 hover:text-black mr-4 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="text-sm text-red-500 hover:text-red-700 transition-colors"
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
