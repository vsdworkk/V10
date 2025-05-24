/*
This client component renders the hero section for the landing page with an animated counter and CTA buttons.
*/
"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight, CirclePlay } from 'lucide-react'
import Image from 'next/image'
import { motion, useAnimate, useInView } from "framer-motion"
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

export default function HeroSection() {
    return (
        <main className="overflow-hidden">
            <section className="bg-linear-to-b to-muted from-background">
                <div className="relative py-24 md:py-32">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Left Content */}
                            <div className="max-w-xl">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                                    <AnimatedCounter /> your chances of landing an interview
                                </h1>
                                <p className="text-muted-foreground text-lg md:text-xl mb-8 leading-relaxed">
                                    Transform your experience into a professional pitch 
                                    that lands interviews—no stress, no high costs.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="bg-black hover:bg-gray-800 text-white px-6 py-3">
                                        <Link href="#get-started">
                                            <span>Get started for free</span>
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline"
                                        className="border-gray-300 hover:bg-gray-50 px-6 py-3">
                                        <Link href="#how-it-works">
                                            <CirclePlay className="mr-2 h-4 w-4 fill-primary/25 stroke-primary" />
                                            <span>See How It Works</span>
                                        </Link>
                                    </Button>
                                </div>

                                <div className="mt-10">
                                    <p className="text-muted-foreground text-sm mb-6">Trusted by teams at:</p>
                                    <div className="grid grid-cols-3 gap-6 max-w-sm">
                                        <div className="flex items-center">
                                            <img
                                                className="h-4 w-fit opacity-60 hover:opacity-100 transition-opacity"
                                                src="https://html.tailus.io/blocks/customers/column.svg"
                                                alt="Column Logo"
                                                height="16"
                                                width="auto"
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <img
                                                className="h-5 w-fit opacity-60 hover:opacity-100 transition-opacity"
                                                src="https://html.tailus.io/blocks/customers/nvidia.svg"
                                                alt="Nvidia Logo"
                                                height="20"
                                                width="auto"
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <img
                                                className="h-4 w-fit opacity-60 hover:opacity-100 transition-opacity"
                                                src="https://html.tailus.io/blocks/customers/github.svg"
                                                alt="GitHub Logo"
                                                height="16"
                                                width="auto"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Content - Image */}
                            <div className="relative">
                                <div className="perspective-1000">
                                    <div className="before:border-foreground/5 before:bg-foreground/5 relative h-full before:absolute before:-inset-x-4 before:bottom-7 before:top-0 before:skew-x-6 before:rounded-[calc(var(--radius)+1rem)] before:border">
                                        <div className="bg-background rounded-lg shadow-foreground/10 ring-foreground/5 relative h-full -translate-y-6 skew-x-6 overflow-hidden border border-transparent shadow-xl ring-1">
                                            <Image
                                                src="/Resized Screenshot.jpg"
                                                alt="Dashboard preview showing APS application interface"
                                                width="600"
                                                height="400"
                                                className="w-full h-auto object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
