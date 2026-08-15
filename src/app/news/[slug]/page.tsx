'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FadeIn from '@/components/FadeIn';
import type { Article } from '@/types/article';
import { getCategoryBySlug } from '@/lib/category';
import { IconChevronLeft } from '@/components/Icons';

export default function NewsDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/articles?slug=${params.slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        if (data.article) {
          setArticle(data.article);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [params.slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f9fafb]">
          <div className="max-w-[800px] mx-auto px-6 pt-36 pb-24">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-64 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !article) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
            <Link href="/" className="text-sm text-gray-500 hover:text-black underline">
              Back to homepage
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const category = getCategoryBySlug(article.slug);
  const paragraphs = article.content.split('\n\n');

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f9fafb]">
        <article>
          {/* Hero header */}
          <div className="bg-white border-b border-gray-100">
            <div className="max-w-[800px] mx-auto px-6 pt-36 pb-12">
              <FadeIn delay={0.1}>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-black transition-colors mb-8"
                >
                  <IconChevronLeft className="w-3.5 h-3.5" />
                  Back to Newsroom
                </Link>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                    {category}
                  </span>
                  <time className="text-sm text-gray-400">
                    {new Date(article.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
              </FadeIn>

              <FadeIn delay={0.25}>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                  {article.title}
                </h1>
              </FadeIn>

              <FadeIn delay={0.3}>
                <p className="text-lg text-gray-500 mt-5 leading-relaxed">{article.excerpt}</p>
              </FadeIn>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-[800px] mx-auto px-6 py-12">
            {article.slug.includes('chae-lee') && (
              <FadeIn delay={0.1}>
                <div className="mb-10">
                  <img
                    src="/Magnachip_CEO_Chae_Lee.jpg"
                    alt="Chae Lee, CEO of Magnachip"
                    className="w-full max-w-[400px] rounded-2xl border border-gray-200 shadow-sm"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Chae Lee, Chief Executive Officer of Magnachip Semiconductor
                  </p>
                </div>
              </FadeIn>
            )}

            <div className="prose-custom">
              {paragraphs.map((p, i) => (
                <FadeIn key={i} delay={0.05 * Math.min(i, 5)}>
                  {p.startsWith('“') || p.startsWith('"') ? (
                    <blockquote className="border-l-4 border-black pl-6 py-2 my-8 text-gray-700 text-lg leading-relaxed italic">
                      {p}
                    </blockquote>
                  ) : (
                    <p className="text-gray-700 text-base leading-[1.8] mb-6">{p}</p>
                  )}
                </FadeIn>
              ))}
            </div>

            {/* Navigation footer */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
              >
                <IconChevronLeft className="w-3.5 h-3.5" />
                Back to all news
              </Link>
            </div>
          </div>
        </article>

        {/* Bottom CTA */}
        <section className="bg-black py-20 px-6 mt-12">
          <div className="max-w-[800px] mx-auto text-center">
            <FadeIn>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 text-balance">
                Stay Updated with MagnaChip
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto text-sm">
                Follow our latest news, product launches, and industry insights.
              </p>
              <Link
                href="/"
                className="inline-flex px-6 py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-gray-100 transition-colors"
              >
                Back to Newsroom
              </Link>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
