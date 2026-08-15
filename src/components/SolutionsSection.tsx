'use client';

import FadeIn from '@/components/FadeIn';

const cards = [
  {
    title: 'Products and Applications',
    desc: 'MagnaChip designs, develops, and manufactures a broad range of power semiconductor solutions.',
    links: ['Automotive', 'Industrial', 'AI & Communication', 'Security', 'Consumer', 'Solutions'],
    cta: { label: 'Browse Products', href: '/products' },
  },
  {
    title: 'Developer Support',
    desc: 'Technical documentation, application notes, and design resources for engineers.',
    links: ['Documentation', 'Application Notes', 'Community Forums', 'Design Tools'],
    cta: { label: 'Explore Resources', href: '#products' },
  },
  {
    title: 'World Leading Solutions',
    desc: 'A global leader in power semiconductor solutions.',
    links: ['Products and applications'],
    extraDesc:
      'Industry-leading products with endless application possibilities. Learn more about our solutions.',
    cta: { label: 'View All Solutions', href: '#products' },
  },
];

export default function SolutionsSection() {
  return (
    <section id="solutions" className="py-24 px-6 bg-black scroll-mt-20">
      <div className="max-w-[1100px] mx-auto">
        <FadeIn>
          <div className="max-w-2xl mb-14">
            <p className="text-sm font-medium tracking-[0.2em] uppercase text-white/60 mb-3">
              Solutions
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white text-balance">
              Products and Solutions
            </h2>
          </div>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <FadeIn key={card.title} delay={i * 0.08}>
              <div className="group bg-white/10 rounded-2xl border border-white/20 p-6 hover:bg-white/15 hover:border-white/40 transition-all h-full flex flex-col backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-3">{card.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-5">{card.desc}</p>

                {card.links.length > 0 && (
                  <ul className="space-y-1.5 mb-5 flex-1">
                    {card.links.map((link) => (
                      <li key={link}>
                        <a
                          href={`/${link.toLowerCase().replace(/[&\s]+/g, '-')}`}
                          className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group/link"
                        >
                          <span className="w-1 h-1 rounded-full bg-gray-600 group-hover/link:bg-white transition-colors" />
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                {card.extraDesc && (
                  <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1">
                    {card.extraDesc}
                  </p>
                )}

                {card.cta && (
                  <a
                    href={card.cta.href}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:underline underline-offset-2 mt-auto pt-3 border-t border-white/20"
                  >
                    {card.cta.label}
                    <span className="text-base leading-none">→</span>
                  </a>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
