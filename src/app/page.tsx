'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import FadeIn from '@/components/FadeIn';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useI18n } from '@/i18n/context';
import type { Article } from '@/types/article';
import { getCategoryBySlug } from '@/lib/category';
import { IconChevronLeft, IconChevronRight } from '@/components/Icons';
import SolutionsSection from '@/components/SolutionsSection';

export default function HomePage() {
  const { t } = useI18n();
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles')
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const article = articles[currentIdx];
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < articles.length - 1;

  const goPrev = () => {
    if (hasPrev) setCurrentIdx((i) => i - 1);
  };
  const goNext = () => {
    if (hasNext) setCurrentIdx((i) => i + 1);
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Newsroom (replaces Hero) */}
      <section className="pt-36 pb-28 px-6 section-gradient relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-black/[0.03] to-transparent pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-black/[0.02] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-black/[0.02] blur-3xl pointer-events-none" />
        <div className="max-w-[1100px] mx-auto relative">
          {loading ? (
            <div className="rounded-2xl bg-white border border-gray-200 animate-pulse h-96 shadow-sm" />
          ) : !article ? (
            <p className="text-gray-500 text-center py-16">No articles yet.</p>
          ) : (
            <FadeIn key={article.id} delay={0.3}>
              <article className="group bg-white rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden">
                {/* Clickable link to full article */}
                <Link href={`/news/${article.slug}`} className="block p-8 md:p-10 lg:p-12">
                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-900 text-white tracking-wide">
                      {getCategoryBySlug(article.slug)}
                    </span>
                    <time className="text-sm text-gray-400 font-medium">
                      {new Date(article.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-[1.15] tracking-tight group-hover:text-black/70 transition-colors duration-200">
                    {article.title}
                  </h2>

                  {/* Divider */}
                  <div className="w-12 h-0.5 bg-gray-200 my-5" />

                  {/* Excerpt */}
                  <p className="text-gray-500 leading-relaxed text-base">{article.excerpt}</p>
                </Link>

                {/* Navigation */}
                <div className="flex items-center justify-between px-8 md:px-10 lg:px-12 py-4 border-t border-gray-100 bg-gray-50/50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goPrev();
                    }}
                    disabled={!hasPrev}
                    className={`p-3 rounded-lg transition-colors ${
                      hasPrev
                        ? 'text-gray-600 hover:text-black hover:bg-gray-200/60'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                    aria-label="Previous article"
                  >
                    <IconChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goNext();
                    }}
                    disabled={!hasNext}
                    className={`p-3 rounded-lg transition-colors ${
                      hasNext
                        ? 'text-gray-600 hover:text-black hover:bg-gray-200/60'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                    aria-label="Next article"
                  >
                    <IconChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </article>
            </FadeIn>
          )}
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-20 px-6 section-gradient">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {t.metrics.map((m, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="card-mk p-6 md:p-8 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-black mb-1 tabular-nums">
                    {m.value}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{m.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-24 px-6 bg-white scroll-mt-20">
        <div className="max-w-[1100px] mx-auto">
          <FadeIn>
            <div className="max-w-2xl mb-14">
              <p className="text-sm font-medium tracking-[0.2em] uppercase text-black mb-3">
                {t.products.sectionTag}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 text-balance">
                {t.products.sectionTitle}
              </h2>
              <p className="text-gray-500 leading-relaxed">{t.products.sectionDesc}</p>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.products.items.map((p, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div className="card-mk p-6 h-full">
                  <span className="badge-mk bg-gray-100 text-gray-500 mb-3">{p.category}</span>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-base font-semibold text-gray-900">{p.title}</h3>
                    {p.tag && (
                      <span className="badge-mk bg-black/[0.08] text-black text-[10px] px-2 py-0.5">
                        {p.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6 section-gradient scroll-mt-20">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <FadeIn>
              <span className="badge-mk bg-gray-200 text-gray-600 mb-4">{t.about.sectionTag}</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 text-balance">
                {t.about.sectionTitle}
              </h2>
              <p className="text-gray-500 mb-4 leading-relaxed">{t.about.p1}</p>
              <p className="text-gray-500 leading-relaxed">{t.about.p2}</p>
            </FadeIn>
          </div>
          <FadeIn delay={0.1}>
            <div className="card-mk aspect-[4/3] flex items-center justify-center p-6">
              <img
                src="/magnachip_image.png"
                alt="MagnaChip"
                className="w-full h-full object-contain"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* News */}
      <section id="news" className="py-24 px-6 bg-white scroll-mt-20">
        <div className="max-w-[1100px] mx-auto">
          <FadeIn>
            <div className="max-w-2xl mb-14">
              <span className="badge-mk bg-gray-100 text-gray-500 mb-4">{t.news.sectionTag}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance">
                {t.news.sectionTitle}
              </h2>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {t.news.items.map((n, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <article className="card-mk p-6 h-full">
                  <time className="text-xs text-gray-400">{n.date}</time>
                  <h3 className="text-base font-semibold text-gray-900 mt-2 mb-2">{n.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{n.desc}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <SolutionsSection />

      {/* CTA */}
      <section className="py-24 px-6 section-gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 dots-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-3xl pointer-events-none" />
        <div className="max-w-[1100px] mx-auto text-center relative">
          <FadeIn>
            <span className="badge-mk bg-white/10 text-white/70 mb-4">Get in Touch</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
              {t.cta.title}
            </h2>
            <p className="text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">{t.cta.desc}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a
                href="https://www.magnachip.com/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gradient font-semibold"
              >
                {t.cta.btn1}
              </a>
              <a href="#products" className="btn-gradient">
                {t.cta.btn2}
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}
