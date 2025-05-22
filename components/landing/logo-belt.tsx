/*
This client component provides the logo belt section for the landing page.
*/

"use client"

import { motion } from "framer-motion"

export const LogoBeltSection = () => {
  // Array of logo placeholders with different sizes to mimic varied logos
  const logoPlaceholders = [
    { size: "h-4 w-12", delay: 0.2 },
    { size: "h-5 w-16", delay: 0.3 },
    { size: "h-4 w-14", delay: 0.4 },
    { size: "h-5 w-20", delay: 0.5 },
    { size: "h-4 w-12", delay: 0.6 }
  ]

  return (
    <div className="border-t border-gray-100">
      <div className="container mx-auto py-8 md:py-10 px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-gray-500 font-medium text-base md:text-lg whitespace-nowrap"
          >
            Trusted by Employees at
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-start md:justify-between w-full gap-6 md:gap-10"
          >
            {/* Placeholder logos - using different sized rounded rectangles to better mimic logos */}
            {logoPlaceholders.map((logo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: logo.delay, ease: "easeOut" }}
                className={`${logo.size} bg-gray-200 rounded-md`}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
} 