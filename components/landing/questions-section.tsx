"use server"

import Link from "next/link"
import { Button } from "@/components/ui/button"

const questions = [
  {
    question: "Does the APS care about AI-Written pitches?",
    answer:
      "APS recruiters prioritize pitches that are clear, well-structured using the STAR format, and effectively integrate the ILS/WLS frameworks. Whether AI assists in crafting your pitch is irrelevant; what truly matters is the authenticity of your content. Our tool helps you deliver a polished, compliant pitch, ensuring your genuine experience shines through.",
  },
  {
    question: "Will this pitch sound like AI?",
    answer:
      "Absolutely not. Our advanced AI models are meticulously trained on thousands of successful, human-written pitches, guaranteeing a natural, authentic tone. Experience the difference for yourself with our free trial – you'll be amazed at how seamlessly human your pitch sounds.",
  },
  {
    question: "How is this better than traditional AI tools like ChatGPT?",
    answer:
      "Traditional AI tools like ChatGPT aren't built for the unique demands of APS pitches. They often struggle with critical elements like word count, maintaining a human voice, and integrating complex frameworks. Our platform is specifically fine-tuned for APS applications, boasting expert knowledge of APS frameworks, human-sounding language, and strict adherence to word limits.\n\nUnlike generic AI, which requires users to be experts in prompting, our platform simplifies the entire process. We guide you with a predetermined set of questions to extract precisely the information needed to craft a professional-grade pitch. This ensures your pitch is not only expertly structured but also deeply personalized and unique to your experiences.",
  },
]

export async function QuestionsSection() {
  return (
    <section className="py-16 md:py-32 bg-background">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold lg:text-5xl text-balance mb-4">
            Sounds great, but I have a few questions…
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col h-full bg-card rounded-2xl border p-8 shadow-sm">
            <h3 className="text-2xl font-semibold mb-2 text-foreground">{questions[0].question}</h3>
            <p className="text-lg text-muted-foreground whitespace-pre-line mb-0 flex-1">{questions[0].answer}</p>
          </div>
          <div className="flex flex-col h-full bg-card rounded-2xl border p-8 shadow-sm">
            <h3 className="text-2xl font-semibold mb-2 text-foreground">{questions[1].question}</h3>
            <p className="text-lg text-muted-foreground whitespace-pre-line mb-0 flex-1">{questions[1].answer}</p>
          </div>
          <div className="flex flex-col h-full bg-card rounded-2xl border p-8 shadow-sm md:col-span-2">
            <h3 className="text-2xl font-semibold mb-2 text-foreground text-center">{questions[2].question}</h3>
            <p className="text-lg text-muted-foreground whitespace-pre-line mb-0 flex-1">{questions[2].answer}</p>
          </div>
        </div>
        <div className="flex justify-center mt-12">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/sign-up">Try it for free</Link>
          </Button>
        </div>
      </div>
    </section>
  )
} 