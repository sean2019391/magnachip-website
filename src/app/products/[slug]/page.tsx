'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toSlug } from '@/lib/products';
import ProductsSidebar from '@/components/ProductsSidebar';
import FadeIn from '@/components/FadeIn';
import {
  DEFAULT_PRODUCTS,
  type TripleNestedStringMap,
  type SiteContent,
} from '@/lib/site-content';

export default function ProductFamilyPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [products, setProducts] = useState<TripleNestedStringMap>(DEFAULT_PRODUCTS);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/site-content', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { content?: SiteContent } | null) => {
        if (cancelled || !data?.content?.products) return;
        setProducts(data.content.products);
      })
      .catch(() => {
        // Network error → keep defaults.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Build reverse lookups from the (possibly updated) products map.
  const slugToFamily: Record<string, string> = {};
  const familyToCategory: Record<string, string> = {};
  for (const cat of Object.keys(products)) {
    for (const fam of Object.keys(products[cat])) {
      slugToFamily[toSlug(fam)] = fam;
      familyToCategory[fam] = cat;
    }
  }

  const family = slugToFamily[slug];
  const category = family ? familyToCategory[family] ?? null : null;
  const items = family && category ? (products[category]?.[family] ?? []) : [];

  if (!family) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-28 px-6 bg-[#f9fafb] min-h-screen">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col lg:flex-row gap-10">
              <ProductsSidebar />
              <div className="flex-1 min-w-0 text-center pt-10">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
                <Link href="/products" className="text-sm text-gray-600 hover:text-black underline">
                  Back to products
                </Link>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const variants = items.filter((v) => v !== 'Overview');

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
              <span className="text-gray-900 font-medium">{family}</span>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar */}
            <ProductsSidebar activeFamily={family} />

            {/* Main content: Overview */}
            <div className="flex-1 min-w-0">
              <FadeIn>
                <div className="max-w-2xl mb-10">
                  <p className="text-sm font-medium tracking-[0.2em] uppercase text-black mb-3">
                    {category}
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance mb-4">
                    {family}
                  </h1>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Overview of the {family} product family. Select a voltage variant from the
                    sidebar to view detailed specifications and available products.
                  </p>
                </div>
              </FadeIn>

              {variants.length > 0 && (
                <FadeIn delay={0.1}>
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">
                    Available Voltage Variants
                  </h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {variants.map((v, i) => (
                      <FadeIn key={v} delay={Math.min(i * 0.03, 0.15)}>
                        <Link
                          href={`/products/${slug}/${toSlug(v)}`}
                          className="block p-4 rounded-xl bg-white border border-gray-200 hover:border-black/30 hover:shadow-sm transition-all"
                        >
                          <p className="text-sm font-semibold text-gray-900">{v}</p>
                        </Link>
                      </FadeIn>
                    ))}
                  </div>
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
