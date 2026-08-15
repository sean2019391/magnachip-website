'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { designResourcesData, slugToDrCategory, toSlug } from '@/lib/products';
import DesignResourcesSidebar from '@/components/DesignResourcesSidebar';
import FadeIn from '@/components/FadeIn';

export default function DesignResourceCategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const category = slugToDrCategory[slug];

  if (!category || category === 'Overview') {
    return (
      <main className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-28 px-6 bg-[#f9fafb] min-h-screen">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col lg:flex-row gap-10">
              <DesignResourcesSidebar />
              <div className="flex-1 min-w-0 text-center pt-10">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h1>
                <Link
                  href="/design-resources"
                  className="text-sm text-gray-600 hover:text-black underline"
                >
                  Back to resources
                </Link>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const items = designResourcesData[category] ?? [];

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-28 px-6 bg-[#f9fafb] min-h-screen">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 flex-wrap">
              <Link href="/design-resources" className="hover:text-black transition-colors">
                Design Resources
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{category}</span>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-10">
            <DesignResourcesSidebar activeCategory={category} />

            <div className="flex-1 min-w-0">
              <FadeIn>
                <div className="max-w-2xl mb-10">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance mb-4">
                    {category}
                  </h1>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Design resources available in the {category} category.
                  </p>
                </div>
              </FadeIn>

              {items.length > 0 ? (
                <FadeIn delay={0.1}>
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">Resources</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {items.map((item, i) => {
                      // Render SOA as a card that can show nested tool links (e.g. Digital Datasheet)
                      if (category === 'Tools' && item === 'Safe Operating Area (SOA)') {
                        return (
                          <FadeIn key={item} delay={Math.min(i * 0.04, 0.15)}>
                            <div className="block p-4 rounded-xl bg-white border border-gray-200 hover:border-black/30 hover:shadow-sm transition-all">
                              <Link href={`/design-resources/tools/${toSlug(item)}`} className="text-sm font-semibold text-gray-900 block mb-2">
                                Safe Operating Area (SOA)
                              </Link>

                              <div className="mt-2 text-xs text-gray-600">
                                {/* If Digital Datasheet is present, show it as a nested link under SOA */}
                                <Link href="/design-resources/tool/digital-datasheet" className="inline-block mr-3 mb-1 px-2 py-1 rounded bg-gray-50 border text-gray-800 hover:bg-gray-100">
                                  Digital Datasheet
                                </Link>
                              </div>
                            </div>
                          </FadeIn>
                        );
                      }

                      // Don't render a standalone card for Digital Datasheet when it's shown nested under SOA
                      if (category === 'Tools' && item === 'Digital Datasheet') {
                        return null;
                      }

                      const href =
                        item === 'Digital Datasheet'
                          ? `/design-resources/tool/digital-datasheet`
                          : `/design-resources?q=${encodeURIComponent(item)}`;

                      return (
                        <FadeIn key={item} delay={Math.min(i * 0.04, 0.15)}>
                          <Link
                            href={href}
                            className="block p-4 rounded-xl bg-white border border-gray-200 hover:border-black/30 hover:shadow-sm transition-all"
                          >
                            <p className="text-sm font-semibold text-gray-900">{item}</p>
                          </Link>
                        </FadeIn>
                      );
                    })}
                  </div>
                </FadeIn>
              ) : (
                <p className="text-gray-400 text-sm">No resources listed yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
