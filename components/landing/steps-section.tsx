/*
Steps section component showing how the product works in 3 steps.
*/

"use client";

import Features from "@/components/features-vertical";
import Section from "@/components/utilities/section";
import { MessageSquare, Zap, Download } from "lucide-react";

const data = [
  {
    id: 1,
    title: "1. Answer Smart Prompts",
    content:
      "Open your dashboard and hit Create Pitch. The wizard asks laser-focused questions about the role, your experience, and key achievements. Copy-and-paste your résumé—done.",
    image: "/step2.png",
    icon: <MessageSquare className="w-6 h-6 text-primary" />,
  },
  {
    id: 2,
    title: "2. AI Alignment Engine Works",
    content:
      "Behind the scenes, APSPitchPro cross-references your answers with ILS, WLS, APS Values and STAR structure—then writes a pitch that speaks your hiring manager's language.",
    image: "/dashboard.png",
    icon: <Zap className="w-6 h-6 text-primary" />,
  },
  {
    id: 3,
    title: "3. Download & Submit with Confidence",
    content:
      "Click Generate and receive a formatted Word or PDF pitch, criterion-checked and ready to attach to your application. Submit with confidence knowing it's professionally crafted.",
    image: "/dashboard.png",
    icon: <Download className="w-6 h-6 text-primary" />,
  },
];

export function StepsSection() {
  return (
    <Section 
      title="How it works" 
      subtitle="Just 3 steps to get started"
      description="From experience to interview-winning pitch in minutes, not hours."
    >
      <Features data={data} />
    </Section>
  );
}