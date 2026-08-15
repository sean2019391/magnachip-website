'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n/context';
import { localeLabels, locales } from '@/i18n/translations';
import { IconClose, IconSearch, IconGlobe, IconChevronRight } from '@/components/Icons';
import DropdownWrapper from '@/components/DropdownWrapper';
import MobileAccordion from '@/components/MobileAccordion';
import { productsData, applicationsData, designResourcesData, toSlug } from '@/lib/products';

type DropdownKey = 'products' | 'applications' | 'design-resources' | 'about' | null;

const aboutData: Record<string, Record<string, string[]>> = {
  Overview: {},
  'Executive Management': {},
  'Corporate Responsibility': {
    Environment: [
      'Overview',
      'Sustainability Priorities',
      'Our Approach',
      'Climate Change',
      'GHG Emissions',
      'Water Management',
      'Waste Management',
      'Sustainable Products and Services',
      'Opportunities in Clean Tech',
    ],
    Social: [
      'Overview',
      'Human Capital Management',
      'Health and Safety',
      'Inclusive Workplace',
      'Community',
      'Supply Chain Management',
    ],
    Governance: [
      'Overview',
      'Oversight Structure',
      'Board Composition and Role',
      'Risk Management',
      'Cybersecurity and Data Privacy',
    ],
    'Ethics & Compliance': [],
    'TCFD Index': [],
  },
  Newsroom: {},
};

