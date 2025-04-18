"use client"

import { motion } from "framer-motion"

interface WizardHeaderProps {
  /** The header text to display */
  header: string
}

/**
 * Dynamic header shown at the top of the Pitch Wizard.
 * It fades / slides on change and stays sticky at the top of the wizard viewport.
 */
export default function WizardHeader({ header }: WizardHeaderProps) {
  return (
    <motion.h2
      key={header}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="text-xl sm:text-2xl font-semibold text-center py-3"
    >
      {header}
    </motion.h2>
  )
} 