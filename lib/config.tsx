/**
 * @file lib/config.tsx
 * @description
 * Site-wide configuration for APSPitchPro. Centralizes marketing navigation,
 * pricing, FAQs, and basic site metadata. The header items power the top
 * navigation via components/menu.tsx which reads `siteConfig.header`.
 *
 * Change in this step:
 * - Added a new public navigation link `{ href: "/job-picks", label: "APS Job Picks" }`
 *   to expose the SEO-friendly public page implemented in Step 7.
 *
 * Notes:
 * - Menu expects simple link items to follow the `{ href, label }` shape.
 * - Keep this file free of runtime secrets. Only NEXT_PUBLIC_* vars may appear here.
 */

import type React from "react"
import { Icons } from "@/components/icons"

export const BLUR_FADE_DELAY = 0.15

// Navigation types
interface NavigationLink {
  href: string
  label: string
}
interface NavigationDropdown {
  trigger: string
  content: {
    main?: {
      icon: React.ReactNode
      title: string
      description: string
      href: string
    }
    items: Array<{
      href: string
      title: string
      description: string
    }>
  }
}
type NavigationItem = NavigationLink | NavigationDropdown

export const siteConfig = {
  name: "APSPitchPro",
  description: "3X Your Interview Chances With AI-Powered Pitches",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: [
    "AI",
    "Pitch Generation",
    "Interview",
    "Career",
    "Job Search",
    "Resume"
  ],
  links: {
    email: "support@apspitchpro.com",
    twitter: "https://twitter.com/apspitchpro",
    github: "https://github.com/apspitchpro",
    linkedin: "https://linkedin.com/company/apspitchpro"
  },
  header: [
    {
      href: "/#the-solution",
      label: "Features"
    },
    // Added in Step 8: public marketing page for curated APS roles
    {
      href: "/job-picks",
      label: "APS Job Picks"
    },
    {
      href: "/#pricing",
      label: "Pricing"
    },
    {
      href: "/#faq",
      label: "FAQ"
    }
  ] as NavigationItem[],
  pricing: [
    {
      name: "STARTER",
      href: "#",
      price: "$0",
      period: "month",
      yearlyPrice: "$0",
      features: [
        "3 AI-Generated Pitches",
        "Basic Templates",
        "Email Support",
        "Standard Analytics",
        "Community Access"
      ],
      description: "Perfect for getting started with AI-powered pitches",
      buttonText: "Get Started Free",
      isPopular: false
    },
    {
      name: "PRO",
      href: `${process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_SINGLEPITCH || "#"}`,
      price: "$19",
      period: "month",
      yearlyPrice: "$15",
      features: [
        "Unlimited AI Pitches",
        "Premium Templates",
        "Priority Support",
        "Advanced Analytics",
        "Interview Coaching Tips",
        "Industry-Specific Content",
        "Pitch Performance Tracking"
      ],
      description: "Ideal for active job seekers and professionals",
      buttonText: "Start Pro Trial",
      isPopular: true
    },
    {
      name: "ENTERPRISE",
      href: `${process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PROBUNDLE || "#"}`,
      price: "$49",
      period: "month",
      yearlyPrice: "$39",
      features: [
        "Everything in Pro",
        "Team Collaboration",
        "Custom Branding",
        "API Access",
        "Dedicated Support",
        "Custom Integrations",
        "Advanced Reporting",
        "White-label Solutions"
      ],
      description: "For teams and organizations at scale",
      buttonText: "Contact Sales",
      isPopular: false
    }
  ],
  faqs: [
    {
      question: "Will my pitch sound human?",
      answer: (
        <span>
          Yes, definitely. Our AI has been designed with feedback from human
          recruiters, so it picks up on natural language patterns and authentic
          tone. The pitches don't come across as robotic or templated - they
          sound like something you'd actually write yourself. Get started for
          free and see what you think - most people are surprised by how natural
          it feels.
        </span>
      )
    },
    {
      question: "What makes this better than ChatGPT?",
      answer: (
        <span>
          AI tools like ChatGPT, Gemini, and Claude weren't built for APS pitch
          writing. They tend to miss important stuff like staying within word
          limits, sounding natural, properly using APS frameworks, and
          addressing the selection criteria. We built our platform specifically
          for APS applications - it knows the frameworks inside out, writes in a
          way that sounds human, sticks to those strict word counts and
          frameworks, and makes sure your pitch directly addresses all the
          selection criteria.
        </span>
      )
    },
    {
      question: "Can I edit the final written pitch?",
      answer: (
        <span>
          Yes, before saving the final written pitch, you have the opportunity
          to edit it inside our platform.
        </span>
      )
    },
    {
      question: "How many pitches can I get written?",
      answer: (
        <span>
          You can get started for free with one pitch. After that, we have
          different pricing options depending on what you need, and you can buy
          additional credits whenever you want more pitches.
        </span>
      )
    },
    {
      question: "Does this work for all APS roles and levels?",
      answer: (
        <span>
          Yes, absolutely. It works for any APS role, whether you're applying
          for marketing, data, policy, or anything else. We currently support
          levels from APS1 to EL1, with EL2 coming soon.
        </span>
      )
    }
  ]
}

export type SiteConfig = typeof siteConfig
