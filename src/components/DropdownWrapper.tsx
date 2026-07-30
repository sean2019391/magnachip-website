'use client'

import { motion } from 'framer-motion'

export default function DropdownWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className="absolute left-0 w-full bg-white border-b border-gray-200 shadow-lg z-40"
    >
      {children}
    </motion.div>
  )
}
