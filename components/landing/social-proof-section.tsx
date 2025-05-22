/*
This client component provides the social proof section for the landing page.
*/

"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import Image from "next/image"

// Testimonial component
const Testimonial = ({
  quote,
  author,
  role,
  stars,
  index
}: {
  quote: string;
  author: string;
  role: string;
  stars: number;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: 0.1 + (index * 0.1), ease: "easeOut" }}
      whileHover={{ y: -5, boxShadow: "0 10px 30px -15px rgba(0,0,0,0.1)" }}
      className="bg-white rounded-2xl shadow-md p-6 md:p-8 relative"
    >
      {/* Background decoration */}
      <div className="absolute -bottom-2 -right-2 w-32 h-32 bg-[#7FE7E7]/10 rounded-br-2xl rounded-tl-3xl z-0"></div>
      
      {/* Quote mark decoration */}
      <div className="absolute -top-6 -left-2 text-black/5">
        <Quote size={80} />
      </div>
      
      {/* Stars */}
      <div className="flex mb-4 relative z-10">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 0.3, 
              delay: 0.2 + (index * 0.1) + (i * 0.05), 
              ease: "easeOut" 
            }}
          >
            <Star
              size={18}
              className={`${
                i < stars ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
              }`}
            />
          </motion.div>
        ))}
      </div>
      
      {/* Quote */}
      <p className="text-gray-700 mb-6 relative z-10">{quote}</p>
      
      {/* Author info */}
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-600 mr-4">
          {author.charAt(0)}
        </div>
        <div>
          <div className="font-semibold">{author}</div>
          <div className="text-gray-500 text-sm">{role}</div>
        </div>
      </div>
    </motion.div>
  )
}

// Stat item component
const StatItem = ({
  value,
  label,
  delay
}: {
  value: string;
  label: string;
  delay: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="px-8 relative"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: delay + 0.1, ease: "easeOut" }}
        className="text-4xl md:text-5xl font-bold mb-2"
      >
        {value}
      </motion.div>
      <div className="text-gray-600">{label}</div>
      <div className="absolute -top-4 -left-2 w-12 h-12 bg-[#7FE7E7]/10 rounded-full -z-10"></div>
    </motion.div>
  )
}

export const SocialProofSection = () => {
  // Testimonial data
  const testimonials = [
    {
      quote: "This platform completely transformed my APS application. I went from 0 interviews to 3 in just one month!",
      author: "Sarah J.",
      role: "Policy Advisor",
      stars: 5
    },
    {
      quote: "The STAR structure made my experience shine in ways I couldn't have done myself. Landed my dream role at Services Australia.",
      author: "Michael T.",
      role: "Program Manager",
      stars: 5
    },
    {
      quote: "After trying for 2 years to get into the APS, this tool helped me align my experience perfectly with the selection criteria.",
      author: "Jessica L.",
      role: "Communications Officer",
      stars: 4
    }
  ]

  // Stats data
  const stats = [
    { value: "96%", label: "Interview Success Rate", delay: 0.2 },
    { value: "5,000+", label: "Successful Applications", delay: 0.3 },
    { value: "4.9/5", label: "User Satisfaction", delay: 0.4 }
  ]

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-20 right-20 w-72 h-72 rounded-full bg-[#7FE7E7]/20 blur-3xl"></div>
        <div className="absolute bottom-40 left-10 w-64 h-64 rounded-full bg-purple-100 opacity-30 blur-3xl"></div>
        
        {/* Decorative shapes */}
        <div className="absolute top-32 left-10 w-6 h-6 rounded border-2 border-gray-200 rotate-45"></div>
        <div className="absolute bottom-40 right-20 w-4 h-16 bg-[#7FE7E7]/20 rounded-full"></div>
        <div className="absolute top-1/3 right-10 w-3 h-3 bg-black/10 rounded-full"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6"
          >
            <div className="flex justify-center mb-6">
              <div className="px-4 py-2 bg-black text-white text-sm rounded-full font-medium">
                What Our Users Say
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Success Stories
            </h2>
          </motion.div>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join hundreds of professionals who have transformed their applications and landed their dream APS roles.
          </p>
        </motion.div>
        
        {/* Overall stats */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-20 text-center">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              value={stat.value}
              label={stat.label}
              delay={stat.delay}
            />
          ))}
        </div>
        
        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              stars={testimonial.stars}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
} 