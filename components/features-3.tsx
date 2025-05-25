/*
This client component showcases key features using card layouts.
*/
"use client"

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Settings2, Sparkles, Zap, Target, Shield, FileText } from 'lucide-react'
import { ReactNode } from 'react'

export default function Features() {
    return (
        <section className="bg-white py-16 md:py-32">
            <div className="@container mx-auto max-w-6xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">5X Your Chances of Landing an Interview</h2>
                    <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Systematically optimized to align with APS frameworks and selection criteria for maximum impact.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 md:mt-16">
                    <Card className="group shadow-zinc-950/5 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Target
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">APS Framework Alignment</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm text-gray-600">Systematically considers every possible scenario to perfectly align your experience with APS frameworks—including ILS, WLS, and selection criteria.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Zap
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Selection Criteria Optimization</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm text-gray-600">Intelligently adapts your experience to address selection criteria, explicitly highlighting your suitability and reducing risk of automatic rejection.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <FileText
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Structured STAR Responses</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm text-gray-600">Automatically organises your experience into persuasive STAR method narratives (Situation, Task, Action, Result) that APS recruiters expect.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Sparkles
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Professional APS Tone</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm text-gray-600">Uses human sounding, formal, targeted language designed specifically to resonate with APS recruiters, enhancing readability and credibility.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Shield
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Secure and Confidential</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm text-gray-600">Employs rigorous encryption and stringent privacy measures, ensuring your personal data remains confidential and secure at all times.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Settings2
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">AI-Powered Optimization</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm text-gray-600">Advanced AI technology analyzes and optimizes your content for maximum impact, ensuring every word contributes to your success.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:bg-white/5 dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
        <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
        />
        <div
            aria-hidden
            className="bg-radial to-background absolute inset-0 from-transparent to-75%"
        />
        <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">{children}</div>
    </div>
)
