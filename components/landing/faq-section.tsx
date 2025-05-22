/*
This client component provides the FAQ section for the landing page.
*/

"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { motion } from "framer-motion"

interface FAQItem {
  question: string
  answer: string
}

export const FAQSection = () => {
  const faqs: FAQItem[] = [
    {
      question: "Will my pitch look like everyone else's?",
      answer: "No, each pitch is uniquely generated based on your specific experiences and the role you're applying for. Our AI personalizes content to highlight your unique strengths and experiences while using APS-appropriate language and structure."
    },
    {
      question: "How does the AI know what APS panels are looking for?",
      answer: "Our AI has been trained on thousands of successful APS applications and incorporates APS recruitment guidelines, Workplace Level Standards (WLS), and Integrated Leadership System (ILS) frameworks. We've worked with former APS recruiters to ensure our system understands what makes an application successful."
    },
    {
      question: "Can I edit the pitch afterwards?",
      answer: "Absolutely. While most users find the pitches ready to submit as-is, you receive your pitch in an editable format so you can make any personal touches or adjustments you'd like before submission."
    },
    {
      question: "Will my data be private and secure?",
      answer: "Yes, we take data privacy seriously. Your information is encrypted and never shared with third parties. We do not reuse your examples for other users' applications, and all personal data is deleted after 30 days unless you choose to create an account and save your information."
    },
    {
      question: "Do I need to know APS terminology before using this?",
      answer: "No, that's exactly what our tool helps with! Our guided questions are designed to extract the information we need from you in plain language. The AI then translates your experiences into the appropriate APS terminology and framework."
    },
    {
      question: "How many pitches can I create?",
      answer: "You can create as many pitches as you need at $1 each. Many users create separate pitches for different roles or departments to maximize their chances of success. There are no subscription fees or limits."
    }
  ]

  return (
    <section className="py-24 relative overflow-hidden bg-white">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-40 left-20 w-72 h-72 rounded-full bg-purple-100 opacity-30 blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-64 h-64 rounded-full bg-[#7FE7E7]/20 blur-3xl"></div>
        
        {/* Decorative shapes */}
        <div className="absolute top-32 left-10 w-6 h-6 rounded border-2 border-gray-200 rotate-45"></div>
        <div className="absolute bottom-40 right-20 w-4 h-16 bg-[#7FE7E7]/20 rounded-full"></div>
        <div className="absolute top-1/3 right-10 w-3 h-3 bg-black/10 rounded-full"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <div className="px-4 py-2 bg-black text-white text-sm rounded-full font-medium">
              Frequently Asked Questions
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Got Questions? We Have Answers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about our service and how it can help you succeed.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="rounded-xl bg-white p-2 shadow-lg border border-gray-100"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.3 + (index * 0.1), 
                  ease: "easeOut" 
                }}
              >
                <AccordionItem value={`item-${index}`} className="border-b border-gray-200 last:border-0">
                  <AccordionTrigger className="text-left font-medium py-4 text-lg hover:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-4 pt-0 text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
        
        {/* Additional help text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.8, ease: "easeOut" }}
          className="text-center mt-10"
        >
          <p className="text-muted-foreground text-sm">
            Still have questions?{" "}
            <a href="/contact" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
              Contact our support team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
} 