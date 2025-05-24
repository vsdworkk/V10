"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

const logos = [
  "/logos/logo1.svg",
  "/logos/logo2.svg",
  "/logos/logo3.svg",
  "/logos/logo4.svg",
  "/logos/logo5.svg"
]

export default function Hero() {
  return (
    <section className="bg-[var(--color-bg)] pt-24 pb-16">
      <div className="mx-auto max-w-[1280px] grid grid-cols-12 gap-8 px-4 items-center">
        <div className="col-span-12 md:col-span-7 flex flex-col gap-4 order-2 md:order-1">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="font-bold leading-tight text-[color:var(--color-text)] text-[clamp(3rem,5vw,4.5rem)] max-w-[32ch]"
          >
            5× Your Chances of Landing an Interview
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="text-lg text-[color:var(--color-subtle)] max-w-[60%]"
          >
            Transform your experience into a professional pitch that lands interviews—no stress, no high costs.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="mt-4 flex gap-2"
          >
            <Button className="h-12 px-6 font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]">
              Get Started Free
            </Button>
            <Button variant="ghost" className="h-12 px-6 border border-[var(--color-primary)] text-[color:var(--color-primary)]">
              Learn More
            </Button>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.25 }}
          className="col-span-12 md:col-span-5 order-1 md:order-2"
        >
          <div className="aspect-[16/10] rounded-[1rem] shadow-[var(--shadow-card)] overflow-hidden">
            <Image
              src="/hd-image-for-hero.png"
              alt="App screenshot"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </motion.div>
      </div>
      <div className="mt-12 border-t pt-6">
        <div className="mx-auto max-w-[1280px] overflow-x-auto">
          <ul className="flex gap-14 items-center whitespace-nowrap [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
            {logos.map((src) => (
              <li key={src} className="shrink-0">
                <Image src={src} alt="logo" height={36} width={100} className="h-9 w-auto grayscale" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
