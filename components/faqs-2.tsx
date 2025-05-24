'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

export default function FAQsTwo() {
    const faqItems = [
        {
            id: 'item-1',
            question: "Will my pitch look like everyone else's?",
            answer: "No, each pitch is uniquely generated based on your specific experiences and the role you're applying for. Our AI personalizes content to highlight your unique strengths and experiences while using APS-appropriate language and structure."
        },
        {
            id: 'item-2',
            question: "How does the AI know what APS panels are looking for?",
            answer: "Our AI has been trained on thousands of successful APS applications and incorporates APS recruitment guidelines, Workplace Level Standards (WLS), and Integrated Leadership System (ILS) frameworks. We've worked with former APS recruiters to ensure our system understands what makes an application successful."
        },
        {
            id: 'item-3',
            question: "Can I edit the pitch afterwards?",
            answer: "Absolutely. While most users find the pitches ready to submit as-is, you receive your pitch in an editable format so you can make any personal touches or adjustments you'd like before submission."
        },
        {
            id: 'item-4',
            question: "Will my data be private and secure?",
            answer: "Yes, we take data privacy seriously. Your information is encrypted and never shared with third parties. We do not reuse your examples for other users' applications, and all personal data is deleted after 30 days unless you choose to create an account and save your information."
        },
        {
            id: 'item-5',
            question: "Do I need to know APS terminology before using this?",
            answer: "No, that's exactly what our tool helps with! Our guided questions are designed to extract the information we need from you in plain language. The AI then translates your experiences into the appropriate APS terminology and framework."
        },
        {
            id: 'item-6',
            question: "How many pitches can I create?",
            answer: "You can create as many pitches as you need with our flexible pricing. Many users create separate pitches for different roles or departments to maximize their chances of success. There are no subscription fees or limits."
        }
    ]

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-4xl px-4 md:px-6">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-balance text-4xl font-bold md:text-5xl lg:text-5xl">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground mt-4 text-balance text-xl">
                        Everything you need to know about our service and how it can help you succeed.
                    </p>
                </div>

                <div className="mx-auto max-w-3xl">
                    <Accordion
                        type="single"
                        collapsible
                        className="w-full rounded-xl bg-white p-2 shadow-lg border border-gray-100">
                        {faqItems.map((item, index) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border-b border-gray-200 last:border-0">
                                <AccordionTrigger className="text-left font-medium py-4 text-lg hover:text-primary transition-colors hover:no-underline">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 pb-4 pt-0 text-base">
                                    <p>{item.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <div className="text-center mt-10">
                        <p className="text-muted-foreground text-sm">
                            Still have questions?{" "}
                            <Link
                                href="/contact"
                                className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
                                Contact our support team
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
