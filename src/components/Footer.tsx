'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/context';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer id="contact" className="bg-white text-gray-800 py-14 px-6 scroll-mt-20 print:hidden border-t border-gray-100">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-14">
          <div className="sm:col-span-2 md:col-span-1">
            <Link
              href="/"
              className="mb-4 flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <img src="/magnachip-white-letter-logo.png" alt="MagnaChip" className="h-8 w-auto" />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-400">{t.footer.desc}</p>
            <div className="mt-6 flex gap-3">
              <a
                href="mailto:info@magnachip.com"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5"
              >
                {t.footer.contactUs}
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-base font-semibold text-white">{t.footer.productsTitle}</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {t.footer.products.map((item, i) => (
                <li key={i}>
                  <a href="#products" className="transition-colors hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-base font-semibold text-white">{t.footer.companyTitle}</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {t.footer.company.map((item, i) => (
                <li key={i}>
                  <a href="#about" className="transition-colors hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-base font-semibold text-white">{t.footer.investorsTitle}</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {t.footer.investors.map((item, i) => (
                <li key={i}>
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-white"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <a href="/" className="transition-colors hover:text-white">
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-center text-xs text-gray-500 sm:text-left">{t.footer.copyright}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            <a href="/" className="transition-colors hover:text-white">
              {t.footer.privacy}
            </a>
            <a href="/" className="transition-colors hover:text-white">
              {t.footer.terms}
            </a>
            <a href="/" className="transition-colors hover:text-white">
              {t.footer.cookies}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
