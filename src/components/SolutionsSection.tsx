'use client';

import FadeIn from '@/components/FadeIn';

const cards = [
  {
    title: 'Products and Applications',
    desc: 'Power semiconductors engineered for automotive, industrial, AI infrastructure, and connected devices.',
    links: ['Automotive', 'Industrial', 'AI & Communication', 'Security', 'Consumer', 'Solutions'],
    cta: { label: 'Browse Products', href: '/products' },
  },
  {
    title: 'Developer Support',
    desc: 'Application notes, design references, and technical resources built to accelerate product validation.',
    links: ['Documentation', 'Application Notes', 'Community Forums', 'Design Tools'],
    cta: { label: 'Explore Resources', href: '/design-resources' },
  },
  {
    title: 'World Leading Solutions',
    desc: 'A global power platform combining efficiency, reliability, and scale for tomorrow’s electronic systems.',
    links: ['Power Management', 'SiC Innovation', 'High-efficiency Design'],
    extraDesc:
      'Industry-leading products with endless application possibilities. Learn more about our end-to-end solutions.',
    cta: { label: 'View All Solutions', href: '#products' },
  },
];

export default function SolutionsSection() {
  return (
    <section id="solutions" className="py-24 px-6 bg-[#0b0d10] scroll-mt-20">
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
              <div className="group h-full flex flex-col rounded-[28px] border border-white/15 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/10">
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white ring-1 ring-white/10">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-5">{card.desc}</p>

                {card.links.length > 0 && (
                  <ul className="space-y-2.5 mb-5 flex-1">
                    {card.links.map((link) => (
                      <li key={link}>
                        <a
                          href={`/${link.toLowerCase().replace(/[&\s]+/g, '-')}`}
                          className="group/link flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-white/60 transition-colors group-hover/link:bg-white" />
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                {card.extraDesc && (
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-300">{card.extraDesc}</p>
                )}

                {card.cta && (
                  <a
                    href={card.cta.href}
                    className="mt-auto inline-flex items-center gap-2 border-t border-white/10 pt-4 text-sm font-medium text-white transition-opacity hover:opacity-80"
                  >
                    {card.cta.label}
                    <span aria-hidden="true">→</span>
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
