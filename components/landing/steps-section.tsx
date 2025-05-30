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
    title: "1. Complete Guided Questions",
    content:
      "Sign up, open your dashboard, and hit create pitch. The wizard asks super simple questions to gather information about your experience ~ 10 minutes.",
    image: "/First-step-image.png",
    icon: <MessageSquare className="w-6 h-6 text-primary" />,
  },
  {
    id: 2,
    title: "2. AI Crafts Your Personalised Pitch",
    content:
      "Our specialised APS-focused AI takes your unique information, aligns it precisely with relevant APS frameworks, addresses key selection criteria using the STAR structure, and crafts a personalised pitch that resonates with APS recruiters.",
    image: "/Second-step-image.png",
    icon: <Zap className="w-6 h-6 text-primary" />,
  },
  {
    id: 3,
    title: "3. Download & Submit",
    content:
      "Export your ready to submit pitch in pdf/doc and submit. Done.",
    image: "/Third-step-image.png",
    icon: <Download className="w-6 h-6 text-primary" />,
  },
];

export function StepsSection() {
  return (
    <Section 
      title="How it works" 
      subtitle="Three steps to get ahead"
      description="From experience to interview-winning pitch in minutes, not hours."
    >
      <Features data={data} />
    </Section>
  );
}