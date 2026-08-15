'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { IconChevronDown } from '@/components/Icons';

export default function MobileAccordion({
  label,
  expanded,
  setExpanded,
  id,
  children,
}: {
  label: string;
  expanded: string | null;
  setExpanded: (v: string | null) => void;
  id: string;
  children: React.ReactNode;
}) {
  const isOpen = expanded === id;
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setExpanded(isOpen ? null : id)}
        aria-expanded={isOpen}
        className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-900 hover:text-black outline-none focus-visible:text-black"
      >
        <span>{label}</span>
        <IconChevronDown
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-3 pl-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
