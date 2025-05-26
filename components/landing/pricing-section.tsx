/*
Pricing section component with Stripe integration and authentication handling.
*/

"use server"

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PricingSectionProps {
    userId: string | null
}

export async function PricingSection({ userId }: PricingSectionProps) {
    return (
        <div className="bg-muted relative py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-balance text-3xl font-semibold md:text-4xl lg:text-5xl">Pricing that scale with your business</h2>
                    <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-balance text-lg">Choose the perfect plan for your needs and start optimizing your workflow today</p>
                </div>
                <div className="relative mt-12 md:mt-20">
                    <Card className="relative mx-auto max-w-sm lg:max-w-full">
                        <div className="grid lg:grid-cols-3">
                            <div>
                                <CardHeader className="p-8">
                                    <CardTitle className="font-medium">Free</CardTitle>
                                    <span className="mb-0.5 mt-2 block text-2xl font-semibold">$0 / mo</span>
                                    <CardDescription className="text-sm">Per editor</CardDescription>
                                </CardHeader>
                                <div className="border-y px-8 py-4">
                                    <Button
                                        asChild
                                        className="w-full"
                                        variant="outline">
                                        <Link href={userId ? "/dashboard" : "/sign-up"}>Get Started</Link>
                                    </Button>
                                </div>

                                <ul
                                    role="list"
                                    className="space-y-3 p-8">
                                    {['Basic Analytics Dashboard', '5GB Cloud Storage', 'Email and Chat Support'].map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-2">
                                            <Check
                                                className="text-primary size-3"
                                                strokeWidth={3.5}
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="ring-foreground/10 bg-background rounded-lg lg:-my-3 -mx-1 border-transparent shadow ring-1">
                                <div className="relative px-1 lg:py-3 lg:px-0">
                                    <CardHeader className="p-8">
                                        <CardTitle className="font-medium">Pro</CardTitle>
                                        <span className="mb-0.5 mt-2 block text-2xl font-semibold">$19 / mo</span>
                                        <CardDescription className="text-sm">Per editor</CardDescription>
                                    </CardHeader>
                                    <div className="-mx-1 lg:mx-0 border-y px-8 py-4">
                                        <Button
                                            asChild
                                            className="w-full">
                                            <Link href={
                                                userId 
                                                    ? `${process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_SINGLEPITCH || "#"}?client_reference_id=${userId}`
                                                    : `/sign-up?redirect_url=${encodeURIComponent("/pricing")}`
                                            }>Get Started</Link>
                                        </Button>
                                    </div>

                                    <ul
                                        role="list"
                                        className="space-y-3 p-8">
                                        {['Everything in Free Plan', '5GB Cloud Storage', 'Email and Chat Support', 'Access to Community Forum', 'Single User Access', 'Access to Basic Templates', 'Mobile App Access', '1 Custom Report Per Month', 'Monthly Product Updates', 'Standard Security Features'].map((item, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center gap-2">
                                                <Check
                                                    className="text-primary size-3"
                                                    strokeWidth={3.5}
                                                />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <CardHeader className="p-8">
                                    <CardTitle className="font-medium">Pro Plus</CardTitle>
                                    <span className="mb-0.5 mt-2 block text-2xl font-semibold">$49 / mo</span>
                                    <CardDescription className="text-sm">Per editor</CardDescription>
                                </CardHeader>
                                <div className="border-y px-8 py-4">
                                    <Button
                                        asChild
                                        className="w-full"
                                        variant="outline">
                                        <Link href={
                                            userId 
                                                ? `${process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PROBUNDLE || "#"}?client_reference_id=${userId}`
                                                : `/sign-up?redirect_url=${encodeURIComponent("/pricing")}`
                                        }>Get Started</Link>
                                    </Button>
                                </div>

                                <ul
                                    role="list"
                                    className="space-y-3 p-8">
                                    {['Everything in Pro Plan', '5GB Cloud Storage', 'Email and Chat Support'].map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-2">
                                            <Check
                                                className="text-primary size-3"
                                                strokeWidth={3.5}
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}