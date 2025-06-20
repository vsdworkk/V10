/*
Hero section component for the landing page with call-to-action.
*/

"use client"

import Link from "next/link"
import Image from "next/image"

import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function HeroPill() {
  return (
    <div className="bg-primary/20 ring-accent flex w-auto items-center space-x-2 whitespace-pre rounded-full px-2 py-1 ring-1">
      <div className="bg-accent text-primary w-fit rounded-full px-2 py-0.5 text-center text-xs font-medium sm:text-sm">
        🚀 New Feature
      </div>
      <p className="text-primary text-xs font-medium sm:text-sm">
        AI-Powered Pitch Generation
      </p>
      <svg
        width="12"
        height="12"
        className="ml-1"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.78141 5.33312L5.20541 1.75712L6.14808 0.814453L11.3334 5.99979L6.14808 11.1851L5.20541 10.2425L8.78141 6.66645H0.666748V5.33312H8.78141Z"
          fill="hsl(var(--primary))"
        />
      </svg>
    </div>
  )
}

function HeroTitles() {
  return (
    <div className="flex w-full max-w-2xl flex-col space-y-4 overflow-hidden pt-8">
      <h1 className="text-foreground text-center text-4xl font-medium leading-tight sm:text-5xl md:text-6xl">
        {["3X", "Your", "Interview", "Chances", "With", "The", "APS"].map(
          (text, index) => (
            <span
              key={index}
              className="inline-block text-balance px-1 font-semibold md:px-2"
            >
              {text}
            </span>
          )
        )}
      </h1>
      <p className="text-muted-foreground mx-auto max-w-xl text-balance text-center text-lg leading-7 sm:text-xl sm:leading-9">
        Personalised APS Statements of Claims Written by AI
      </p>
    </div>
  )
}

function HeroCTA() {
  return (
    <>
      <div className="mx-auto mt-6 flex w-full max-w-2xl flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Link
          href="/signup"
          className={cn(
            buttonVariants({ variant: "default" }),
            "text-background flex w-full gap-2 sm:w-auto"
          )}
        >
          <Icons.logo className="size-6" />
          Get Started For Free
        </Link>
      </div>
      <p className="text-muted-foreground mt-5 text-sm">
        No credit card required
      </p>
    </>
  )
}

function HeroImage() {
  return (
    <div className="relative mx-auto flex w-full items-center justify-center">
      <Image
        src="/hero-placeholder-image.png"
        alt="APSPitchPro Dashboard"
        width={1920}
        height={1080}
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        className="mt-16 max-w-screen-lg rounded-lg border shadow-lg"
      />
    </div>
  )
}

export function HeroSection() {
  return (
    <section id="hero">
      <div className="relative flex w-full flex-col items-center justify-start px-4 pt-32 sm:px-6 sm:pt-24 md:pt-32 lg:px-8">
        <HeroPill />
        <HeroTitles />
        <HeroCTA />
        <HeroImage />
        <div className="from-background via-background pointer-events-none absolute inset-x-0 -bottom-12 h-1/3 bg-gradient-to-t to-transparent lg:h-1/4"></div>
      </div>
    </section>
  )
}
