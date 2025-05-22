/*
This client component provides the steps section for the landing page.
*/

"use client"

import { motion } from "framer-motion"
import { FileText, Sparkles, Download } from "lucide-react"

// Step item component with number, icon, title and description
const StepItem = ({
  number,
  icon,
  title,
  description,
  delay
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className="relative flex flex-col items-center text-center px-4 py-6"
    >
      {/* Background decorations with slight rotation for a playful look */}
      <div className="absolute inset-0 bg-white/70 rounded-2xl transform -rotate-2 shadow-sm" />
      <div className="absolute inset-0 bg-white/80 rounded-2xl transform rotate-1 shadow-sm" />
      
      {/* Content container */}
      <div className="relative z-10 bg-white rounded-2xl shadow-md px-6 py-8 h-full w-full flex flex-col">
        {/* Step number with animated border */}
        <motion.div 
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-black text-white font-bold text-xl mb-6 mx-auto"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute -inset-1 rounded-full border-2 border-dashed border-gray-200 animate-spin-slow"></div>
          {number}
        </motion.div>
        
        {/* Icon with subtle hover animation */}
        <motion.div 
          className="text-black mb-5 flex justify-center"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {icon}
        </motion.div>
        
        {/* Title */}
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        
        {/* Description */}
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

export const StepsSection = () => {
  const steps = [
    {
      number: 1,
      icon: <FileText size={32} />,
      title: "Share Your Experience",
      description: "Answer straightforward questions about the role you're targeting and your experience."
    },
    {
      number: 2,
      icon: <Sparkles size={32} />,
      title: "Let Our AI Do the Work",
      description: "Our intelligent workflow instantly creates a polished pitch—precisely aligned with APS selection criteria, APS values, and structured in the STAR format."
    },
    {
      number: 3,
      icon: <Download size={32} />,
      title: "Download & Submit with Confidence",
      description: "Instantly download your professionally tailored APS pitch, fully prepared and ready to submit—no further edits necessary."
    }
  ]

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-40 -left-32 w-64 h-64 rounded-full bg-[#7FE7E7] opacity-20 blur-3xl"></div>
        <div className="absolute bottom-40 -right-32 w-64 h-64 rounded-full bg-blue-300 opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-200 opacity-10 blur-3xl"></div>
        
        {/* Decorative dots pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute left-10 top-20 w-2 h-2 rounded-full bg-black"></div>
          <div className="absolute right-40 top-40 w-3 h-3 rounded-full bg-black"></div>
          <div className="absolute left-1/4 bottom-20 w-2 h-2 rounded-full bg-black"></div>
          <div className="absolute right-1/4 bottom-40 w-4 h-4 rounded-full bg-black"></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Section heading with animated underline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Your Pitch in Three Easy Steps
          </h2>
          <motion.div 
            className="w-24 h-1 bg-black mx-auto"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          ></motion.div>
        </motion.div>
        
        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <StepItem
              key={index}
              number={step.number}
              icon={step.icon}
              title={step.title}
              description={step.description}
              delay={0.2 + (index * 0.15)}
            />
          ))}
        </div>
        
        {/* Connecting lines between steps (visible on desktop) with animated dashes */}
        <div className="hidden md:block absolute top-1/2 left-1/3 w-1/6 h-0.5 z-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent" style={{ backgroundSize: '10px 2px', backgroundImage: 'linear-gradient(to right, transparent 50%, currentColor 50%)' }}></div>
        <div className="hidden md:block absolute top-1/2 right-1/3 w-1/6 h-0.5 z-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent" style={{ backgroundSize: '10px 2px', backgroundImage: 'linear-gradient(to right, transparent 50%, currentColor 50%)' }}></div>
      </div>
      
      {/* Add CSS animation */}
      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}</style>
    </section>
  )
} 