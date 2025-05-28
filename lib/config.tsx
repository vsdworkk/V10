/*
Site configuration for APSPitchPro - AI-Powered Pitch Generation SaaS
*/

import { Icons } from "@/components/icons"

export const BLUR_FADE_DELAY = 0.15

export const siteConfig = {
  name: "APSPitchPro",
  description: "3X Your Interview Chances With AI-Powered Pitches",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: ["AI", "Pitch Generation", "Interview", "Career", "Job Search", "Resume"],
  links: {
    email: "support@apspitchpro.com",
    twitter: "https://twitter.com/apspitchpro",
    github: "https://github.com/apspitchpro",
    linkedin: "https://linkedin.com/company/apspitchpro",
  },
  header: [
    {
      trigger: "Features",
      content: {
        main: {
          icon: <Icons.logo className="h-6 w-6" />,
          title: "AI-Powered Pitch Generation",
          description: "Transform your experience into interview-winning pitches with AI.",
          href: "/features",
        },
        items: [
          {
            href: "/features#ai-generation",
            title: "Smart Pitch Creation",
            description: "AI analyzes your experience and creates compelling pitches.",
          },
          {
            href: "/features#templates",
            title: "Industry Templates",
            description: "Pre-built templates for different industries and roles.",
          },
          {
            href: "/features#optimization",
            title: "Pitch Optimization",
            description: "Continuous improvement based on feedback and results.",
          },
        ],
      },
    },
    {
      trigger: "Solutions",
      content: {
        items: [
          {
            title: "Job Seekers",
            href: "/solutions/job-seekers",
            description: "Perfect your elevator pitch for interviews and networking.",
          },
          {
            title: "Career Changers",
            href: "/solutions/career-change",
            description: "Craft compelling narratives for career transitions.",
          },
          {
            title: "Recent Graduates",
            href: "/solutions/graduates",
            description: "Turn academic experience into professional pitches.",
          },
          {
            title: "Executives",
            href: "/solutions/executives",
            description: "Executive-level pitches for board meetings and presentations.",
          },
          {
            title: "Entrepreneurs",
            href: "/solutions/entrepreneurs",
            description: "Investor pitches and startup presentations.",
          },
          {
            title: "Sales Teams",
            href: "/solutions/sales",
            description: "Sales pitches that convert prospects into customers.",
          },
        ],
      },
    },
    {
      href: "/pricing",
      label: "Pricing",
    },
    {
      href: "/contact",
      label: "Contact",
    },
  ],
}

export type SiteConfig = typeof siteConfig 