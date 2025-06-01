"use client"

import { motion } from "framer-motion"
import clsx from "clsx"

interface WizardHeaderProps {
  /** The header text to display */
  header: string
  /** Whether this is the introduction section */
  isIntro?: boolean
}

/**
 * Dynamic header shown at the top of the Pitch Wizard.
 * It fades / slides on change and stays sticky at the top of the wizard viewport.
 * Responsive design with mobile-first approach.
 */
export default function WizardHeader({ header, isIntro = false }: WizardHeaderProps) {
  return (
    <motion.h2
      key={header}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center py-3 leading-tight"
    >
      {header}
    </motion.h2>
  )
} 