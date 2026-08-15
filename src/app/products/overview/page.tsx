'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductsSidebar from '@/components/ProductsSidebar';
import FadeIn from '@/components/FadeIn';

function ProductsOverviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const partNumber = searchParams.get('partNumber');

  useEffect(() => {
    if (partNumber) {
      // Legacy links that pointed here with ?partNumber should go to the canonical tool page
      router.replace(`/design-resources/tool/digital-datasheet?partNumber=${encodeURIComponent(partNumber)}`);
    }
  }, [partNumber, router]);

  if (partNumber) return null; // while redirecting

  return (
    <>
      <FadeIn>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 flex-wrap">
          <Link href="/products" className="hover:text-black transition-colors print:hidden">
            Products
          </Link>
          <span className="print:hidden">/</span>
          <span className="text-gray-900 font-medium print:hidden">Overview</span>
        </div>
      </FadeIn>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="print:hidden">
          <ProductsSidebar />
        </div>

        <div className="flex-1 min-w-0">
          <FadeIn>
            <div className="max-w-2xl mb-8 print:hidden">
              <p className="text-sm font-medium tracking-[0.2em] uppercase text-black mb-3">Products</p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance mb-2">Overview</h1>
              <p className="text-gray-500 text-sm">
                Explore our product portfolio by family and variant. Use the sidebar to navigate
                families or click a product to view detailed specifications and datasheets.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Power Solution</h3>
              <p className="text-sm text-gray-500">MXT, SJ, HV MOSFETs, IGBTs, and SiC products.</p>
            </div>
            <div className="p-5 rounded-xl bg-white border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Autonomous Solution</h3>
              <p className="text-sm text-gray-500">Solutions for motor drivers and automotive applications.</p>
            </div>
            <div className="p-5 rounded-xl bg-white border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Power IC</h3>
              <p className="text-sm text-gray-500">Integrated power management ICs and controllers.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProductOverviewPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-28 px-6 bg-[#f9fafb] min-h-screen print:bg-white print:pt-0 print:pb-0 print:min-h-0">
        <div className="max-w-[1200px] mx-auto">
          <Suspense fallback={null}>
            <ProductsOverviewContent />
          </Suspense>
        </div>
      </section>
      <Footer />
    </main>
  );
}
