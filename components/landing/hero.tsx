/*
Hero section component for the landing page with video and call-to-action.
*/

"use server"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export async function HeroSection() {
    return (
        <main className="overflow-hidden">
            <section>
                <div className="relative py-24">
                    <div className="mx-auto max-w-5xl px-6">
                        <div>
                            <h1 className="mt-8 max-w-2xl text-balance text-5xl font-bold lg:text-6xl">AI-Assisted APS Pitches</h1>
                            <p className="text-foreground my-6 max-w-2xl text-balance text-2xl">AI transforms your experience into interview-winning pitches. Zero stress, zero cost.</p>

                            <div className="flex flex-col items-center gap-3 *:w-full sm:flex-row sm:*:w-fit">
                                <Button
                                    asChild
                                    size="lg">
                                    <Link href="/sign-up">
                                        <span className="text-nowrap">Get Started For Free</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="mt-8">
                            <p className="text-muted-foreground font-medium">Trusted by Employees at:</p>
                            <div className="mt-4 flex items-center gap-12">
                                <div className="flex">
                                    <img
                                        className="mx-auto h-5 w-fit"
                                        src="https://html.tailus.io/blocks/customers/nvidia.svg"
                                        alt="Nvidia Logo"
                                        height="20"
                                        width="auto"
                                    />
                                </div>

                                <div className="flex">
                                    <img
                                        className="mx-auto h-4 w-fit"
                                        src="https://html.tailus.io/blocks/customers/column.svg"
                                        alt="Column Logo"
                                        height="16"
                                        width="auto"
                                    />
                                </div>
                                <div className="flex">
                                    <img
                                        className="mx-auto h-4 w-fit"
                                        src="https://html.tailus.io/blocks/customers/github.svg"
                                        alt="GitHub Logo"
                                        height="16"
                                        width="auto"
                                    />
                                </div>
                                <div className="flex">
                                    <img
                                        className="mx-auto h-5 w-fit"
                                        src="https://html.tailus.io/blocks/customers/nike.svg"
                                        alt="Nike Logo"
                                        height="20"
                                        width="auto"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="relative -mr-56 mt-16 sm:mr-0">
                            <div className="bg-background rounded-lg relative mx-auto overflow-hidden border border-transparent shadow-lg shadow-black/10 ring-1 ring-black/10">
                                <video
                                    className="w-full h-auto"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                >
                                    <source src="/landingpagev.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}