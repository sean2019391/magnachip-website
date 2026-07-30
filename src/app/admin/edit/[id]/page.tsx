'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const isNew = params.id === 'new'

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    published: true,
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) return
    fetch(`/api/articles/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.article) {
          const a = data.article
          setForm({
            title: a.title,
            slug: a.slug,
            excerpt: a.excerpt,
            content: a.content,
            date: a.date.split('T')[0],
            published: a.published,
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [isNew, params.id])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const checked =
      type === 'checkbox' ? (e as React.ChangeEvent<HTMLInputElement>).target.checked : undefined

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }
      if (name === 'title' && prev.slug === '') {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      }
      return updated
    })
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      slug: e.target.value,
    }))
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    if (!form.slug.trim()) {
      setError('Slug is required')
      return
    }

    setSaving(true)
    setError('')

    try {
      const body = {
        ...form,
        date: new Date(form.date).toISOString(),
      }

      let res: Response
      if (isNew) {
        res = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch(`/api/articles/${params.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (res.ok) {
        router.push('/admin')
      } else {
        const data = await res.json()
        setError(data.error ?? 'Failed to save article')
      }
    } catch {
      setError('Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[700px] mx-auto px-6 py-12">
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-sm text-gray-500 hover:text-black mb-4 transition-colors"
          >
            &larr; Back to Articles
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'New Article' : 'Edit Article'}
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors text-sm"
              placeholder="Article title"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleSlugChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors text-sm font-mono"
              placeholder="article-slug"
            />
            <p className="text-xs text-gray-400 mt-1">
              Auto-generated from title. You can override.
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Excerpt</label>
            <textarea
              name="excerpt"
              rows={3}
              value={form.excerpt}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors text-sm resize-none"
              placeholder="Brief description..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Content</label>
            <textarea
              name="content"
              rows={10}
              value={form.content}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors text-sm font-mono leading-relaxed"
              placeholder="Article content (supports plain text with line breaks)..."
            />
          </div>

          {/* Date + Published row */}
          <div className="flex gap-6 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors text-sm"
              />
            </div>
            <label className="flex items-center gap-3 pb-2.5">
              <span className="text-sm font-medium text-gray-700">Published</span>
              <input
                type="checkbox"
                name="published"
                checked={form.published}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={() => router.push('/admin')}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Article'}
          </button>
        </div>
      </div>
    </div>
  )
}
