/*
Renders the FAQ accordion section using shadcn/ui components.
*/

"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"

const items = [
  {
    id: "item-1",
    question: "Will my pitch look like everyone else's?",
    answer:
      "No, each pitch is uniquely generated based on your specific experiences and the role you're applying for. Our AI personalizes content to highlight your unique strengths and experiences while using APS-appropriate language and structure."
  },
  {
    id: "item-2",
    question: "How does the AI know what APS panels are looking for?",
    answer:
      "Our AI has been trained on thousands of successful APS applications and incorporates APS recruitment guidelines, Workplace Level Standards (WLS), and Integrated Leadership System (ILS) frameworks. We've worked with former APS recruiters to ensure our system understands what makes an application successful."
  },
  {
    id: "item-3",
    question: "Can I edit the pitch afterwards?",
    answer:
      "Absolutely. While most users find the pitches ready to submit as-is, you receive your pitch in an editable format so you can make any personal touches or adjustments you'd like before submission."
  },
  {
    id: "item-4",
    question: "Will my data be private and secure?",
    answer:
      "Yes, we take data privacy seriously. Your information is encrypted and never shared with third parties. We do not reuse your examples for other users' applications, and all personal data is deleted after 30 days unless you choose to create an account and save your information."
  },
  {
    id: "item-5",
    question: "Do I need to know APS terminology before using this?",
    answer:
      "No, that's exactly what our tool helps with! Our guided questions are designed to extract the information we need from you in plain language. The AI then translates your experiences into the appropriate APS terminology and framework."
  },
  {
    id: "item-6",
    question: "How many pitches can I create?",
    answer:
      "You can create as many pitches as you need with our flexible pricing. Many users create separate pitches for different roles or departments to maximize their chances of success. There are no subscription fees or limits."
  }
]

export default function FAQ() {
  return (
    <section id="faq" className="pb-16">
      <div className="mx-auto max-w-[800px]">
        <Accordion type="single" collapsible className="w-full">
          {items.map(item => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border-b border-[#E5E7EB]"
            >
              <AccordionTrigger className="py-4 text-left font-medium transition-transform duration-150 [&[data-state=open]>svg]:rotate-180">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 pt-0 text-sm">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
