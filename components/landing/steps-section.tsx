/*
Steps section component showing how the product works in 3 steps.
*/

"use server"

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export async function StepsSection() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold lg:text-5xl text-balance mb-4">
                        How It Works
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        3 Steps to a Ready-to-Submit APS Pitch
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Step 1 */}
                    <Card className="overflow-hidden p-6 relative bg-background/50 border-muted">
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                            1
                        </div>
                        <h3 className="text-foreground text-xl font-semibold mb-3 mt-8">Answer a Few Smart Prompts</h3>
                        <p className="text-muted-foreground text-balance leading-relaxed">
                            Open your dashboard and hit <span className="font-medium text-foreground">Create Pitch</span>. The wizard asks laser-focused questions about the role, your experience, and key achievements (copy-and-paste your résumé—done).
                        </p>
                    </Card>

                    {/* Step 2 */}
                    <Card className="overflow-hidden p-6 relative bg-background/50 border-muted">
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                            2
                        </div>
                        <h3 className="text-foreground text-xl font-semibold mb-3 mt-8">Let the AI Alignment Engine Work</h3>
                        <p className="text-muted-foreground text-balance leading-relaxed">
                            Behind the scenes, APSPitchPro <span className="font-medium text-foreground">cross-references</span> your answers with ILS, WLS, APS Values and STAR structure—then writes a pitch that speaks your hiring manager's language.
                        </p>
                    </Card>

                    {/* Step 3 */}
                    <Card className="overflow-hidden p-6 relative bg-background/50 border-muted">
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                            3
                        </div>
                        <h3 className="text-foreground text-xl font-semibold mb-3 mt-8">Download & Submit with Confidence</h3>
                        <p className="text-muted-foreground text-balance leading-relaxed">
                            Click <span className="font-medium text-foreground">Generate</span> and receive a formatted Word or PDF pitch, criterion-checked and ready to attach to your application.
                        </p>
                    </Card>
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                        <Link href="/sign-up" className="inline-flex items-center gap-2">
                            <span>Get Started for Free</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}