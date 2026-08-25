'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import FadeIn from '@/components/FadeIn';
import Footer from '@/components/Footer';
import NotionLayout from '@/components/NotionLayout';
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
    <NotionLayout title="Home">
      <main className="min-h-screen">

      <section className="relative overflow-hidden px-6 pb-20 pt-32 section-gradient">
        <div className="absolute inset-0 soft-grid opacity-60" />
        <div className="absolute -left-28 top-1/3 h-56 w-56 rounded-full bg-black/5 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-black/5 blur-3xl" />

        <div className="relative mx-auto max-w-[1200px]">
          <div className="section-shell rounded-[32px] border border-black/5 bg-white/75 p-3 sm:p-4 md:p-6">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[26px] bg-[#f5f5f3] p-7 md:p-9 lg:p-10">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-700">
                  Powering Magnificent Moments
                </div>

                <h1 className="max-w-xl text-4xl font-black tracking-[-0.06em] text-gray-950 md:text-5xl lg:text-[4rem] lg:leading-[0.98]">
                  Electronics that move <span className="text-gradient">performance</span> forward.
                </h1>

                <p className="mt-6 max-w-xl text-base leading-8 text-gray-600 md:text-lg">
                  MagnaChip delivers efficient, reliable semiconductor solutions for automotive,
                  industrial, cloud, and consumer innovation — from power conversion to system-level
                  intelligence.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a href="#products" className="btn-gradient">
                    Explore Products
                  </a>
                  <a href="#about" className="btn-gradient btn-gradient-light">
                    About MagnaChip
                  </a>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {t.metrics.slice(0, 3).map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                      <div className="text-2xl font-bold tracking-tight text-gray-950">{metric.value}</div>
                      <div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[26px] border border-black/5 bg-gradient-to-br from-[#0e1116] via-[#131922] to-[#1a212b] p-6 text-white md:p-7">
                {loading ? (
                  <div className="h-full min-h-[340px] animate-pulse rounded-2xl bg-white/5" />
                ) : !article ? (
                  <p className="py-16 text-center text-sm text-gray-300">No articles yet.</p>
                ) : (
                  <FadeIn key={article.id} delay={0.25}>
                    <article className="flex h-full flex-col">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                          {getCategoryBySlug(article.slug)}
                        </span>
                        <time className="text-xs font-medium text-gray-300">
                          {new Date(article.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </time>
                      </div>

                      <h2 className="mt-6 text-2xl font-bold leading-tight tracking-[-0.04em] text-white md:text-[2rem]">
                        {article.title}
                      </h2>

                      <p className="mt-4 text-sm leading-7 text-gray-300">{article.excerpt}</p>

                      <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
                        <button
                          onClick={goPrev}
                          disabled={!hasPrev}
                          className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                            hasPrev
                              ? 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                              : 'cursor-not-allowed border-white/10 bg-transparent text-white/25'
                          }`}
                          aria-label="Previous article"
                        >
                          <IconChevronLeft className="h-5 w-5" />
                        </button>

                        <Link
                          href={`/news/${article.slug}`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-gray-200"
                        >
                          Read story
                          <IconChevronRight className="h-4 w-4" />
                        </Link>

                        <button
                          onClick={goNext}
                          disabled={!hasNext}
                          className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                            hasNext
                              ? 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                              : 'cursor-not-allowed border-white/10 bg-transparent text-white/25'
                          }`}
                          aria-label="Next article"
                        >
                          <IconChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </article>
                  </FadeIn>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 section-gradient">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">Impact</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-gray-950 md:text-4xl">
                Built for modern power systems.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            {t.metrics.map((m, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="card-mk rounded-[24px] border border-black/5 bg-white p-6 text-center shadow-[0_12px_32px_rgba(17,24,39,0.05)] md:p-8">
                  <div className="mb-1 text-3xl font-black tracking-[-0.06em] text-gray-950 md:text-4xl">
                    {m.value}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">{m.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="scroll-mt-20 bg-white px-6 py-24">
        <div className="mx-auto max-w-[1100px]">
          <FadeIn>
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-black/70">
                {t.products.sectionTag}
              </p>
              <h2 className="text-balance text-3xl font-bold tracking-[-0.05em] text-gray-900 md:text-4xl">
                {t.products.sectionTitle}
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">{t.products.sectionDesc}</p>
            </div>
          </FadeIn>

          <div className="mb-8 flex flex-wrap gap-2">
            {['Power Conversion', 'Automotive', 'Industrial', 'SiC', 'AI Infrastructure'].map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center rounded-full border border-black/10 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.products.items.map((p, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div className="card-mk group h-full rounded-[26px] border border-black/5 bg-gradient-to-br from-white to-[#f9fafb] p-6 transition-all duration-300 hover:border-black/10 hover:bg-white">
                  <span className="badge-mk mb-4 bg-[#111827] text-white">{p.category}</span>
                  <div className="mb-3 flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
                    {p.tag && (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-700">
                        {p.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600">{p.desc}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-gray-900">
                    Learn more
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-20 bg-[#f3f4f6] px-6 py-24">
        <div className="mx-auto grid max-w-[1100px] items-center gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <FadeIn>
              <span className="badge-mk mb-4 bg-gray-200 text-gray-700">{t.about.sectionTag}</span>
              <h2 className="mb-6 text-3xl font-bold tracking-[-0.05em] text-gray-900 md:text-4xl">
                {t.about.sectionTitle}
              </h2>
              <p className="mb-4 leading-relaxed text-gray-600">{t.about.p1}</p>
              <p className="leading-relaxed text-gray-600">{t.about.p2}</p>
            </FadeIn>
          </div>
          <FadeIn delay={0.1}>
            <div className="card-mk flex aspect-[4/3] items-center justify-center rounded-[28px] border border-black/5 bg-white p-6">
              <img src="/magnachip_image.png" alt="MagnaChip" className="h-full w-full object-contain" />
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="news" className="scroll-mt-20 bg-white px-6 py-24">
        <div className="mx-auto max-w-[1100px]">
          <FadeIn>
            <div className="mb-14 max-w-2xl">
              <span className="badge-mk mb-4 bg-gray-100 text-gray-600">{t.news.sectionTag}</span>
              <h2 className="text-3xl font-bold tracking-[-0.05em] text-gray-900 md:text-4xl">
                {t.news.sectionTitle}
              </h2>
            </div>
          </FadeIn>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {t.news.items.map((n, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <article className="card-mk h-full rounded-[24px] border border-black/5 bg-[#fafafa] p-6">
                  <time className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">{n.date}</time>
                  <h3 className="mt-3 mb-2 text-lg font-semibold text-gray-900">{n.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{n.desc}</p>
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
    </NotionLayout>
  );
}
