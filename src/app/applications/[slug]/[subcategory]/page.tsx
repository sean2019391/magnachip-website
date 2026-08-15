'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  applicationsData,
  slugToCategory,
  slugToSubcategory,
  categoryForSubcategory,
  toSlug,
} from '@/lib/products';
import ApplicationsSidebar from '@/components/ApplicationsSidebar';
import FadeIn from '@/components/FadeIn';

export default function ApplicationSubcategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const subSlug = params.subcategory as string;

  const subcategory = slugToSubcategory[subSlug];
  const category = subcategory ? categoryForSubcategory(subcategory) : null;

  if (!subcategory || !category) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-28 px-6 bg-[#f9fafb] min-h-screen">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col lg:flex-row gap-10">
              <ApplicationsSidebar />
              <div className="flex-1 min-w-0 text-center pt-10">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Application not found</h1>
                <Link
                  href="/applications"
                  className="text-sm text-gray-600 hover:text-black underline"
                >
                  Back to applications
                </Link>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const details = applicationsData[category]?.[subcategory] ?? [];

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-28 px-6 bg-[#f9fafb] min-h-screen">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 flex-wrap">
              <Link href="/applications" className="hover:text-black transition-colors">
                Applications
              </Link>
              <span>/</span>
              <Link href={`/applications/${slug}`} className="hover:text-black transition-colors">
                {category}
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{subcategory}</span>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar */}
            <ApplicationsSidebar activeCategory={category} activeSubcategory={subcategory} />

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <FadeIn>
                <div className="max-w-2xl mb-10">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance mb-2">
                    {subcategory}
                  </h1>
                  <p className="text-sm text-gray-500 mb-6">{category}</p>

                  {details.length > 0 ? (
                    <div>
                      <h2 className="text-sm font-semibold text-gray-700 mb-3">Solution Details</h2>
                      <ul className="space-y-2">
                        {details.map((d) => (
                          <li
                            key={d}
                            className="text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-4 py-3"
                          >
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Detailed information coming soon.</p>
                  )}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