export default function Navbar() {
  const { t, locale, setLocale } = useI18n();
  const [openMenu, setOpenMenu] = useState<DropdownKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const [productCat, setProductCat] = useState<string | null>(null);
  const [productFam, setProductFam] = useState<string | null>(null);
  const [appCat, setAppCat] = useState<string | null>(null);
  const [appSub, setAppSub] = useState<string | null>(null);
  const [aboutCat, setAboutCat] = useState<string | null>(null);
  const [aboutSub, setAboutSub] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [drCat, setDrCat] = useState<string | null>(null);

  useEffect(() => {
    if (openMenu !== 'products') {
      setProductCat(null);
      setProductFam(null);
    }
    if (openMenu !== 'applications') {
      setAppCat(null);
      setAppSub(null);
    }
    if (openMenu !== 'about') {
      setAboutCat(null);
      setAboutSub(null);
    }
    if (openMenu !== 'design-resources') {
      setDrCat(null);
    }
  }, [openMenu]);

  const toggle = (key: DropdownKey) => {
    setOpenMenu((prev) => (prev === key ? null : key));
  };

  const navLinks = [
    { key: 'products' as DropdownKey, label: t.nav.products },
    { key: 'applications' as DropdownKey, label: t.nav.applications },
    { key: 'design-resources' as DropdownKey, label: t.nav.designResources },
    { key: 'about' as DropdownKey, label: t.nav.aboutUs },
  ];

  const productCategories = Object.keys(productsData);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 print:hidden"
    >
      <nav className="max-w-[1280px] mx-auto flex items-center justify-between px-6 py-4 relative">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
        >
          <img src="/magnachip-black-letter-logo.png" alt="MagnaChip" className="h-8 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-0">
          {navLinks.map((link) => (
            <div key={link.key} className="relative">
              <button
                type="button"
                onClick={() => toggle(link.key)}
                aria-expanded={openMenu === link.key}
                aria-haspopup="true"
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-black/40 ${
                  openMenu === link.key ? 'text-black bg-black/5' : 'text-gray-700 hover:text-black'
                }`}
              >
                {link.label}
              </button>
            </div>
          ))}

          <div className="ml-2 flex items-center">
            {searchOpen ? (
              <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                <input
                  autoFocus
                  type="text"
                  placeholder={t.nav.search}
                  className="bg-transparent text-sm text-gray-900 px-3 py-2 w-48 outline-none placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="px-2 text-gray-400 hover:text-gray-700"
                >
                  <IconClose />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg text-gray-700 hover:text-black transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black/40"
                aria-label={t.nav.search}
              >
                <IconSearch />
              </button>
            )}
          </div>

          <div className="ml-2 relative" ref={langRef}>
            <button
              type="button"
              onClick={() => {
                setOpenMenu(null);
                setLangOpen(!langOpen);
              }}
              aria-expanded={langOpen}
              aria-haspopup="true"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-black hover:bg-gray-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black/40"
            >
              <IconGlobe />
              <span>{localeLabels[locale]}</span>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-[140px] z-10"
                >
                  {locales.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setLocale(loc);
                        setLangOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${locale === loc ? 'text-black bg-black/5 font-medium' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}
                    >
                      {localeLabels[loc]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a href="#contact" className="ml-2 btn-gradient !py-2 !px-5 !text-sm">
            {t.footer.contactUs}
          </a>
        </div>

        <button
          type="button"
          className="md:hidden flex flex-col gap-[5px] p-1 z-50 rounded outline-none focus-visible:ring-2 focus-visible:ring-black/40"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
          aria-expanded={mobileOpen}
        >
          <span
            className={`block w-5 h-[2px] rounded bg-gray-900 transition-all duration-300 origin-center ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`}
          />
          <span
            className={`block w-5 h-[2px] rounded bg-gray-900 transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`}
          />
          <span
            className={`block w-5 h-[2px] rounded bg-gray-900 transition-all duration-300 origin-center ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}
          />
        </button>
      </nav>

      {/* ═══════ Desktop Dropdowns ═══════ */}
      <AnimatePresence>
        {/* ── Products: Category → Family → Variant ── */}
        {openMenu === 'products' && (
          <DropdownWrapper>
            <div className="max-w-[1280px] mx-auto flex min-h-[360px]">
              {/* Col 1: Categories */}
              <div className="w-56 border-r border-gray-100 py-4 px-2 shrink-0">
                {productCategories.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => {
                      setProductCat(productCat === cat ? null : cat);
                      setProductFam(null);
                    }}
                    className={`block w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors ${
                      productCat === cat
                        ? 'bg-black/5 text-black font-medium'
                        : 'text-gray-900 hover:bg-gray-50 hover:text-black'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Col 2: Families */}
              <AnimatePresence mode="wait">
                {productCat && (
                  <motion.div
                    key={productCat}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.12 }}
                    className="w-56 py-4 px-2 shrink-0"
                  >
                    {Object.keys(productsData[productCat]).map((fam) => {
                      const hasVariants = productsData[productCat][fam].length > 0;
                      return hasVariants ? (
                        <button
                          type="button"
                          key={fam}
                          onClick={() => setProductFam(productFam === fam ? null : fam)}
                          className={`block w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${
                            productFam === fam
                              ? 'bg-black/5 text-black font-medium'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                          }`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            {fam}
                            <IconChevronRight
                              className={`w-3.5 h-3.5 text-gray-300 shrink-0 transition-transform duration-200 ${productFam === fam ? 'rotate-90' : ''}`}
                            />
                          </span>
                        </button>
                      ) : (
                        <Link
                          key={fam}
                          href={
                            fam === 'Overview' ? '/products/overview' : `/products/${toSlug(fam)}`
                          }
                          className="block w-full text-left px-4 py-2 text-sm rounded-lg transition-colors text-gray-700 hover:bg-gray-50 hover:text-black"
                          onClick={() => setOpenMenu(null)}
                        >
                          {fam}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Col 3: Variants */}
              <AnimatePresence mode="wait">
                {productCat && productFam && productsData[productCat][productFam].length > 0 && (
                  <motion.div
                    key={`${productCat}-${productFam}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.12 }}
                    className="w-56 py-4 px-2 shrink-0"
                  >
                    {productsData[productCat][productFam].map((v) => (
                      <Link
                        key={v}
                        href={
                          v === 'Overview'
                            ? `/products/${toSlug(productFam)}`
                            : `/products/${toSlug(productFam)}/${toSlug(v)}`
                        }
                        className="block w-full text-left px-4 py-2 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-black"
                        onClick={() => setOpenMenu(null)}
                      >
                        {v}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </DropdownWrapper>
        )}

        {/* ── Applications: Category → Subcategory → Detail ── */}
        {openMenu === 'applications' && (
          <DropdownWrapper>
            <div className="max-w-[1280px] mx-auto flex min-h-[360px]">
              {/* Col 1: Categories */}
              <div className="w-56 border-r border-gray-100 py-4 px-2 shrink-0">
                {Object.keys(applicationsData).map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => {
                      setAppCat(appCat === cat ? null : cat);
                      setAppSub(null);
                    }}
                    className={`block w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors ${
                      appCat === cat
                        ? 'bg-black/5 text-black font-medium'
                        : 'text-gray-900 hover:bg-gray-50 hover:text-black'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Col 2: Subcategories */}
              <AnimatePresence mode="wait">
                {appCat && (
                  <motion.div
                    key={appCat}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.12 }}
                    className="w-64 py-4 px-2 shrink-0"
                  >
                    {Object.keys(applicationsData[appCat]).map((sub) => {
                      const details = applicationsData[appCat][sub];
                      const hasDetails = details.length > 0;
                      return hasDetails ? (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => setAppSub(appSub === sub ? null : sub)}
                          className={`block w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${
                            appSub === sub
                              ? 'bg-black/5 text-black font-medium'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                          }`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            {sub}
                            <IconChevronRight
                              className={`w-3.5 h-3.5 text-gray-300 shrink-0 transition-transform duration-200 ${appSub === sub ? 'rotate-90' : ''}`}
                            />
                          </span>
                        </button>
                      ) : (
                        <Link
                          key={sub}
                          href={`/applications/${toSlug(appCat)}/${toSlug(sub)}`}
                          className="block w-full text-left px-4 py-2 text-sm rounded-lg transition-colors text-gray-700 hover:bg-gray-50 hover:text-black"
                          onClick={() => setOpenMenu(null)}
                        >
                          {sub}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Col 3: Details */}
              <AnimatePresence mode="wait">
                {appCat && appSub && applicationsData[appCat][appSub].length > 0 && (
                  <motion.div
                    key={`${appCat}-${appSub}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.12 }}
                    className="w-64 py-4 px-2 shrink-0"
                  >
                    {applicationsData[appCat][appSub].map((d) => (
                      <Link
                        key={d}
                        href={`/applications/${toSlug(appCat)}/${toSlug(appSub)}`}
                        className="block w-full text-left px-4 py-2 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-black"
                        onClick={() => setOpenMenu(null)}
                      >
                        {d}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </DropdownWrapper>
        )}

        {/* ── Design Resources: Category → Items ── */}
        {openMenu === 'design-resources' && (
          <DropdownWrapper>
            <div className="max-w-[1280px] mx-auto flex min-h-[300px]">
              {/* Col 1: Categories */}
              <div className="w-56 border-r border-gray-100 py-4 px-2 shrink-0">
                {Object.keys(designResourcesData)
                  .filter((c) => c !== 'Overview')
                  .map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setDrCat(drCat === cat ? null : cat)}
                      className={`block w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors ${
                        drCat === cat
                          ? 'bg-black/5 text-black font-medium'
                          : 'text-gray-900 hover:bg-gray-50 hover:text-black'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
              </div>

              {/* Col 2: Items */}
              <AnimatePresence mode="wait">
                {drCat && designResourcesData[drCat] && designResourcesData[drCat].length > 0 && (
                  <motion.div
                    key={drCat}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.12 }}
                    className="w-64 py-4 px-2 shrink-0"
                  >
                    {designResourcesData[drCat].map((item) => (
                      <Link
                        key={item}
                        href={`/design-resources/${toSlug(drCat)}/${toSlug(item)}`}
                        className="block w-full text-left px-4 py-2 text-sm rounded-lg transition-colors text-gray-700 hover:bg-gray-50 hover:text-black"
                        onClick={() => setOpenMenu(null)}
                      >
                        {item}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </DropdownWrapper>
        )}

        {/* ── About Us ── */}
        {openMenu === 'about' && (
          <DropdownWrapper>
            <div className="max-w-[1280px] mx-auto flex min-h-[360px]">
              <div className="w-56 border-r border-gray-100 py-4 px-2 shrink-0">
                {Object.keys(aboutData).map((cat) => {
                  const subKeys = Object.keys(aboutData[cat]);
                  const hasSubs = subKeys.length > 0;
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => {
                        if (hasSubs) {
                          setAboutCat(aboutCat === cat ? null : cat);
                          setAboutSub(null);
                        }
                      }}
                      className={`block w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors ${
                        aboutCat === cat
                          ? 'bg-black/5 text-black font-medium'
                          : 'text-gray-900 hover:bg-gray-50 hover:text-black'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {aboutCat && Object.keys(aboutData[aboutCat]).length > 0 && (
                  <motion.div
                    key={aboutCat}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.12 }}
                    className="w-64 border-r border-gray-100 py-4 px-2 shrink-0"
                  >
                    {Object.keys(aboutData[aboutCat]).map((sub) => {
                      const items = aboutData[aboutCat][sub];
                      const hasItems = items.length > 0;
                      return hasItems ? (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => setAboutSub(aboutSub === sub ? null : sub)}
                          className={`block w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${
                            aboutSub === sub
                              ? 'bg-black/5 text-black font-medium'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                          }`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            {sub}
                            <IconChevronRight
                              className={`w-3.5 h-3.5 text-gray-300 shrink-0 transition-transform duration-200 ${aboutSub === sub ? 'rotate-90' : ''}`}
                            />
                          </span>
                        </button>
                      ) : (
                        <a
                          key={sub}
                          href="#solutions"
                          className="block text-sm text-gray-700 hover:bg-gray-50 hover:text-black px-4 py-2 rounded-lg transition-colors"
                        >
                          {sub}
                        </a>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {aboutCat &&
                  aboutSub &&
                  (() => {
                    const items = aboutData[aboutCat]?.[aboutSub];
                    return (
                      items &&
                      items.length > 0 && (
                        <motion.div
                          key={aboutSub}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.12 }}
                          className="w-56 py-4 px-4 shrink-0"
                        >
                          <div className="space-y-0">
                            {items.map((item: string) => (
                              <a
                                key={item}
                                href="#solutions"
                                className="block text-sm text-gray-600 hover:text-black py-1.5 px-2 rounded-lg transition-colors"
                              >
                                {item}
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )
                    );
                  })()}
              </AnimatePresence>
            </div>
          </DropdownWrapper>
        )}
      </AnimatePresence>

      {/* ═══════ Mobile Menu ═══════ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-1">
              <MobileAccordion
                label={t.nav.products}
                expanded={mobileExpanded}
                setExpanded={setMobileExpanded}
                id="products"
              >
                {productCategories.map((cat) => (
                  <div key={cat} className="mt-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      {cat}
                    </p>
                    {Object.keys(productsData[cat]).map((fam) => {
                      const variants = productsData[cat][fam];
                      if (variants.length > 0) {
                        return (
                          <div key={fam} className="ml-2 mb-1">
                            <p className="text-sm text-gray-700 font-medium py-0.5">{fam}</p>
                            <div className="ml-3 space-y-0.5">
                              {variants.map((v) => (
                                <Link
                                  key={v}
                                  href={
                                    v === 'Overview'
                                      ? `/products/${toSlug(fam)}`
                                      : `/products/${toSlug(fam)}/${toSlug(v)}`
                                  }
                                  className="text-sm text-gray-500 hover:text-black py-0.5 block"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  {v}
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <Link
                          key={fam}
                          href={
                            fam === 'Overview' ? '/products/overview' : `/products/${toSlug(fam)}`
                          }
                          className="text-sm text-gray-600 hover:text-black py-0.5 block ml-2"
                          onClick={() => setMobileOpen(false)}
                        >
                          {fam}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </MobileAccordion>

              <MobileAccordion
                label={t.nav.applications}
                expanded={mobileExpanded}
                setExpanded={setMobileExpanded}
                id="applications"
              >
                {Object.keys(applicationsData).map((cat) => (
                  <div key={cat} className="mt-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      {cat}
                    </p>
                    {Object.keys(applicationsData[cat]).map((sub) => {
                      const details = applicationsData[cat][sub];
                      if (details.length > 0) {
                        return (
                          <div key={sub} className="ml-2 mb-1">
                            <Link
                              href={`/applications/${toSlug(cat)}/${toSlug(sub)}`}
                              className="text-sm text-gray-600 hover:text-black py-0.5 block"
                              onClick={() => setMobileOpen(false)}
                            >
                              {sub}
                            </Link>
                            <div className="ml-3 space-y-0.5">
                              {details.map((d) => (
                                <Link
                                  key={d}
                                  href={`/applications/${toSlug(cat)}/${toSlug(sub)}`}
                                  className="text-sm text-gray-500 hover:text-black py-0.5 block"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  {d}
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <Link
                          key={sub}
                          href={`/applications/${toSlug(cat)}/${toSlug(sub)}`}
                          className="text-sm text-gray-600 hover:text-black py-0.5 block ml-2"
                          onClick={() => setMobileOpen(false)}
                        >
                          {sub}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </MobileAccordion>

              <MobileAccordion
                label={t.nav.designResources}
                expanded={mobileExpanded}
                setExpanded={setMobileExpanded}
                id="design-resources"
              >
                {Object.keys(designResourcesData)
                  .filter((c) => c !== 'Overview')
                  .map((cat) => {
                    const items = designResourcesData[cat];
                    return (
                      <div key={cat} className="mt-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          {cat}
                        </p>
                        {items.length > 0 && (
                          <div className="ml-3 space-y-0.5">
                            {items.map((item) => (
                              <Link
                                key={item}
                                href={`/design-resources?q=${encodeURIComponent(item)}`}
                                className="text-sm text-gray-500 hover:text-black py-0.5 block"
                                onClick={() => setMobileOpen(false)}
                              >
                                {item}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </MobileAccordion>

              <MobileAccordion
                label={t.nav.aboutUs}
                expanded={mobileExpanded}
                setExpanded={setMobileExpanded}
                id="about"
              >
                {Object.keys(aboutData).map((cat) => {
                  const subKeys = Object.keys(aboutData[cat]);
                  return (
                    <div key={cat} className="mt-2">
                      <p className="text-sm text-gray-700 font-medium py-0.5">{cat}</p>
                      {subKeys.length > 0 && (
                        <div className="ml-3">
                          {subKeys.map((sub) => {
                            const items = aboutData[cat][sub];
                            return (
                              <div key={sub} className="py-0.5">
                                <a
                                  href="#solutions"
                                  className="text-xs text-gray-600 hover:text-black block"
                                >
                                  {sub}
                                </a>
                                {items.length > 0 && (
                                  <div className="pl-3">
                                    {items.map((v: string) => (
                                      <a
                                        key={v}
                                        href="#solutions"
                                        className="block text-xs text-gray-400 hover:text-black py-0.5"
                                      >
                                        {v}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </MobileAccordion>

              <div className="pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-2 px-2">
                  {locales.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocale(loc)}
                      aria-pressed={locale === loc}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${locale === loc ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:text-black'}`}
                    >
                      {localeLabels[loc]}
                    </button>
                  ))}
                </div>
              </div>

              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="block text-center px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 mt-3"
              >
                {t.footer.contactUs}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
