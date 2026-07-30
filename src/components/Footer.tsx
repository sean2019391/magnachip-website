'use client'

import Link from 'next/link'
import { useI18n } from '@/i18n/context'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer id="contact" className="bg-[#0a0a0a] text-white py-20 px-6 scroll-mt-20">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-14">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <img src="/magnachip-white-letter-logo.png" alt="MagnaChip" className="h-8 w-auto" />
            </Link>
            <p className="text-gray-500 text-sm mt-3 mb-6 leading-relaxed max-w-xs">{t.footer.desc}</p>
            <div className="flex gap-3">
              <a
                href="mailto:info@magnachip.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-white/20 text-white hover:bg-white hover:border-white transition-colors"
              >
                {t.footer.contactUs}
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-base font-semibold mb-4">{t.footer.productsTitle}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {t.footer.products.map((item, i) => (
                <li key={i}><a href="#products" className="hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-base font-semibold mb-4">{t.footer.companyTitle}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {t.footer.company.map((item, i) => (
                <li key={i}><a href="#about" className="hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Investors */}
          <div>
            <h4 className="text-base font-semibold mb-4">{t.footer.investorsTitle}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {t.footer.investors.map((item, i) => (
                <li key={i}>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{item.label}</a>
                  ) : (
                    <a href="#" className="hover:text-white transition-colors">{item.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600 text-center sm:text-left">{t.footer.copyright}</p>
          <div className="flex gap-4 text-xs text-gray-600">
            <a href="#" className="hover:text-white transition-colors">{t.footer.privacy}</a>
            <a href="#" className="hover:text-white transition-colors">{t.footer.terms}</a>
            <a href="#" className="hover:text-white transition-colors">{t.footer.cookies}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
