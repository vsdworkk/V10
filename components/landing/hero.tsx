/*
This client component provides the hero section for the landing page.
*/

"use client"

import { Button } from "@/components/ui/button"
import { motion, useAnimate, useInView } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

const AnimatedCounter = () => {
  const [count, setCount] = useState(1)
  const [scope, animate] = useAnimate()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  
  useEffect(() => {
    if (isInView) {
      // Sequence of animations with enhanced visual effects
      const startAnimation = async () => {
        // Start with 1X and a longer initial delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Animate to 2X with enhanced effects
        setCount(2)
        await animate(scope.current, 
          { 
            y: [0, -30, 0], 
            opacity: [1, 0.7, 1],
            rotateX: [0, 60, 0],
            color: ["#000000", "#3B82F6", "#000000"]
          }, 
          { duration: 0.6 }
        )
        await new Promise(resolve => setTimeout(resolve, 400))
        
        // Animate to 3X
        setCount(3)
        await animate(scope.current, 
          { 
            y: [0, -30, 0], 
            opacity: [1, 0.7, 1],
            rotateX: [0, 60, 0],
            color: ["#000000", "#8B5CF6", "#000000"]
          }, 
          { duration: 0.6 }
        )
        await new Promise(resolve => setTimeout(resolve, 400))
        
        // Animate to 4X
        setCount(4)
        await animate(scope.current, 
          { 
            y: [0, -30, 0], 
            opacity: [1, 0.7, 1],
            rotateX: [0, 60, 0],
            color: ["#000000", "#EC4899", "#000000"]
          }, 
          { duration: 0.6 }
        )
        await new Promise(resolve => setTimeout(resolve, 400))
        
        // Finally, animate to 5X with even more emphasis
        setCount(5)
        await animate(scope.current, 
          { 
            y: [0, -30, 0], 
            opacity: [1, 0.7, 1],
            rotateX: [0, 60, 0],
            scale: [1, 1.3, 1],
            color: ["#000000", "#ef4444", "#000000"]
          }, 
          { duration: 0.8 }
        )
        
        // Add a final highlight animation to emphasize the final value
        await new Promise(resolve => setTimeout(resolve, 300))
        await animate(scope.current,
          {
            textShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 0px 10px rgba(239,68,68,0.7)", "0px 0px 0px rgba(0,0,0,0)"],
            scale: [1, 1.1, 1]
          },
          { duration: 1, ease: "easeOut" }
        )
      }
      
      startAnimation()
    }
  }, [isInView, animate])

  return (
    <span 
      ref={ref} 
      className="inline-block"
    >
      <motion.span
        ref={scope}
        className="text-5xl md:text-6xl lg:text-7xl font-bold inline-block"
        style={{ transformStyle: "preserve-3d" }}
      >
        {count}x
      </motion.span>
    </span>
  )
}

export const HeroSection = () => {
  return (
    <div className="container mx-auto flex flex-col md:flex-row items-center justify-between py-16 md:py-28 px-4 md:px-8">
      {/* Left Content */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full md:w-1/2 mb-10 md:mb-0 pr-0 md:pr-8"
      >
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 tracking-tight">
          <AnimatedCounter /> your chances of landing an interview
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-lg">
          Transform your experience into a professional pitch 
          that lands interviews—no stress, no high costs.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-14">
          <Link href="#get-started">
            <Button className="bg-black hover:bg-gray-800 text-white px-8 py-6 h-auto text-lg font-medium rounded-lg">
              Get started for free
            </Button>
          </Link>
          
          <Link href="#how-it-works">
            <Button variant="outline" className="border-gray-300 hover:bg-gray-50 px-8 py-6 h-auto text-lg font-medium rounded-lg">
              See How It Works
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white font-medium border-2 border-white z-30">A</div>
            <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center text-white font-medium border-2 border-white z-20">B</div>
            <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-white font-medium border-2 border-white z-10">C</div>
          </div>
          <p className="text-sm text-gray-600">
            Join thousands of APS applicants who've boosted their chances
          </p>
        </div>
      </motion.div>
      
      {/* Right Content - Dashboard Image */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="w-full md:w-1/2"
      >
        <div className="bg-[#7FE7E7] rounded-2xl p-6 relative">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Using the hero image from public directory */}
            <div className="w-full aspect-[4/3] relative">
              <Image 
                src="/hero.png" 
                alt="Application dashboard" 
                fill 
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
