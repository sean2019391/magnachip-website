'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toSlug } from '@/lib/products';
import {
  getProductsForVariant,
  getColumnsForFamily,
  formatVal,
  statusColor,
  variantSlugToDisplay,
} from '@/lib/product-db';
import ProductsSidebar from '@/components/ProductsSidebar';
import FadeIn from '@/components/FadeIn';
import { hasDigitalDatasheet } from '@/lib/digital-datasheet-registry';
import {
  DEFAULT_PRODUCTS,
  type TripleNestedStringMap,
  type SiteContent,
} from '@/lib/site-content';

export default function ProductVariantPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const variantSlug = params.variant as string;

  const [navProducts, setNavProducts] = useState<TripleNestedStringMap>(DEFAULT_PRODUCTS);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/site-content', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { content?: SiteContent } | null) => {
        if (cancelled || !data?.content?.products) return;
        setNavProducts(data.content.products);
      })
      .catch(() => {
        // Network error → keep defaults.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Build a slug → family reverse lookup from the live products data so the
  // admin can add/rename product families without rebuilding the app.
  const slugToFamily: Record<string, string> = {};
  for (const cat of Object.keys(navProducts)) {
    for (const fam of Object.keys(navProducts[cat])) {
      slugToFamily[toSlug(fam)] = fam;
    }
  }
  const family = slugToFamily[slug];

  // If variant is "overview", redirect to family page
  useEffect(() => {
    if (family && variantSlug === 'overview') {
      router.replace(`/products/${slug}`);
    }
  }, [family, variantSlug, slug, router]);

  const voltageDisplay = variantSlugToDisplay(variantSlug);
  const columns = family ? getColumnsForFamily(family) : [];
  const products = family ? getProductsForVariant(family, voltageDisplay) : [];

  const typeOptions = useMemo(() => {
    const types = new Set(products.map((p) => p.fam.replace(/^[\dV\-]+\s*/, '')));
    return Array.from(types).sort();
  }, [products]);

  const [activeType, setActiveType] = useState<string | null>(null);

  const filtered = activeType ? products.filter((p) => p.fam.endsWith(activeType)) : products;

  // Don't render while redirecting
  if (!family || variantSlug === 'overview') {
    return null;
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-28 px-6 bg-[#f9fafb] min-h-screen">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 flex-wrap">
              <Link href="/products" className="hover:text-black transition-colors">
                Products
              </Link>
              <span>/</span>
              <Link href={`/products/${slug}`} className="hover:text-black transition-colors">
                {family}
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{voltageDisplay}</span>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar */}
            <ProductsSidebar activeFamily={family} activeVariant={voltageDisplay} />

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <FadeIn>
                <div className="max-w-2xl mb-8">
                  <p className="text-sm font-medium tracking-[0.2em] uppercase text-black mb-3">
                    {family}
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance mb-2">
                    {voltageDisplay}
                  </h1>
                  <p className="text-gray-500 text-sm">
                    {products.length} product{products.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </FadeIn>

              {products.length === 0 ? (
                <FadeIn delay={0.1}>
                  <div className="rounded-xl bg-white border border-gray-200 p-12 text-center">
                    <p className="text-gray-400 text-sm">
                      No products found for this voltage variant. Detailed specifications coming
                      soon.
                    </p>
                  </div>
                </FadeIn>
              ) : (
                <FadeIn delay={0.1}>
                  {typeOptions.length > 1 && (
                    <div className="flex items-center gap-2 mb-6 flex-wrap">
                      <button
                        onClick={() => setActiveType(null)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                          activeType === null
                            ? 'bg-black text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        All
                      </button>
                      {typeOptions.map((t) => (
                        <button
                          key={t}
                          onClick={() => setActiveType(t)}
                          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                            activeType === t
                              ? 'bg-black text-white'
                              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/80">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Part Number
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Package
                          </th>
                          {columns.map((col) => (
                            <th
                              key={col.key}
                              className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                            >
                              <span className="block">{col.label}</span>
                              <span className="text-gray-400 font-normal">({col.unit})</span>
                            </th>
                          ))}
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Status
                          </th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Datasheet
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filtered.map((product) => (
                          <tr key={product.pn} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                              {product.pn}
                            </td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                              {product.pkg || '—'}
                            </td>
                            {columns.map((col) => (
                              <td
                                key={col.key}
                                className="px-4 py-3 text-gray-700 whitespace-nowrap tabular-nums"
                              >
                                {formatVal(product.vals[col.key])}
                              </td>
                            ))}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                {product.smpCat && (
                                  <span
                                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit ${statusColor(product.smpCat)}`}
                                  >
                                    Sample: {product.smpCat}
                                  </span>
                                )}
                                {product.relCat && (
                                  <span
                                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit ${statusColor(product.relCat)}`}
                                  >
                                    {product.relCat}
                                  </span>
                                )}
                                {product.new === 1 && (
                                  <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit bg-purple-100 text-purple-700">
                                    NEW
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-3">
                                {product.ds ? (
                                  <a
                                    href={product.ds}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                  >
                                    <svg
                                      className="w-3.5 h-3.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                    PDF
                                  </a>
                                ) : (
                                  <span className="text-gray-300 text-xs">—</span>
                                )}
                                {hasDigitalDatasheet(product.pn) && (
                                  <Link
                                                                      href={`/design-resources/tool/digital-datasheet?partNumber=${encodeURIComponent(product.pn)}`}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                    title="View interactive digital datasheet"
                                  >
                                    <svg
                                      className="w-3.5 h-3.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                      />
                                    </svg>
                                    Digital
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filtered.length === 0 && (
                    <p className="text-gray-400 text-sm mt-4 text-center">
                      No products match the selected type.
                    </p>
                  )}
                </FadeIn>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
