'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

type SectionKey = 'products' | 'applications' | 'designResources' | 'about';

const SECTIONS: { key: SectionKey; title: string; description: string; placeholder: string }[] = [
  {
    key: 'products',
    title: 'Products',
    description:
      'Categories → Families → Variants. Each top-level key is a category, its value is a map of family → variants (string[]).',
    placeholder: '{\n  "Power Solution": {\n    "Overview": [],\n    "MXT MOSFETs": ["Overview", "12V-24V"]\n  }\n}',
  },
  {
    key: 'applications',
    title: 'Applications',
    description:
      'Categories → Subcategories → Details. Same shape as Products.',
    placeholder:
      '{\n  "Server": {\n    "Overview": [],\n    "Power Supply Unit": ["Low-Middle Power (<1.6kW) PSU"]\n  }\n}',
  },
  {
    key: 'designResources',
    title: 'Design Resources',
    description:
      'Flat map of category → items[]. Use an empty array for categories without items. The "Overview" key is treated as a special link to /design-resources.',
    placeholder: '{\n  "Overview": [],\n  "Tools": ["Safe Operating Area (SOA)", "Digital Datasheet"]\n}',
  },
  {
    key: 'about',
    title: 'About Us',
    description:
      'Categories where the value is either a string[] (no subcategory) or a subcategory → items[] map. Matches the original "About Us" dropdown shape.',
    placeholder:
      '{\n  "Overview": [],\n  "Corporate Responsibility": {\n    "Environment": ["Overview", "Climate Change"]\n  }\n}',
  },
];

function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export default function AdminSiteContentPage() {
  const [active, setActive] = useState<SectionKey>('designResources');
  const [values, setValues] = useState<Record<SectionKey, unknown>>({
    products: null,
    applications: null,
    designResources: null,
    about: null,
  });
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/site-content', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Failed to load (${res.status})`);
      }
      const data = (await res.json()) as { content: Record<SectionKey, unknown> & { updatedAt: string } };
      setValues({
        products: data.content.products,
        applications: data.content.applications,
        designResources: data.content.designResources,
        about: data.content.about,
      });
      setUpdatedAt(data.content.updatedAt ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load site content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const v = values[active];
    const txt = v === null || v === undefined ? '' : pretty(v);
    setText(txt);
    setSavedSnapshot(txt);
    setError(null);
    setSuccess(null);
  }, [active, values]);

  const dirty = text !== savedSnapshot;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : 'parse error'}`);
      setSaving(false);
      return;
    }
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      setError('Section value must be a JSON object (map of keys → values).');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/site-content/${active}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: parsed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Failed to save (${res.status})`);
      }
      const data = (await res.json()) as { value: unknown; updatedAt: string };
      const txt2 = pretty(data.value);
      setValues((prev) => ({ ...prev, [active]: data.value }));
      setText(txt2);
      setSavedSnapshot(txt2);
      setUpdatedAt(data.updatedAt);
      setSuccess('Saved. The website will pick up the change on the next page load.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm('Discard unsaved changes to this section?')) return;
    setText(savedSnapshot);
    setError(null);
    setSuccess(null);
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(text);
      setText(pretty(parsed));
    } catch (err) {
      setError(`Cannot format invalid JSON: ${err instanceof Error ? err.message : 'parse error'}`);
    }
  };

  const activeSection = SECTIONS.find((s) => s.key === active)!;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Section nav */}
        <nav className="flex items-center gap-1 mb-8 flex-wrap">
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200/60 hover:text-gray-900 transition-colors"
          >
            Articles
          </Link>
          <Link
            href="/admin/datasheets"
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200/60 hover:text-gray-900 transition-colors"
          >
            Digital Datasheets
          </Link>
          <Link
            href="/admin/site-content"
            className="px-4 py-2 rounded-xl text-sm font-medium bg-black text-white transition-colors"
          >
            Site Content
          </Link>
        </nav>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Site Content</h1>
            <p className="text-gray-500 text-sm mt-1">
              Edit the navigation menus, products, applications, design resources, and about-us
              structure shown across the site.
            </p>
            {updatedAt && (
              <p className="text-xs text-gray-400 mt-1">Last saved: {new Date(updatedAt).toLocaleString()}</p>
            )}
          </div>
          <button
            onClick={loadAll}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : 'Reload from disk'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setActive(s.key)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active === s.key
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">{activeSection.title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{activeSection.description}</p>
        </div>

        {/* Status banners */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Editor */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
            Loading site content...
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-500">
                  {activeSection.key}.json
                </span>
                <span
                  className={`text-[11px] font-medium ${
                    dirty ? 'text-amber-600' : 'text-gray-400'
                  }`}
                >
                  {dirty ? 'Unsaved changes' : 'Saved'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFormat}
                  className="text-xs px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Format
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!dirty || saving}
                  className="text-xs px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!dirty || saving}
                  className="text-xs px-4 py-1.5 rounded-md bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              placeholder={activeSection.placeholder}
              className="w-full min-h-[420px] font-mono text-xs leading-relaxed p-4 outline-none resize-y text-gray-900"
            />
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-[11px] text-gray-400">
              Tip: keep the shape consistent (objects with string keys, arrays of strings).
              Removing a category also removes its route from the navigation menu.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
